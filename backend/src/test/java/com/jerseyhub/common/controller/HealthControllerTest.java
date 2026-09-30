package com.jerseyhub.common.controller;

import com.jerseyhub.auth.RefreshTokenRepository;
import com.jerseyhub.category.CategoryRepository;
import com.jerseyhub.inventory.InventoryTransactionRepository;
import com.jerseyhub.product.ProductImageRepository;
import com.jerseyhub.product.ProductRepository;
import com.jerseyhub.product.ProductVariantRepository;
import com.jerseyhub.cart.CartItemRepository;
import com.jerseyhub.cart.CartRepository;
import com.jerseyhub.order.OrderItemRepository;
import com.jerseyhub.order.OrderRepository;
import com.jerseyhub.payment.PaymentRepository;
import com.jerseyhub.review.ReviewRepository;
import com.jerseyhub.user.AddressRepository;
import com.jerseyhub.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private RefreshTokenRepository refreshTokenRepository;

    @MockitoBean
    private CategoryRepository categoryRepository;

    @MockitoBean
    private ProductRepository productRepository;

    @MockitoBean
    private ProductVariantRepository variantRepository;

    @MockitoBean
    private ProductImageRepository imageRepository;

    @MockitoBean
    private InventoryTransactionRepository transactionRepository;

    @MockitoBean
    private CartRepository cartRepository;

    @MockitoBean
    private CartItemRepository cartItemRepository;

    @MockitoBean
    private AddressRepository addressRepository;

    @MockitoBean
    private OrderRepository orderRepository;

    @MockitoBean
    private OrderItemRepository orderItemRepository;

    @MockitoBean
    private PaymentRepository paymentRepository;

    @MockitoBean
    private ReviewRepository reviewRepository;

    @MockitoBean
    private com.jerseyhub.coupon.CouponRepository couponRepository;

    @MockitoBean
    private com.jerseyhub.coupon.CouponUsageRepository couponUsageRepository;




    @Test
    void healthCheckShouldReturnSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/health")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("JerseyHub backend operational"))
                .andExpect(jsonPath("$.data.status").value("APPLICATION_UP"))
                .andExpect(jsonPath("$.data.application").value("JerseyHub Backend"));
    }
}
