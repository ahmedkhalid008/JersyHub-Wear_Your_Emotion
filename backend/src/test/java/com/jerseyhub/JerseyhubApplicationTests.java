package com.jerseyhub;

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
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@ActiveProfiles("test")
class JerseyhubApplicationTests {

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
    void contextLoads() {
    }
}
