package com.jerseyhub.coupon;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jerseyhub.auth.RefreshTokenRepository;
import com.jerseyhub.auth.security.CustomUserDetailsService;
import com.jerseyhub.auth.security.JwtAuthenticationFilter;
import com.jerseyhub.auth.security.JwtTokenProvider;
import com.jerseyhub.auth.security.UserPrincipal;
import com.jerseyhub.common.config.CustomAccessDeniedHandler;
import com.jerseyhub.common.config.CustomAuthenticationEntryPoint;
import com.jerseyhub.common.config.SecurityConfig;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.GlobalExceptionHandler;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.coupon.dto.ApplyCouponRequest;
import com.jerseyhub.coupon.dto.CouponApplyResponse;
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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.doAnswer;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CouponController.class)
@Import({SecurityConfig.class, CustomAuthenticationEntryPoint.class, CustomAccessDeniedHandler.class, GlobalExceptionHandler.class})
class CouponControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CouponService couponService;

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

    private UserPrincipal mockCustomer;

    @BeforeEach
    void setUp() throws Exception {
        mockCustomer = new UserPrincipal(
                UUID.randomUUID(),
                "John Customer",
                "john@example.com",
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
    @DisplayName("POST /api/v1/cart/coupon - Should return 401 Unauthorized when unauthenticated")
    void applyCoupon_Unauthenticated_Returns401() throws Exception {
        ApplyCouponRequest request = new ApplyCouponRequest("WELCOME10");

        mockMvc.perform(post("/api/v1/cart/coupon")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_UNAUTHORIZED"));
    }

    @Test
    @DisplayName("POST /api/v1/cart/coupon - Should apply valid coupon and return 200 OK")
    void applyCoupon_Success() throws Exception {
        ApplyCouponRequest request = new ApplyCouponRequest("WELCOME10");
        CouponApplyResponse applyResponse = new CouponApplyResponse(
                "WELCOME10", CouponDiscountType.PERCENTAGE, new BigDecimal("300.00"),
                new BigDecimal("3000.00"), new BigDecimal("100.00"), new BigDecimal("2800.00")
        );

        given(couponService.applyCouponToCart(eq(mockCustomer.getId()), any(ApplyCouponRequest.class))).willReturn(applyResponse);

        mockMvc.perform(post("/api/v1/cart/coupon")
                        .with(user(mockCustomer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.couponCode").value("WELCOME10"))
                .andExpect(jsonPath("$.data.discountAmount").value(300.00))
                .andExpect(jsonPath("$.data.totalAfterDiscount").value(2800.00));
    }

    @Test
    @DisplayName("POST /api/v1/cart/coupon - Should return 404 Not Found for nonexistent coupon code")
    void applyCoupon_InvalidCode_Returns404() throws Exception {
        ApplyCouponRequest request = new ApplyCouponRequest("INVALID99");

        given(couponService.applyCouponToCart(eq(mockCustomer.getId()), any(ApplyCouponRequest.class)))
                .willThrow(new ResourceNotFoundException("Coupon not found", ErrorCode.COUPON_NOT_FOUND.getCode()));

        mockMvc.perform(post("/api/v1/cart/coupon")
                        .with(user(mockCustomer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_COUPON_NOT_FOUND"));
    }

    @Test
    @DisplayName("DELETE /api/v1/cart/coupon - Should remove coupon from cart (200 OK)")
    void removeCoupon_Success() throws Exception {
        mockMvc.perform(delete("/api/v1/cart/coupon").with(user(mockCustomer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
