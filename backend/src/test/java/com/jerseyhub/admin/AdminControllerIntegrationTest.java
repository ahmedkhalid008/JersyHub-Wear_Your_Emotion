package com.jerseyhub.admin;

import com.jerseyhub.admin.dto.AdminDashboardSummaryResponse;
import com.jerseyhub.admin.dto.AdminOrderDetailResponse;
import com.jerseyhub.admin.dto.AdminOrderSummaryResponse;
import com.jerseyhub.admin.dto.AdminProductResponse;
import com.jerseyhub.admin.dto.AdminUserResponse;
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
import com.jerseyhub.common.response.PageResponse;
import com.jerseyhub.order.OrderStatus;
import com.jerseyhub.payment.PaymentStatus;
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
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.doAnswer;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AdminController.class)
@Import({SecurityConfig.class, CustomAuthenticationEntryPoint.class, CustomAccessDeniedHandler.class, GlobalExceptionHandler.class})
class AdminControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminService adminService;

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
    @DisplayName("GET /api/v1/admin/dashboard/summary - Should return 401 Unauthorized when unauthenticated")
    void getDashboardSummary_Unauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard/summary"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_UNAUTHORIZED"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/dashboard/summary - Should return 403 Forbidden for CUSTOMER role")
    void getDashboardSummary_CustomerRole_Returns403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard/summary").with(user(customerPrincipal)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_FORBIDDEN"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/dashboard/summary - Should return 200 OK for ADMIN role")
    void getDashboardSummary_AdminRole_Returns200() throws Exception {
        AdminDashboardSummaryResponse summaryResponse = new AdminDashboardSummaryResponse(
                10L, 25L, 50L, 5L, 10L, 15L, 18L, 2L, new BigDecimal("75000.00")
        );

        given(adminService.getDashboardSummary()).willReturn(summaryResponse);

        mockMvc.perform(get("/api/v1/admin/dashboard/summary").with(user(adminPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalUsers").value(10))
                .andExpect(jsonPath("$.data.totalProducts").value(25))
                .andExpect(jsonPath("$.data.totalOrders").value(50))
                .andExpect(jsonPath("$.data.totalSuccessfulRevenue").value(75000.00));
    }

    @Test
    @DisplayName("GET /api/v1/admin/orders - Should list paginated orders for ADMIN role")
    void getOrders_AdminRole_Returns200() throws Exception {
        AdminOrderSummaryResponse orderSummary = new AdminOrderSummaryResponse(
                UUID.randomUUID(), "JH-1001", customerPrincipal.getId(), "John Customer",
                "customer@example.com", OrderStatus.PAID, PaymentStatus.SUCCESS,
                new BigDecimal("3000.00"), "BDT", 2, Instant.now()
        );

        PageResponse<AdminOrderSummaryResponse> pageResponse = PageResponse.from(
                new PageImpl<>(List.of(orderSummary), PageRequest.of(0, 20), 1)
        );

        given(adminService.getOrders(eq(null), any())).willReturn(pageResponse);

        mockMvc.perform(get("/api/v1/admin/orders").with(user(adminPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].orderNumber").value("JH-1001"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/orders/{id} - Should return 200 OK for ADMIN inspecting customer order")
    void getOrderById_AdminRole_Returns200() throws Exception {
        UUID orderId = UUID.randomUUID();
        AdminOrderDetailResponse detailResponse = new AdminOrderDetailResponse(
                orderId, "JH-1001", customerPrincipal.getId(), "John Customer", "customer@example.com",
                OrderStatus.PAID, new BigDecimal("3000.00"), BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                new BigDecimal("3000.00"), "BDT", "John Customer", "01700000000", "Dhaka", "Dhaka",
                "Dhanmondi", "Road 5", "1205", Collections.emptyList(), null, Instant.now(), Instant.now()
        );

        given(adminService.getOrderById(eq(orderId))).willReturn(detailResponse);

        mockMvc.perform(get("/api/v1/admin/orders/" + orderId).with(user(adminPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(orderId.toString()));
    }

    @Test
    @DisplayName("GET /api/v1/admin/orders/{id} - Should return 404 Not Found when order missing")
    void getOrderById_NotFound_Returns404() throws Exception {
        UUID randomId = UUID.randomUUID();
        given(adminService.getOrderById(eq(randomId)))
                .willThrow(new ResourceNotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND.getCode()));

        mockMvc.perform(get("/api/v1/admin/orders/" + randomId).with(user(adminPrincipal)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_ORDER_NOT_FOUND"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/users - Should return 403 Forbidden for CUSTOMER role")
    void getUsers_CustomerRole_Returns403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users").with(user(customerPrincipal)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_FORBIDDEN"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/users - Should return safe paginated users list for ADMIN role")
    void getUsers_AdminRole_Returns200() throws Exception {
        AdminUserResponse userResponse = new AdminUserResponse(
                customerPrincipal.getId(), "John Customer", "customer@example.com", "01700000000",
                UserRole.CUSTOMER, true, true, Instant.now(), Instant.now()
        );

        PageResponse<AdminUserResponse> pageResponse = PageResponse.from(
                new PageImpl<>(List.of(userResponse), PageRequest.of(0, 20), 1)
        );

        given(adminService.getUsers(any())).willReturn(pageResponse);

        mockMvc.perform(get("/api/v1/admin/users").with(user(adminPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].email").value("customer@example.com"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/users/{id} - Should return safe user profile for ADMIN role")
    void getUserById_AdminRole_Returns200() throws Exception {
        UUID userId = customerPrincipal.getId();
        AdminUserResponse userResponse = new AdminUserResponse(
                userId, "John Customer", "customer@example.com", "01700000000",
                UserRole.CUSTOMER, true, true, Instant.now(), Instant.now()
        );

        given(adminService.getUserById(eq(userId))).willReturn(userResponse);

        mockMvc.perform(get("/api/v1/admin/users/" + userId).with(user(adminPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(userId.toString()))
                .andExpect(jsonPath("$.data.email").value("customer@example.com"));
    }
}
