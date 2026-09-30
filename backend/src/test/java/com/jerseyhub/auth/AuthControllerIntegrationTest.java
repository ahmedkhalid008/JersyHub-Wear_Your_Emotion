package com.jerseyhub.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jerseyhub.auth.controller.AuthController;
import com.jerseyhub.auth.dto.AuthResponse;
import com.jerseyhub.auth.dto.LoginRequest;
import com.jerseyhub.auth.dto.RefreshTokenRequest;
import com.jerseyhub.auth.dto.RegisterRequest;
import com.jerseyhub.auth.dto.UserResponse;
import com.jerseyhub.auth.security.CustomUserDetailsService;
import com.jerseyhub.auth.security.JwtAuthenticationFilter;
import com.jerseyhub.auth.security.JwtTokenProvider;
import com.jerseyhub.auth.service.AuthService;
import com.jerseyhub.common.config.CustomAccessDeniedHandler;
import com.jerseyhub.common.config.CustomAuthenticationEntryPoint;
import com.jerseyhub.common.config.SecurityConfig;
import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.GlobalExceptionHandler;
import com.jerseyhub.user.UserRepository;
import com.jerseyhub.user.UserRole;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.doAnswer;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@Import({SecurityConfig.class, CustomAuthenticationEntryPoint.class, CustomAccessDeniedHandler.class, GlobalExceptionHandler.class})
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtTokenProvider tokenProvider;

    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private RefreshTokenRepository refreshTokenRepository;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setUp() throws Exception {
        doAnswer(invocation -> {
            HttpServletRequest req = invocation.getArgument(0);
            HttpServletResponse res = invocation.getArgument(1);
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(req, res);
            return null;
        }).when(jwtAuthenticationFilter).doFilter(any(), any(), any());
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - Should return 201 Created on successful registration")
    void register_Success() throws Exception {
        RegisterRequest request = new RegisterRequest("John Doe", "john.doe@example.com", "Password123!", "01700000000");
        UserResponse response = new UserResponse(UUID.randomUUID(), "John Doe", "john.doe@example.com", "01700000000", UserRole.CUSTOMER, true, false, Instant.now());

        given(authService.register(any(RegisterRequest.class))).willReturn(response);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("john.doe@example.com"))
                .andExpect(jsonPath("$.data.role").value("CUSTOMER"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - Should return 400 Bad Request on invalid request body")
    void register_InvalidPayload() throws Exception {
        RegisterRequest request = new RegisterRequest("", "invalid-email", "short", null);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_INVALID_REQUEST"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Should return 200 OK with tokens on successful login")
    void login_Success() throws Exception {
        LoginRequest request = new LoginRequest("john.doe@example.com", "Password123!");
        UserResponse userResponse = new UserResponse(UUID.randomUUID(), "John Doe", "john.doe@example.com", null, UserRole.CUSTOMER, true, false, Instant.now());
        AuthResponse response = AuthResponse.of("mock_access_token", "mock_refresh_token", 900000L, userResponse);

        given(authService.login(any(LoginRequest.class))).willReturn(response);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("mock_access_token"))
                .andExpect(jsonPath("$.data.refreshToken").value("mock_refresh_token"))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Should return 400 with generic ERR_INVALID_CREDENTIALS on bad credentials")
    void login_InvalidCredentials() throws Exception {
        LoginRequest request = new LoginRequest("john.doe@example.com", "WrongPassword!");

        given(authService.login(any(LoginRequest.class)))
                .willThrow(new BusinessException("Invalid email or password", ErrorCode.INVALID_CREDENTIALS.getCode()));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_INVALID_CREDENTIALS"))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/refresh - Should return 200 OK with new tokens on valid refresh request")
    void refresh_Success() throws Exception {
        RefreshTokenRequest request = new RefreshTokenRequest("valid_refresh_token");
        UserResponse userResponse = new UserResponse(UUID.randomUUID(), "John Doe", "john.doe@example.com", null, UserRole.CUSTOMER, true, false, Instant.now());
        AuthResponse response = AuthResponse.of("new_access_token", "new_refresh_token", 900000L, userResponse);

        given(authService.refreshToken(any(RefreshTokenRequest.class))).willReturn(response);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("new_access_token"))
                .andExpect(jsonPath("$.data.refreshToken").value("new_refresh_token"));
    }

    @Test
    @DisplayName("GET /api/v1/auth/me - Should return 401 Unauthorized when unauthenticated request calls protected endpoint")
    void getCurrentUser_Unauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_UNAUTHORIZED"));
    }
}
