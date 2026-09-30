package com.jerseyhub.order;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jerseyhub.auth.RefreshTokenRepository;
import com.jerseyhub.auth.security.CustomUserDetailsService;
import com.jerseyhub.auth.security.JwtAuthenticationFilter;
import com.jerseyhub.auth.security.JwtTokenProvider;
import com.jerseyhub.auth.security.UserPrincipal;
import com.jerseyhub.common.config.CustomAccessDeniedHandler;
import com.jerseyhub.common.config.CustomAuthenticationEntryPoint;
import com.jerseyhub.common.config.SecurityConfig;
import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.GlobalExceptionHandler;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.order.dto.CheckoutRequest;
import com.jerseyhub.order.dto.OrderResponse;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = OrderController.class)
@Import({SecurityConfig.class, CustomAuthenticationEntryPoint.class, CustomAccessDeniedHandler.class, GlobalExceptionHandler.class})
class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private OrderService orderService;

    @MockitoBean
    private OrderPdfService orderPdfService;

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
    @DisplayName("POST /api/v1/orders/checkout - Should return 401 Unauthorized when unauthenticated")
    void checkout_Unauthenticated_Returns401() throws Exception {
        CheckoutRequest request = new CheckoutRequest(UUID.randomUUID());

        mockMvc.perform(post("/api/v1/orders/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_UNAUTHORIZED"));
    }

    @Test
    @DisplayName("POST /api/v1/orders/checkout - Should process checkout and return 201 Created")
    void checkout_Success() throws Exception {
        UUID addressId = UUID.randomUUID();
        CheckoutRequest request = new CheckoutRequest(addressId);
        UUID orderId = UUID.randomUUID();

        OrderResponse orderResponse = new OrderResponse(
                orderId, "JH-1001", mockUserPrincipal.getId(), OrderStatus.PENDING_PAYMENT,
                new BigDecimal("3000.00"), BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                new BigDecimal("3000.00"), "BDT", "John Customer", "01700000000",
                "Dhaka", "Dhaka", "Dhanmondi", "House 12, Road 5", "1205",
                Collections.emptyList(), Instant.now(), Instant.now()
        );

        given(orderService.checkout(eq(mockUserPrincipal.getId()), any(CheckoutRequest.class))).willReturn(orderResponse);

        mockMvc.perform(post("/api/v1/orders/checkout")
                        .with(user(mockUserPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(orderId.toString()))
                .andExpect(jsonPath("$.data.orderNumber").value("JH-1001"))
                .andExpect(jsonPath("$.data.status").value("PENDING_PAYMENT"));
    }

    @Test
    @DisplayName("POST /api/v1/orders/checkout - Should return 400 Bad Request when cart is empty")
    void checkout_EmptyCart_Returns400() throws Exception {
        CheckoutRequest request = new CheckoutRequest(UUID.randomUUID());

        given(orderService.checkout(eq(mockUserPrincipal.getId()), any(CheckoutRequest.class)))
                .willThrow(new BusinessException("Cart is empty", ErrorCode.CART_EMPTY.getCode()));

        mockMvc.perform(post("/api/v1/orders/checkout")
                        .with(user(mockUserPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_CART_EMPTY"));
    }

    @Test
    @DisplayName("GET /api/v1/orders - Should list user orders")
    void getUserOrders_Success() throws Exception {
        OrderResponse orderResponse = new OrderResponse(
                UUID.randomUUID(), "JH-1001", mockUserPrincipal.getId(), OrderStatus.PENDING_PAYMENT,
                new BigDecimal("3000.00"), BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                new BigDecimal("3000.00"), "BDT", "John Customer", "01700000000",
                "Dhaka", "Dhaka", "Dhanmondi", "House 12, Road 5", "1205",
                Collections.emptyList(), Instant.now(), Instant.now()
        );

        given(orderService.getUserOrders(eq(mockUserPrincipal.getId()))).willReturn(List.of(orderResponse));

        mockMvc.perform(get("/api/v1/orders").with(user(mockUserPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].orderNumber").value("JH-1001"));
    }

    @Test
    @DisplayName("GET /api/v1/orders/{id} - Should return 404 Not Found when order missing or belongs to another user")
    void getUserOrder_NotFound_Returns404() throws Exception {
        UUID randomId = UUID.randomUUID();
        given(orderService.getUserOrder(eq(mockUserPrincipal.getId()), eq(randomId)))
                .willThrow(new ResourceNotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND.getCode()));

        mockMvc.perform(get("/api/v1/orders/" + randomId).with(user(mockUserPrincipal)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_ORDER_NOT_FOUND"));
    }

    @Test
    @DisplayName("PATCH /api/v1/orders/{id}/cancel - Should cancel order")
    void cancelOrder_Success() throws Exception {
        UUID orderId = UUID.randomUUID();
        OrderResponse orderResponse = new OrderResponse(
                orderId, "JH-1001", mockUserPrincipal.getId(), OrderStatus.CANCELLED,
                new BigDecimal("3000.00"), BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                new BigDecimal("3000.00"), "BDT", "John Customer", "01700000000",
                "Dhaka", "Dhaka", "Dhanmondi", "House 12, Road 5", "1205",
                Collections.emptyList(), Instant.now(), Instant.now()
        );

        given(orderService.cancelOrder(eq(mockUserPrincipal.getId()), eq(orderId))).willReturn(orderResponse);

        mockMvc.perform(patch("/api/v1/orders/" + orderId + "/cancel").with(user(mockUserPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));
    }

    @Test
    @DisplayName("GET /api/v1/orders/{id}/invoice - Should return 200 OK with PDF bytes and attachment filename header")
    void getOrderInvoice_Success() throws Exception {
        UUID orderId = UUID.randomUUID();
        OrderResponse orderResponse = new OrderResponse(
                orderId, "JH-1001", mockUserPrincipal.getId(), OrderStatus.PAID,
                new BigDecimal("3000.00"), BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                new BigDecimal("3000.00"), "BDT", "John Customer", "01700000000",
                "Dhaka", "Dhaka", "Dhanmondi", "House 12, Road 5", "1205",
                Collections.emptyList(), Instant.now(), Instant.now()
        );
        byte[] mockPdfBytes = "%PDF-1.4 Mock PDF Content".getBytes();

        given(orderService.getUserOrder(eq(mockUserPrincipal.getId()), eq(orderId))).willReturn(orderResponse);
        given(orderPdfService.generateOrderInvoicePdf(eq(mockUserPrincipal.getId()), eq(orderId))).willReturn(mockPdfBytes);

        mockMvc.perform(get("/api/v1/orders/" + orderId + "/invoice").with(user(mockUserPrincipal)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string("Content-Disposition", "form-data; name=\"inline\"; filename=\"jerseyhub-order-JH-1001.pdf\""))
                .andExpect(content().bytes(mockPdfBytes));
    }

    @Test
    @DisplayName("GET /api/v1/orders/{id}/invoice - Should return 401 Unauthorized when unauthenticated")
    void getOrderInvoice_Unauthenticated_Returns401() throws Exception {
        UUID orderId = UUID.randomUUID();

        mockMvc.perform(get("/api/v1/orders/" + orderId + "/invoice"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_UNAUTHORIZED"));
    }

    @Test
    @DisplayName("GET /api/v1/orders/{id}/invoice - Should return 404 Not Found when order missing or belongs to another user")
    void getOrderInvoice_NotFound_Returns404() throws Exception {
        UUID randomId = UUID.randomUUID();
        given(orderService.getUserOrder(eq(mockUserPrincipal.getId()), eq(randomId)))
                .willThrow(new ResourceNotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND.getCode()));

        mockMvc.perform(get("/api/v1/orders/" + randomId + "/invoice").with(user(mockUserPrincipal)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_ORDER_NOT_FOUND"));
    }
}
