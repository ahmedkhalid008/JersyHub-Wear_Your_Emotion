package com.jerseyhub.cart;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jerseyhub.auth.RefreshTokenRepository;
import com.jerseyhub.auth.security.CustomUserDetailsService;
import com.jerseyhub.auth.security.JwtAuthenticationFilter;
import com.jerseyhub.auth.security.JwtTokenProvider;
import com.jerseyhub.auth.security.UserPrincipal;
import com.jerseyhub.cart.dto.AddToCartRequest;
import com.jerseyhub.cart.dto.CartItemResponse;
import com.jerseyhub.cart.dto.CartResponse;
import com.jerseyhub.cart.dto.UpdateCartItemRequest;
import com.jerseyhub.common.config.CustomAccessDeniedHandler;
import com.jerseyhub.common.config.CustomAuthenticationEntryPoint;
import com.jerseyhub.common.config.SecurityConfig;
import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.GlobalExceptionHandler;
import com.jerseyhub.product.JerseySize;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CartController.class)
@Import({SecurityConfig.class, CustomAuthenticationEntryPoint.class, CustomAccessDeniedHandler.class, GlobalExceptionHandler.class})
class CartControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CartService cartService;

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
    @DisplayName("GET /api/v1/cart - Should return 401 Unauthorized when unauthenticated")
    void getCart_Unauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/cart"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_UNAUTHORIZED"));
    }

    @Test
    @DisplayName("GET /api/v1/cart - Should return 200 OK with cart for authenticated user")
    void getCart_Authenticated_Success() throws Exception {
        UUID cartId = UUID.randomUUID();
        CartResponse cartResponse = new CartResponse(cartId, mockUserPrincipal.getId(), Collections.emptyList(), BigDecimal.ZERO, 0, Instant.now(), Instant.now());

        given(cartService.getCart(eq(mockUserPrincipal.getId()))).willReturn(cartResponse);

        mockMvc.perform(get("/api/v1/cart").with(user(mockUserPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(cartId.toString()));
    }

    @Test
    @DisplayName("POST /api/v1/cart/items - Should add item and return 200 OK")
    void addItem_Success() throws Exception {
        UUID variantId = UUID.randomUUID();
        AddToCartRequest request = new AddToCartRequest(variantId, 2);

        CartItemResponse itemResponse = new CartItemResponse(
                UUID.randomUUID(), variantId, UUID.randomUUID(), "Real Madrid Jersey",
                "real-madrid-jersey", "RM-L", JerseySize.L, "http://image.url",
                new BigDecimal("1200.00"), 2, new BigDecimal("2400.00"), true, 10, true
        );
        CartResponse cartResponse = new CartResponse(
                UUID.randomUUID(), mockUserPrincipal.getId(), List.of(itemResponse),
                new BigDecimal("2400.00"), 2, Instant.now(), Instant.now()
        );

        given(cartService.addItem(eq(mockUserPrincipal.getId()), any(AddToCartRequest.class))).willReturn(cartResponse);

        mockMvc.perform(post("/api/v1/cart/items")
                        .with(user(mockUserPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.total").value(2400.00))
                .andExpect(jsonPath("$.data.totalItems").value(2));
    }

    @Test
    @DisplayName("POST /api/v1/cart/items - Should return 400 Bad Request when quantity is invalid")
    void addItem_InvalidQuantity_Returns400() throws Exception {
        AddToCartRequest request = new AddToCartRequest(UUID.randomUUID(), 0);

        mockMvc.perform(post("/api/v1/cart/items")
                        .with(user(mockUserPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_INVALID_REQUEST"));
    }

    @Test
    @DisplayName("POST /api/v1/cart/items - Should return 400 when stock is insufficient")
    void addItem_InsufficientStock_Returns400() throws Exception {
        AddToCartRequest request = new AddToCartRequest(UUID.randomUUID(), 50);

        given(cartService.addItem(eq(mockUserPrincipal.getId()), any(AddToCartRequest.class)))
                .willThrow(new BusinessException("Requested quantity exceeds available stock", ErrorCode.INSUFFICIENT_STOCK.getCode()));

        mockMvc.perform(post("/api/v1/cart/items")
                        .with(user(mockUserPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_INSUFFICIENT_STOCK"));
    }

    @Test
    @DisplayName("PATCH /api/v1/cart/items/{cartItemId} - Should update item quantity")
    void updateItemQuantity_Success() throws Exception {
        UUID cartItemId = UUID.randomUUID();
        UpdateCartItemRequest request = new UpdateCartItemRequest(5);
        CartResponse cartResponse = new CartResponse(
                UUID.randomUUID(), mockUserPrincipal.getId(), Collections.emptyList(),
                new BigDecimal("6000.00"), 5, Instant.now(), Instant.now()
        );

        given(cartService.updateItemQuantity(eq(mockUserPrincipal.getId()), eq(cartItemId), any(UpdateCartItemRequest.class))).willReturn(cartResponse);

        mockMvc.perform(patch("/api/v1/cart/items/" + cartItemId)
                        .with(user(mockUserPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("DELETE /api/v1/cart/items/{cartItemId} - Should remove cart item")
    void removeItem_Success() throws Exception {
        UUID cartItemId = UUID.randomUUID();
        CartResponse cartResponse = new CartResponse(
                UUID.randomUUID(), mockUserPrincipal.getId(), Collections.emptyList(),
                BigDecimal.ZERO, 0, Instant.now(), Instant.now()
        );

        given(cartService.removeItem(eq(mockUserPrincipal.getId()), eq(cartItemId))).willReturn(cartResponse);

        mockMvc.perform(delete("/api/v1/cart/items/" + cartItemId).with(user(mockUserPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("DELETE /api/v1/cart - Should clear cart")
    void clearCart_Success() throws Exception {
        CartResponse cartResponse = new CartResponse(
                UUID.randomUUID(), mockUserPrincipal.getId(), Collections.emptyList(),
                BigDecimal.ZERO, 0, Instant.now(), Instant.now()
        );

        given(cartService.clearCart(eq(mockUserPrincipal.getId()))).willReturn(cartResponse);

        mockMvc.perform(delete("/api/v1/cart").with(user(mockUserPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
