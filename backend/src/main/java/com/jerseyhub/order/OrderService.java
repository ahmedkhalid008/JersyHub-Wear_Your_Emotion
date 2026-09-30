package com.jerseyhub.order;

import com.jerseyhub.cart.Cart;
import com.jerseyhub.cart.CartItem;
import com.jerseyhub.cart.CartRepository;
import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.coupon.Coupon;
import com.jerseyhub.coupon.CouponRepository;
import com.jerseyhub.coupon.CouponService;
import com.jerseyhub.inventory.InventoryTransaction;
import com.jerseyhub.inventory.InventoryTransactionRepository;
import com.jerseyhub.inventory.InventoryTransactionType;
import com.jerseyhub.order.dto.CheckoutRequest;
import com.jerseyhub.order.dto.OrderResponse;
import com.jerseyhub.product.ProductVariant;
import com.jerseyhub.product.ProductVariantRepository;
import com.jerseyhub.user.Address;
import com.jerseyhub.user.AddressRepository;
import com.jerseyhub.user.User;
import com.jerseyhub.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import com.jerseyhub.payment.Payment;
import com.jerseyhub.payment.PaymentGateway;
import com.jerseyhub.payment.PaymentRepository;
import com.jerseyhub.payment.PaymentStatus;
import com.jerseyhub.order.dto.CheckoutItemRequest;
import com.jerseyhub.order.dto.CheckoutRequest;
import com.jerseyhub.order.dto.OrderResponse;
import com.jerseyhub.product.ProductVariant;
import com.jerseyhub.product.ProductVariantRepository;
import com.jerseyhub.user.Address;
import com.jerseyhub.user.AddressRepository;
import com.jerseyhub.user.User;
import com.jerseyhub.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final AddressRepository addressRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final CouponRepository couponRepository;
    private final CouponService couponService;
    private final PaymentRepository paymentRepository;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartRepository cartRepository,
            AddressRepository addressRepository,
            ProductVariantRepository variantRepository,
            UserRepository userRepository,
            InventoryTransactionRepository inventoryTransactionRepository,
            CouponRepository couponRepository,
            CouponService couponService,
            PaymentRepository paymentRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.addressRepository = addressRepository;
        this.variantRepository = variantRepository;
        this.userRepository = userRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.couponRepository = couponRepository;
        this.couponService = couponService;
        this.paymentRepository = paymentRepository;
    }

    public OrderResponse checkout(UUID userId, CheckoutRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found", ErrorCode.RESOURCE_NOT_FOUND.getCode()));

        Cart cart = cartRepository.findByUserIdWithItems(userId).orElse(null);
        if (cart == null) {
            cart = new Cart(user);
            cart = cartRepository.save(cart);
        }

        if ((cart.getItems() == null || cart.getItems().isEmpty()) && request.items() != null && !request.items().isEmpty()) {
            for (CheckoutItemRequest itemReq : request.items()) {
                if (itemReq.productVariantId() != null && itemReq.quantity() != null && itemReq.quantity() > 0) {
                    ProductVariant variant = variantRepository.findById(itemReq.productVariantId()).orElse(null);
                    if (variant != null) {
                        CartItem newItem = new CartItem(cart, variant, itemReq.quantity());
                        cart.addItem(newItem);
                    }
                }
            }
            cart = cartRepository.save(cart);
        }

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BusinessException("Cart is empty", ErrorCode.CART_EMPTY.getCode());
        }

        Address address = addressRepository.findByUserIdAndId(userId, request.shippingAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Shipping address not found", ErrorCode.ADDRESS_NOT_FOUND.getCode()));

        Set<UUID> variantIds = cart.getItems().stream()
                .map(item -> item.getProductVariant().getId())
                .collect(Collectors.toSet());

        List<ProductVariant> lockedVariants = variantRepository.findAllByIdWithLock(variantIds);
        Map<UUID, ProductVariant> variantMap = lockedVariants.stream()
                .collect(Collectors.toMap(ProductVariant::getId, v -> v));

        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem item : cart.getItems()) {
            ProductVariant variant = variantMap.get(item.getProductVariant().getId());
            if (variant == null) {
                throw new ResourceNotFoundException("Product variant not found", ErrorCode.VARIANT_NOT_FOUND.getCode());
            }

            if (variant.getProduct() != null && !variant.getProduct().isActive()) {
                throw new BusinessException("Product " + variant.getProduct().getName() + " is inactive", ErrorCode.PRODUCT_INACTIVE.getCode());
            }
            if (!variant.isActive()) {
                throw new BusinessException("Product variant " + variant.getSku() + " is inactive", ErrorCode.VARIANT_INACTIVE.getCode());
            }

            if (variant.getStockQuantity() < item.getQuantity()) {
                throw new BusinessException("Insufficient stock for SKU " + variant.getSku(), ErrorCode.INSUFFICIENT_STOCK.getCode());
            }

            BigDecimal itemSubtotal = variant.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(itemSubtotal);
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        Coupon appliedCoupon = null;

        if (request.couponCode() != null && !request.couponCode().isBlank()) {
            String normalizedCode = request.couponCode().trim().toUpperCase();
            appliedCoupon = couponRepository.findByCodeWithLock(normalizedCode)
                    .orElseThrow(() -> new ResourceNotFoundException("Coupon not found", ErrorCode.COUPON_NOT_FOUND.getCode()));

            discountAmount = couponService.validateAndCalculateDiscount(appliedCoupon, userId, subtotal);
        }

        BigDecimal shippingAmount = subtotal.compareTo(new BigDecimal("2000.00")) >= 0 ? BigDecimal.ZERO : new BigDecimal("100.00");
        BigDecimal totalAmount = subtotal.subtract(discountAmount).add(shippingAmount);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            totalAmount = BigDecimal.ZERO;
        }

        Order order = new Order();
        order.setUser(user);
        order.setOrderNumber(generateOrderNumber());
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        order.setSubtotal(subtotal);
        order.setShippingAmount(shippingAmount);
        order.setDiscountAmount(discountAmount);
        if (appliedCoupon != null) {
            order.setCouponCode(appliedCoupon.getCode());
        }
        order.setCustomizationAmount(BigDecimal.ZERO);
        order.setTotalAmount(totalAmount);
        order.setCurrency("BDT");

        order.setShippingRecipientName(address.getRecipientName());
        order.setShippingPhone(address.getPhone());
        order.setShippingDivision(address.getDivision());
        order.setShippingDistrict(address.getDistrict());
        order.setShippingArea(address.getArea());
        order.setShippingAddressLine(address.getAddressLine());
        order.setShippingPostalCode(address.getPostalCode());

        Order savedOrder = orderRepository.save(order);

        if (appliedCoupon != null) {
            couponService.recordCouponUsage(appliedCoupon, user, savedOrder, discountAmount);
        }

        for (CartItem cartItem : cart.getItems()) {
            ProductVariant variant = variantMap.get(cartItem.getProductVariant().getId());

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(variant.getProduct());
            orderItem.setProductVariant(variant);
            orderItem.setProductName(variant.getProduct() != null ? variant.getProduct().getName() : "Jersey Product");
            orderItem.setSku(variant.getSku());
            orderItem.setSize(variant.getSize() != null ? variant.getSize().name() : "FREE");
            orderItem.setUnitPrice(variant.getPrice());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setSubtotal(variant.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));

            savedOrder.addItem(orderItem);

            variant.setStockQuantity(variant.getStockQuantity() - cartItem.getQuantity());
            variantRepository.save(variant);

            InventoryTransaction tx = new InventoryTransaction();
            tx.setProductVariant(variant);
            tx.setQuantityChange(-cartItem.getQuantity());
            tx.setTransactionType(InventoryTransactionType.SALE);
            tx.setReferenceType("ORDER");
            tx.setReferenceId(savedOrder.getId());
            tx.setNote("Deducted stock for Order " + savedOrder.getOrderNumber());
            inventoryTransactionRepository.save(tx);
        }

        cart.getItems().clear();
        cartRepository.save(cart);

        boolean isCod = request.paymentMethod() != null &&
                ("CASH_ON_DELIVERY".equalsIgnoreCase(request.paymentMethod()) || "COD".equalsIgnoreCase(request.paymentMethod()));

        if (isCod) {
            Payment payment = new Payment();
            payment.setOrder(savedOrder);
            payment.setTransactionId("COD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
            payment.setGateway(PaymentGateway.CASH_ON_DELIVERY);
            payment.setAmount(savedOrder.getTotalAmount());
            payment.setCurrency(savedOrder.getCurrency());
            payment.setStatus(PaymentStatus.PENDING);
            paymentRepository.save(payment);
        }

        Order finalOrder = orderRepository.save(savedOrder);
        return OrderResponse.from(finalOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(OrderResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getUserOrder(UUID userId, UUID orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND.getCode()));
        return OrderResponse.from(order);
    }

    public OrderResponse cancelOrder(UUID userId, UUID orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND.getCode()));

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT && order.getStatus() != OrderStatus.PROCESSING) {
            throw new BusinessException("Order cannot be cancelled in status: " + order.getStatus(), ErrorCode.ORDER_NOT_CANCELLABLE.getCode());
        }

        order.setStatus(OrderStatus.CANCELLED);

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                if (item.getProductVariant() != null) {
                    ProductVariant variant = variantRepository.findByIdWithLock(item.getProductVariant().getId())
                            .orElse(item.getProductVariant());
                    variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity());
                    variantRepository.save(variant);

                    InventoryTransaction tx = new InventoryTransaction();
                    tx.setProductVariant(variant);
                    tx.setQuantityChange(item.getQuantity());
                    tx.setTransactionType(InventoryTransactionType.RELEASE);
                    tx.setReferenceType("ORDER");
                    tx.setReferenceId(order.getId());
                    tx.setNote("Restored stock due to cancellation of Order " + order.getOrderNumber());
                    inventoryTransactionRepository.save(tx);
                }
            }
        }

        Order savedOrder = orderRepository.save(order);
        return OrderResponse.from(savedOrder);
    }

    private String generateOrderNumber() {
        return "JH-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }
}
