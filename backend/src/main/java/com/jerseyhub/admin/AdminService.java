package com.jerseyhub.admin;

import com.jerseyhub.admin.dto.AdminDashboardSummaryResponse;
import com.jerseyhub.admin.dto.AdminOrderDetailResponse;
import com.jerseyhub.admin.dto.AdminOrderSummaryResponse;
import com.jerseyhub.admin.dto.AdminProductResponse;
import com.jerseyhub.admin.dto.AdminUserResponse;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.common.response.PageResponse;
import com.jerseyhub.order.Order;
import com.jerseyhub.order.OrderRepository;
import com.jerseyhub.order.OrderStatus;
import com.jerseyhub.payment.Payment;
import com.jerseyhub.payment.PaymentRepository;
import com.jerseyhub.payment.PaymentStatus;
import com.jerseyhub.payment.dto.PaymentResponse;
import com.jerseyhub.product.Product;
import com.jerseyhub.product.ProductRepository;
import com.jerseyhub.user.User;
import com.jerseyhub.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    public AdminService(
            UserRepository userRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository,
            PaymentRepository paymentRepository
    ) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
    }

    public AdminDashboardSummaryResponse getDashboardSummary() {
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();

        long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING_PAYMENT);
        long processingOrders = orderRepository.countByStatus(OrderStatus.PROCESSING);
        long shippedOrders = orderRepository.countByStatus(OrderStatus.SHIPPED);
        long deliveredOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long cancelledOrders = orderRepository.countByStatus(OrderStatus.CANCELLED);

        BigDecimal totalSuccessfulRevenue = orderRepository.sumSuccessfulRevenue();

        return new AdminDashboardSummaryResponse(
                totalUsers,
                totalProducts,
                totalOrders,
                pendingOrders,
                processingOrders,
                shippedOrders,
                deliveredOrders,
                cancelledOrders,
                totalSuccessfulRevenue != null ? totalSuccessfulRevenue : BigDecimal.ZERO
        );
    }

    public PageResponse<AdminOrderSummaryResponse> getOrders(OrderStatus status, Pageable pageable) {
        Page<Order> orders = status != null
                ? orderRepository.findByStatus(status, pageable)
                : orderRepository.findAll(pageable);

        Page<AdminOrderSummaryResponse> summaryPage = orders.map(order -> {
            Optional<Payment> paymentOpt = paymentRepository.findByOrderId(order.getId());
            PaymentStatus pStatus = paymentOpt.map(Payment::getStatus).orElseGet(() ->
                    order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.PROCESSING
                            ? PaymentStatus.SUCCESS
                            : PaymentStatus.PENDING
            );
            return AdminOrderSummaryResponse.from(order, pStatus);
        });

        return PageResponse.from(summaryPage);
    }

    public AdminOrderDetailResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND.getCode()));

        Optional<Payment> paymentOpt = paymentRepository.findByOrderId(order.getId());
        PaymentResponse paymentResponse = paymentOpt.map(PaymentResponse::from).orElse(null);

        return AdminOrderDetailResponse.from(order, paymentResponse);
    }

    public PageResponse<AdminProductResponse> getProducts(Pageable pageable) {
        Page<Product> products = productRepository.findAll(pageable);
        Page<AdminProductResponse> responsePage = products.map(AdminProductResponse::from);
        return PageResponse.from(responsePage);
    }

    public PageResponse<AdminUserResponse> getUsers(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        Page<AdminUserResponse> responsePage = users.map(AdminUserResponse::from);
        return PageResponse.from(responsePage);
    }

    public AdminUserResponse getUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found", ErrorCode.RESOURCE_NOT_FOUND.getCode()));
        return AdminUserResponse.from(user);
    }
}
