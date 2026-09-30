package com.jerseyhub.order;

import com.jerseyhub.cart.Cart;
import com.jerseyhub.cart.CartItem;
import com.jerseyhub.cart.CartRepository;
import com.jerseyhub.coupon.Coupon;
import com.jerseyhub.coupon.CouponDiscountType;
import com.jerseyhub.coupon.CouponRepository;
import com.jerseyhub.coupon.CouponService;
import com.jerseyhub.coupon.CouponUsage;
import com.jerseyhub.coupon.CouponUsageRepository;
import com.jerseyhub.inventory.InventoryTransactionRepository;
import com.jerseyhub.order.dto.CheckoutRequest;
import com.jerseyhub.order.dto.OrderResponse;
import com.jerseyhub.product.JerseySize;
import com.jerseyhub.product.Product;
import com.jerseyhub.product.ProductVariant;
import com.jerseyhub.product.ProductVariantRepository;
import com.jerseyhub.user.Address;
import com.jerseyhub.user.AddressRepository;
import com.jerseyhub.user.User;
import com.jerseyhub.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class CheckoutE2EIntegrationTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private ProductVariantRepository variantRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private CouponUsageRepository couponUsageRepository;

    @Mock
    private CouponService couponService;

    @InjectMocks
    private OrderService orderService;

    private UUID userId;
    private UUID addressId;
    private UUID variantId;
    private User sampleUser;
    private Address sampleAddress;
    private Product sampleProduct;
    private ProductVariant sampleVariant;
    private Cart sampleCart;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        addressId = UUID.randomUUID();
        variantId = UUID.randomUUID();

        sampleUser = new User();
        sampleUser.setId(userId);
        sampleUser.setName("John Customer");
        sampleUser.setEmail("customer@example.com");

        sampleAddress = new Address();
        sampleAddress.setId(addressId);
        sampleAddress.setUser(sampleUser);
        sampleAddress.setRecipientName("John Customer");
        sampleAddress.setPhone("01700000000");
        sampleAddress.setDivision("Dhaka");
        sampleAddress.setDistrict("Dhaka");
        sampleAddress.setArea("Dhanmondi");
        sampleAddress.setAddressLine("House 12, Road 5");
        sampleAddress.setPostalCode("1205");

        sampleProduct = new Product();
        sampleProduct.setId(UUID.randomUUID());
        sampleProduct.setName("Argentina World Cup Jersey");
        sampleProduct.setActive(true);

        sampleVariant = new ProductVariant(sampleProduct, "ARG-WC-L", JerseySize.L, new BigDecimal("3000.00"), 10);
        sampleVariant.setId(variantId);
        sampleVariant.setActive(true);

        sampleCart = new Cart(sampleUser);
        CartItem cartItem = new CartItem(sampleCart, sampleVariant, 1);
        sampleCart.addItem(cartItem);
    }

    @Test
    @DisplayName("Complete Checkout E2E without Coupon (Subtotal < 2000): Subtotal (1500) + Shipping (100) = Total (1600), Cart cleared")
    void e2eCheckout_WithoutCoupon_StandardShipping_Success() {
        sampleVariant.setPrice(new BigDecimal("1500.00"));
        CheckoutRequest request = new CheckoutRequest(addressId, null);

        given(userRepository.findById(userId)).willReturn(Optional.of(sampleUser));
        given(cartRepository.findByUserIdWithItems(userId)).willReturn(Optional.of(sampleCart));
        given(addressRepository.findByUserIdAndId(userId, addressId)).willReturn(Optional.of(sampleAddress));
        given(variantRepository.findAllByIdWithLock(any())).willReturn(List.of(sampleVariant));
        given(orderRepository.save(any(Order.class))).willAnswer(inv -> {
            Order order = inv.getArgument(0);
            order.setId(UUID.randomUUID());
            order.setOrderNumber("JH-E2E-1001");
            return order;
        });

        OrderResponse response = orderService.checkout(userId, request);

        assertThat(response).isNotNull();
        assertThat(response.subtotal()).isEqualTo(new BigDecimal("1500.00"));
        assertThat(response.discountAmount()).isEqualTo(BigDecimal.ZERO);
        assertThat(response.shippingAmount()).isEqualTo(new BigDecimal("100.00"));
        assertThat(response.totalAmount()).isEqualTo(new BigDecimal("1600.00"));
        assertThat(response.orderNumber()).isEqualTo("JH-E2E-1001");

        // Verify cart cleared
        assertThat(sampleCart.getItems()).isEmpty();
        verify(cartRepository).save(sampleCart);
        // Verify inventory deducted from 10 to 9
        assertThat(sampleVariant.getStockQuantity()).isEqualTo(9);
    }

    @Test
    @DisplayName("Complete Checkout E2E with Coupon (Subtotal >= 2000): Subtotal (3000) - Discount (300) + Shipping (0) = Total (2700)")
    void e2eCheckout_WithCoupon_FreeShipping_Success() {
        CheckoutRequest request = new CheckoutRequest(addressId, "WELCOME10");

        Coupon coupon = new Coupon();
        coupon.setId(UUID.randomUUID());
        coupon.setCode("WELCOME10");
        coupon.setDiscountType(CouponDiscountType.PERCENTAGE);
        coupon.setDiscountValue(new BigDecimal("10.00"));
        coupon.setActive(true);

        given(userRepository.findById(userId)).willReturn(Optional.of(sampleUser));
        given(cartRepository.findByUserIdWithItems(userId)).willReturn(Optional.of(sampleCart));
        given(addressRepository.findByUserIdAndId(userId, addressId)).willReturn(Optional.of(sampleAddress));
        given(variantRepository.findAllByIdWithLock(any())).willReturn(List.of(sampleVariant));
        given(couponRepository.findByCodeWithLock("WELCOME10")).willReturn(Optional.of(coupon));
        given(couponService.validateAndCalculateDiscount(coupon, userId, new BigDecimal("3000.00"))).willReturn(new BigDecimal("300.00"));
        given(orderRepository.save(any(Order.class))).willAnswer(inv -> {
            Order order = inv.getArgument(0);
            order.setId(UUID.randomUUID());
            order.setOrderNumber("JH-E2E-1002");
            return order;
        });

        OrderResponse response = orderService.checkout(userId, request);

        assertThat(response).isNotNull();
        assertThat(response.subtotal()).isEqualTo(new BigDecimal("3000.00"));
        assertThat(response.discountAmount()).isEqualTo(new BigDecimal("300.00"));
        assertThat(response.shippingAmount()).isEqualTo(BigDecimal.ZERO);
        assertThat(response.totalAmount()).isEqualTo(new BigDecimal("2700.00"));

        verify(couponService).recordCouponUsage(any(Coupon.class), any(User.class), any(Order.class), any(BigDecimal.class));
        assertThat(sampleCart.getItems()).isEmpty();
        verify(cartRepository).save(sampleCart);
    }
}
