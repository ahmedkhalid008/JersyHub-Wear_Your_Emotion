package com.jerseyhub.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jerseyhub.admin.dto.AdminDashboardSummaryResponse;
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
import com.jerseyhub.coupon.CouponAdminController;
import com.jerseyhub.coupon.CouponDiscountType;
import com.jerseyhub.coupon.CouponService;
import com.jerseyhub.coupon.dto.CouponCreateRequest;
import com.jerseyhub.coupon.dto.CouponResponse;
import com.jerseyhub.review.ReviewAdminController;
import com.jerseyhub.review.ReviewService;
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
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.doAnswer;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {AdminController.class, ReviewAdminController.class, CouponAdminController.class})
@Import({SecurityConfig.class, CustomAuthenticationEntryPoint.class, CustomAccessDeniedHandler.class, GlobalExceptionHandler.class})
class AdminAuthorizationMatrixTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AdminService adminService;

    @MockitoBean
    private ReviewService reviewService;

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
                UUID.randomUUID(), "Customer User", "customer@example.com", "password",
                UserRole.CUSTOMER, true, List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );

        adminPrincipal = new UserPrincipal(
                UUID.randomUUID(), "Admin User", "admin@jerseyhub.com", "password",
                UserRole.ADMIN, true, List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
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
    @DisplayName("GET /api/v1/admin/dashboard/summary - Matrix: Unauthenticated -> 401, Customer -> 403, Admin -> 200")
    void adminDashboard_SecurityMatrix() throws Exception {
        // Unauthenticated -> 401
        mockMvc.perform(get("/api/v1/admin/dashboard/summary"))
                .andExpect(status().isUnauthorized());

        // Customer -> 403
        mockMvc.perform(get("/api/v1/admin/dashboard/summary").with(user(customerPrincipal)))
                .andExpect(status().isForbidden());

        // Admin -> 200
        AdminDashboardSummaryResponse mockSummary = new AdminDashboardSummaryResponse(10, 20, 5, 2, 1, 1, 1, 0, new BigDecimal("15000.00"));
        given(adminService.getDashboardSummary()).willReturn(mockSummary);
        mockMvc.perform(get("/api/v1/admin/dashboard/summary").with(user(adminPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("GET /api/v1/admin/coupons - Matrix: Unauthenticated -> 401, Customer -> 403, Admin -> 200 with Pagination")
    void adminCoupons_SecurityMatrix_AndPagination() throws Exception {
        // Unauthenticated -> 401
        mockMvc.perform(get("/api/v1/admin/coupons"))
                .andExpect(status().isUnauthorized());

        // Customer -> 403
        mockMvc.perform(get("/api/v1/admin/coupons").with(user(customerPrincipal)))
                .andExpect(status().isForbidden());

        // Admin -> 200
        PageResponse<CouponResponse> emptyPage = new PageResponse<>(List.of(), 0, 10, 0L, 0, true, true);
        given(couponService.getCoupons(any(Pageable.class))).willReturn(emptyPage);

        mockMvc.perform(get("/api/v1/admin/coupons?page=0&size=10").with(user(adminPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/admin/coupons - Matrix: Customer -> 403, Admin -> 201 Created")
    void createCoupon_SecurityMatrix() throws Exception {
        CouponCreateRequest request = new CouponCreateRequest(
                "MATRIX10", "Matrix Coupon", CouponDiscountType.PERCENTAGE,
                new BigDecimal("10.00"), new BigDecimal("500.00"), new BigDecimal("100.00"),
                100, 1, Instant.now(), Instant.now().plusSeconds(86400), true
        );

        // Customer -> 403
        mockMvc.perform(post("/api/v1/admin/coupons")
                        .with(user(customerPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

        // Admin -> 201 Created
        CouponResponse createdResponse = new CouponResponse(
                UUID.randomUUID(), "MATRIX10", "Matrix Coupon", CouponDiscountType.PERCENTAGE,
                new BigDecimal("10.00"), new BigDecimal("500.00"), new BigDecimal("100.00"),
                100, 0, 1, Instant.now(), Instant.now().plusSeconds(86400), true, Instant.now(), Instant.now()
        );
        given(couponService.createCoupon(any(CouponCreateRequest.class))).willReturn(createdResponse);

        mockMvc.perform(post("/api/v1/admin/coupons")
                        .with(user(adminPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.code").value("MATRIX10"));
    }
}
