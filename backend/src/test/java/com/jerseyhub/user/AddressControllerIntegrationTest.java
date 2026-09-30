package com.jerseyhub.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jerseyhub.auth.RefreshTokenRepository;
import com.jerseyhub.auth.security.CustomUserDetailsService;
import com.jerseyhub.auth.security.JwtAuthenticationFilter;
import com.jerseyhub.auth.security.JwtTokenProvider;
import com.jerseyhub.auth.security.UserPrincipal;
import com.jerseyhub.common.config.CustomAccessDeniedHandler;
import com.jerseyhub.common.config.CustomAuthenticationEntryPoint;
import com.jerseyhub.common.config.SecurityConfig;
import com.jerseyhub.common.exception.GlobalExceptionHandler;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.user.dto.AddressRequest;
import com.jerseyhub.user.dto.AddressResponse;
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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.doAnswer;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AddressController.class)
@Import({SecurityConfig.class, CustomAuthenticationEntryPoint.class, CustomAccessDeniedHandler.class, GlobalExceptionHandler.class})
class AddressControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AddressService addressService;

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

    private UserPrincipal mockUserPrincipal;

    @BeforeEach
    void setUp() throws Exception {
        mockUserPrincipal = new UserPrincipal(
                UUID.randomUUID(),
                "John Doe",
                "john.doe@example.com",
                "password",
                UserRole.CUSTOMER,
                true,
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );

        doAnswer(invocation -> {
            HttpServletRequest req = invocation.getArgument(0);
            HttpServletResponse res = invocation.getArgument(1);
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(req, res);
            return null;
        }).when(jwtAuthenticationFilter).doFilter(any(), any(), any());
    }

    @Test
    @DisplayName("GET /api/v1/addresses - Should return 401 Unauthorized when unauthenticated")
    void getAddresses_Unauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/addresses"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_UNAUTHORIZED"));
    }

    @Test
    @DisplayName("POST /api/v1/addresses - Should create address and return 201 Created")
    void createAddress_Success() throws Exception {
        AddressRequest request = new AddressRequest(
                "John Doe", "01700000000", "Dhaka", "Dhaka", "Dhanmondi", "House 12, Road 5", "1205", true
        );
        UUID addressId = UUID.randomUUID();
        AddressResponse response = new AddressResponse(
                addressId, "John Doe", "01700000000", "Dhaka", "Dhaka", "Dhanmondi", "House 12, Road 5", "1205", true, Instant.now(), Instant.now()
        );

        given(addressService.createAddress(eq(mockUserPrincipal.getId()), any(AddressRequest.class))).willReturn(response);

        mockMvc.perform(post("/api/v1/addresses")
                        .with(user(mockUserPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(addressId.toString()))
                .andExpect(jsonPath("$.data.recipientName").value("John Doe"));
    }

    @Test
    @DisplayName("GET /api/v1/addresses - Should list current user addresses")
    void getAddresses_Success() throws Exception {
        UUID addressId = UUID.randomUUID();
        AddressResponse response = new AddressResponse(
                addressId, "John Doe", "01700000000", "Dhaka", "Dhaka", "Dhanmondi", "House 12, Road 5", "1205", true, Instant.now(), Instant.now()
        );

        given(addressService.getAddresses(eq(mockUserPrincipal.getId()))).willReturn(List.of(response));

        mockMvc.perform(get("/api/v1/addresses").with(user(mockUserPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(addressId.toString()));
    }

    @Test
    @DisplayName("GET /api/v1/addresses/{id} - Should return 404 when address is not found or belongs to another user")
    void getAddress_NotFound_Returns404() throws Exception {
        UUID randomId = UUID.randomUUID();
        given(addressService.getAddress(eq(mockUserPrincipal.getId()), eq(randomId)))
                .willThrow(new ResourceNotFoundException("Address not found"));

        mockMvc.perform(get("/api/v1/addresses/" + randomId).with(user(mockUserPrincipal)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_RESOURCE_NOT_FOUND"));
    }

    @Test
    @DisplayName("PUT /api/v1/addresses/{id} - Should update address")
    void updateAddress_Success() throws Exception {
        UUID addressId = UUID.randomUUID();
        AddressRequest request = new AddressRequest(
                "Jane Doe", "01800000000", "Dhaka", "Dhaka", "Gulshan", "House 99, Road 11", "1212", true
        );
        AddressResponse response = new AddressResponse(
                addressId, "Jane Doe", "01800000000", "Dhaka", "Dhaka", "Gulshan", "House 99, Road 11", "1212", true, Instant.now(), Instant.now()
        );

        given(addressService.updateAddress(eq(mockUserPrincipal.getId()), eq(addressId), any(AddressRequest.class))).willReturn(response);

        mockMvc.perform(put("/api/v1/addresses/" + addressId)
                        .with(user(mockUserPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.recipientName").value("Jane Doe"));
    }

    @Test
    @DisplayName("DELETE /api/v1/addresses/{id} - Should delete address")
    void deleteAddress_Success() throws Exception {
        UUID addressId = UUID.randomUUID();

        mockMvc.perform(delete("/api/v1/addresses/" + addressId).with(user(mockUserPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("PATCH /api/v1/addresses/{id}/default - Should set default address")
    void setDefaultAddress_Success() throws Exception {
        UUID addressId = UUID.randomUUID();
        AddressResponse response = new AddressResponse(
                addressId, "John Doe", "01700000000", "Dhaka", "Dhaka", "Dhanmondi", "House 12, Road 5", "1205", true, Instant.now(), Instant.now()
        );

        given(addressService.setDefaultAddress(eq(mockUserPrincipal.getId()), eq(addressId))).willReturn(response);

        mockMvc.perform(patch("/api/v1/addresses/" + addressId + "/default").with(user(mockUserPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.isDefault").value(true));
    }
}
