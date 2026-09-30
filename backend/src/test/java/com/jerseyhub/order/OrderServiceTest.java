package com.jerseyhub.order;

import com.jerseyhub.cart.Cart;
import com.jerseyhub.cart.CartItem;
import com.jerseyhub.cart.CartRepository;
import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.inventory.InventoryTransaction;
import com.jerseyhub.inventory.InventoryTransactionRepository;
import com.jerseyhub.inventory.InventoryTransactionType;
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
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import com.jerseyhub.coupon.Coupon;
import com.jerseyhub.coupon.CouponDiscountType;
import com.jerseyhub.coupon.CouponRepository;
import com.jerseyhub.coupon.CouponService;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

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
    private CouponService couponService;

    @InjectMocks
    private OrderService orderService;

    private UUID userId;
    private User sampleUser;
    private Address sampleAddress;
    private UUID addressId;
    private Cart sampleCart;
    private Product sampleProduct;
    private ProductVariant sampleVariant;
    private UUID variantId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        sampleUser = new User();
        sampleUser.setId(userId);
        sampleUser.setName("Order Customer");
        sampleUser.setEmail("customer@example.com");

        addressId = UUID.randomUUID();
        sampleAddress = new Address();
        sampleAddress.setId(addressId);
        sampleAddress.setUser(sampleUser);
        sampleAddress.setRecipientName("Order Customer");
        sampleAddress.setPhone("01700000000");
        sampleAddress.setDivision("Dhaka");
        sampleAddress.setDistrict("Dhaka");
        sampleAddress.setArea("Dhanmondi");
        sampleAddress.setAddressLine("Road 5, House 12");
        sampleAddress.setPostalCode("1205");

        sampleCart = new Cart(sampleUser);
        sampleCart.setId(UUID.randomUUID());

        sampleProduct = new Product();
        sampleProduct.setId(UUID.randomUUID());
        sampleProduct.setName("Barcelona Jersey 2025/26");
        sampleProduct.setActive(true);

        variantId = UUID.randomUUID();
        sampleVariant = new ProductVariant(sampleProduct, "BARCA-M", JerseySize.M, new BigDecimal("1500.00"), 10);
        sampleVariant.setId(variantId);
        sampleVariant.setActive(true);

        CartItem cartItem = new CartItem(sampleCart, sampleVariant, 2);
        cartItem.setId(UUID.randomUUID());
        sampleCart.addItem(cartItem);
    }

    @Test
    @DisplayName("Should checkout successfully, snapshot prices/address, deduct stock, and log InventoryTransaction")
    void checkout_Success() {
        CheckoutRequest request = new CheckoutRequest(addressId);

        given(userRepository.findById(userId)).willReturn(Optional.of(sampleUser));
        given(cartRepository.findByUserIdWithItems(userId)).willReturn(Optional.of(sampleCart));
        given(addressRepository.findByUserIdAndId(userId, addressId)).willReturn(Optional.of(sampleAddress));
        given(variantRepository.findAllByIdWithLock(any())).willReturn(List.of(sampleVariant));
        given(orderRepository.save(any(Order.class))).willAnswer(invocation -> {
            Order saved = invocation.getArgument(0);
            if (saved.getId() == null) saved.setId(UUID.randomUUID());
            return saved;
        });

        OrderResponse response = orderService.checkout(userId, request);

        assertThat(response).isNotNull();
        assertThat(response.orderNumber()).startsWith("JH-");
        assertThat(response.status()).isEqualTo(OrderStatus.PENDING_PAYMENT);
        assertThat(response.subtotal()).isEqualTo(new BigDecimal("3000.00")); // 2 * 1500
        assertThat(response.shippingAmount()).isEqualTo(BigDecimal.ZERO); // free shipping >= 2000
        assertThat(response.totalAmount()).isEqualTo(new BigDecimal("3000.00"));
        assertThat(response.shippingRecipientName()).isEqualTo("Order Customer");

        // Verify stock deduction (10 - 2 = 8)
        assertThat(sampleVariant.getStockQuantity()).isEqualTo(8);

        // Verify inventory transaction logged
        ArgumentCaptor<InventoryTransaction> txCaptor = ArgumentCaptor.forClass(InventoryTransaction.class);
        verify(inventoryTransactionRepository).save(txCaptor.capture());
        assertThat(txCaptor.getValue().getQuantityChange()).isEqualTo(-2);
        assertThat(txCaptor.getValue().getTransactionType()).isEqualTo(InventoryTransactionType.SALE);

        // Verify cart cleared
        assertThat(sampleCart.getItems()).isEmpty();
    }

    @Test
    @DisplayName("Should throw BusinessException when cart is empty")
    void checkout_EmptyCart_ThrowsException() {
        sampleCart.getItems().clear();
        CheckoutRequest request = new CheckoutRequest(addressId);

        given(userRepository.findById(userId)).willReturn(Optional.of(sampleUser));
        given(cartRepository.findByUserIdWithItems(userId)).willReturn(Optional.of(sampleCart));

        assertThatThrownBy(() -> orderService.checkout(userId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Cart is empty")
                .extracting("errorCode").isEqualTo(ErrorCode.CART_EMPTY.getCode());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when address belongs to another user")
    void checkout_InvalidAddress_ThrowsException() {
        UUID otherAddressId = UUID.randomUUID();
        CheckoutRequest request = new CheckoutRequest(otherAddressId);

        given(userRepository.findById(userId)).willReturn(Optional.of(sampleUser));
        given(cartRepository.findByUserIdWithItems(userId)).willReturn(Optional.of(sampleCart));
        given(addressRepository.findByUserIdAndId(userId, otherAddressId)).willReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.checkout(userId, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Shipping address not found")
                .extracting("errorCode").isEqualTo(ErrorCode.ADDRESS_NOT_FOUND.getCode());
    }

    @Test
    @DisplayName("Should throw BusinessException when variant stock is insufficient at checkout")
    void checkout_InsufficientStock_ThrowsException() {
        sampleVariant.setStockQuantity(1); // stock is 1, but cart quantity is 2
        CheckoutRequest request = new CheckoutRequest(addressId);

        given(userRepository.findById(userId)).willReturn(Optional.of(sampleUser));
        given(cartRepository.findByUserIdWithItems(userId)).willReturn(Optional.of(sampleCart));
        given(addressRepository.findByUserIdAndId(userId, addressId)).willReturn(Optional.of(sampleAddress));
        given(variantRepository.findAllByIdWithLock(any())).willReturn(List.of(sampleVariant));

        assertThatThrownBy(() -> orderService.checkout(userId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Insufficient stock")
                .extracting("errorCode").isEqualTo(ErrorCode.INSUFFICIENT_STOCK.getCode());
    }

    @Test
    @DisplayName("Should throw BusinessException when product is inactive")
    void checkout_InactiveProduct_ThrowsException() {
        sampleProduct.setActive(false);
        CheckoutRequest request = new CheckoutRequest(addressId);

        given(userRepository.findById(userId)).willReturn(Optional.of(sampleUser));
        given(cartRepository.findByUserIdWithItems(userId)).willReturn(Optional.of(sampleCart));
        given(addressRepository.findByUserIdAndId(userId, addressId)).willReturn(Optional.of(sampleAddress));
        given(variantRepository.findAllByIdWithLock(any())).willReturn(List.of(sampleVariant));

        assertThatThrownBy(() -> orderService.checkout(userId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("inactive")
                .extracting("errorCode").isEqualTo(ErrorCode.PRODUCT_INACTIVE.getCode());
    }

    @Test
    @DisplayName("Should retrieve user's orders")
    void getUserOrders_Success() {
        Order sampleOrder = new Order();
        sampleOrder.setId(UUID.randomUUID());
        sampleOrder.setOrderNumber("JH-1234");
        sampleOrder.setUser(sampleUser);
        sampleOrder.setSubtotal(new BigDecimal("1500.00"));
        sampleOrder.setTotalAmount(new BigDecimal("1600.00"));
        sampleOrder.setShippingRecipientName("Order Customer");
        sampleOrder.setShippingPhone("01700000000");
        sampleOrder.setShippingDivision("Dhaka");
        sampleOrder.setShippingDistrict("Dhaka");
        sampleOrder.setShippingArea("Dhanmondi");
        sampleOrder.setShippingAddressLine("Road 5");

        given(orderRepository.findByUserIdOrderByCreatedAtDesc(userId)).willReturn(List.of(sampleOrder));

        List<OrderResponse> responses = orderService.getUserOrders(userId);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).orderNumber()).isEqualTo("JH-1234");
    }

    @Test
    @DisplayName("Should cancel order, restore stock, and record RELEASE inventory transaction")
    void cancelOrder_Success() {
        Order sampleOrder = new Order();
        UUID orderId = UUID.randomUUID();
        sampleOrder.setId(orderId);
        sampleOrder.setOrderNumber("JH-5678");
        sampleOrder.setUser(sampleUser);
        sampleOrder.setStatus(OrderStatus.PENDING_PAYMENT);

        OrderItem orderItem = new OrderItem();
        orderItem.setProductVariant(sampleVariant);
        orderItem.setQuantity(2);
        sampleOrder.addItem(orderItem);

        given(orderRepository.findByIdAndUserId(orderId, userId)).willReturn(Optional.of(sampleOrder));
        given(variantRepository.findByIdWithLock(variantId)).willReturn(Optional.of(sampleVariant));
        given(orderRepository.save(any(Order.class))).willAnswer(invocation -> invocation.getArgument(0));

        OrderResponse response = orderService.cancelOrder(userId, orderId);

        assertThat(response.status()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(sampleVariant.getStockQuantity()).isEqualTo(12); // 10 + 2 = 12

        ArgumentCaptor<InventoryTransaction> txCaptor = ArgumentCaptor.forClass(InventoryTransaction.class);
        verify(inventoryTransactionRepository).save(txCaptor.capture());
        assertThat(txCaptor.getValue().getQuantityChange()).isEqualTo(2);
        assertThat(txCaptor.getValue().getTransactionType()).isEqualTo(InventoryTransactionType.RELEASE);
    }

    @Test
    @DisplayName("Should throw BusinessException when attempting to cancel shipped order")
    void cancelOrder_NonCancellableState_ThrowsException() {
        Order sampleOrder = new Order();
        UUID orderId = UUID.randomUUID();
        sampleOrder.setId(orderId);
        sampleOrder.setUser(sampleUser);
        sampleOrder.setStatus(OrderStatus.SHIPPED);

        given(orderRepository.findByIdAndUserId(orderId, userId)).willReturn(Optional.of(sampleOrder));

        assertThatThrownBy(() -> orderService.cancelOrder(userId, orderId))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("cannot be cancelled")
                .extracting("errorCode").isEqualTo(ErrorCode.ORDER_NOT_CANCELLABLE.getCode());
    }

    @Test
    @DisplayName("Should throw BusinessException when attempting to cancel delivered or already cancelled order")
    void cancelOrder_DeliveredOrAlreadyCancelled_ThrowsException() {
        Order deliveredOrder = new Order();
        UUID deliveredId = UUID.randomUUID();
        deliveredOrder.setId(deliveredId);
        deliveredOrder.setUser(sampleUser);
        deliveredOrder.setStatus(OrderStatus.DELIVERED);

        given(orderRepository.findByIdAndUserId(deliveredId, userId)).willReturn(Optional.of(deliveredOrder));

        assertThatThrownBy(() -> orderService.cancelOrder(userId, deliveredId))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("cannot be cancelled")
                .extracting("errorCode").isEqualTo(ErrorCode.ORDER_NOT_CANCELLABLE.getCode());
    }
}
