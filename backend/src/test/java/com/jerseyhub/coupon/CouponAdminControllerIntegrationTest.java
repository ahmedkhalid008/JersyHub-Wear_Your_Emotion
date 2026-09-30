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
import com.jerseyhub.common.exception.GlobalExceptionHandler;
import com.jerseyhub.common.response.PageResponse;
import com.jerseyhub.coupon.dto.CouponCreateRequest;
import com.jerseyhub.coupon.dto.CouponResponse;
import com.jerseyhub.coupon.dto.CouponUpdateRequest;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.doAnswer;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CouponAdminController.class)
@Import({SecurityConfig.class, CustomAuthenticationEntryPoint.class, CustomAccessDeniedHandler.class, GlobalExceptionHandler.class})
class CouponAdminControllerIntegrationTest {

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

    private UserPrincipal customerPrincipal;
    private UserPrincipal adminPrincipal;

    @BeforeEach
    void setUp() throws Exception {
        customerPrincipal = new UserPrincipal(
                UUID.randomUUID(),
                "John Customer",
                "customer@example.com",
                "password",
                UserRole.CUSTOMER,
                true,
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );

        adminPrincipal = new UserPrincipal(
                UUID.randomUUID(),
                "Admin Boss",
                "admin@jerseyhub.com",
                "password",
                UserRole.ADMIN,
                true,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
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
    @DisplayName("POST /api/v1/admin/coupons - Should return 401 Unauthorized when unauthenticated")
    void createCoupon_Unauthenticated_Returns401() throws Exception {
        CouponCreateRequest request = new CouponCreateRequest(
                "WELCOME10", "10% Off", CouponDiscountType.PERCENTAGE, new BigDecimal("10.00"),
                BigDecimal.ZERO, new BigDecimal("500.00"), 100, 1, null, null, true
        );

        mockMvc.perform(post("/api/v1/admin/coupons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_UNAUTHORIZED"));
    }

    @Test
    @DisplayName("POST /api/v1/admin/coupons - Should return 403 Forbidden for CUSTOMER role")
    void createCoupon_CustomerRole_Returns403() throws Exception {
        CouponCreateRequest request = new CouponCreateRequest(
                "WELCOME10", "10% Off", CouponDiscountType.PERCENTAGE, new BigDecimal("10.00"),
                BigDecimal.ZERO, new BigDecimal("500.00"), 100, 1, null, null, true
        );

        mockMvc.perform(post("/api/v1/admin/coupons")
                        .with(user(customerPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_FORBIDDEN"));
    }

    @Test
    @DisplayName("POST /api/v1/admin/coupons - Should create coupon for ADMIN role (201 Created)")
    void createCoupon_AdminRole_Returns201() throws Exception {
        CouponCreateRequest request = new CouponCreateRequest(
                "WELCOME10", "10% Off", CouponDiscountType.PERCENTAGE, new BigDecimal("10.00"),
                BigDecimal.ZERO, new BigDecimal("500.00"), 100, 1, null, null, true
        );
        UUID couponId = UUID.randomUUID();
        CouponResponse couponResponse = new CouponResponse(
                couponId, "WELCOME10", "10% Off", CouponDiscountType.PERCENTAGE, new BigDecimal("10.00"),
                BigDecimal.ZERO, new BigDecimal("500.00"), 100, 0, 1, null, null, true, Instant.now(), Instant.now()
        );

        given(couponService.createCoupon(any(CouponCreateRequest.class))).willReturn(couponResponse);

        mockMvc.perform(post("/api/v1/admin/coupons")
                        .with(user(adminPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(couponId.toString()))
                .andExpect(jsonPath("$.data.code").value("WELCOME10"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/coupons - Should list coupons for ADMIN role (200 OK)")
    void getCoupons_AdminRole_Returns200() throws Exception {
        CouponResponse couponResponse = new CouponResponse(
                UUID.randomUUID(), "WELCOME10", "10% Off", CouponDiscountType.PERCENTAGE, new BigDecimal("10.00"),
                BigDecimal.ZERO, new BigDecimal("500.00"), 100, 0, 1, null, null, true, Instant.now(), Instant.now()
        );

        PageResponse<CouponResponse> pageResponse = PageResponse.from(
                new PageImpl<>(List.of(couponResponse), PageRequest.of(0, 20), 1)
        );

        given(couponService.getCoupons(any())).willReturn(pageResponse);

        mockMvc.perform(get("/api/v1/admin/coupons").with(user(adminPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].code").value("WELCOME10"));
    }

    @Test
    @DisplayName("PATCH /api/v1/admin/coupons/{id}/activate - Should activate coupon for ADMIN role")
    void activateCoupon_AdminRole_Returns200() throws Exception {
        UUID couponId = UUID.randomUUID();
        CouponResponse couponResponse = new CouponResponse(
                couponId, "WELCOME10", "10% Off", CouponDiscountType.PERCENTAGE, new BigDecimal("10.00"),
                BigDecimal.ZERO, new BigDecimal("500.00"), 100, 0, 1, null, null, true, Instant.now(), Instant.now()
        );

        given(couponService.setCouponActive(eq(couponId), eq(true))).willReturn(couponResponse);

        mockMvc.perform(patch("/api/v1/admin/coupons/" + couponId + "/activate").with(user(adminPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.active").value(true));
    }
}
