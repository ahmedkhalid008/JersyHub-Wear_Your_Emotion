package com.jerseyhub.admin;

import com.jerseyhub.admin.dto.AdminDashboardSummaryResponse;
import com.jerseyhub.admin.dto.AdminOrderDetailResponse;
import com.jerseyhub.admin.dto.AdminOrderSummaryResponse;
import com.jerseyhub.admin.dto.AdminProductResponse;
import com.jerseyhub.admin.dto.AdminUserResponse;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.common.response.PageResponse;
import com.jerseyhub.order.Order;
import com.jerseyhub.order.OrderRepository;
import com.jerseyhub.order.OrderStatus;
import com.jerseyhub.payment.Payment;
import com.jerseyhub.payment.PaymentGateway;
import com.jerseyhub.payment.PaymentRepository;
import com.jerseyhub.payment.PaymentStatus;
import com.jerseyhub.product.Product;
import com.jerseyhub.product.ProductRepository;
import com.jerseyhub.user.User;
import com.jerseyhub.user.UserRepository;
import com.jerseyhub.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private AdminService adminService;

    private User sampleUser;
    private Product sampleProduct;
    private Order sampleOrder;
    private Payment samplePayment;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Admin User", "admin@jerseyhub.com", "hash", UserRole.ADMIN);
        sampleUser.setId(UUID.randomUUID());

        sampleProduct = new Product();
        sampleProduct.setId(UUID.randomUUID());
        sampleProduct.setName("Real Madrid Home Jersey");
        sampleProduct.setSlug("real-madrid-home");
        sampleProduct.setBasePrice(new BigDecimal("1500.00"));

        sampleOrder = new Order();
        sampleOrder.setId(UUID.randomUUID());
        sampleOrder.setOrderNumber("JH-2026-0001");
        sampleOrder.setUser(sampleUser);
        sampleOrder.setStatus(OrderStatus.PAID);
        sampleOrder.setSubtotal(new BigDecimal("1500.00"));
        sampleOrder.setTotalAmount(new BigDecimal("1500.00"));
        sampleOrder.setCurrency("BDT");
        sampleOrder.setShippingRecipientName("Admin User");
        sampleOrder.setCreatedAt(Instant.now());

        samplePayment = new Payment();
        samplePayment.setId(UUID.randomUUID());
        samplePayment.setOrder(sampleOrder);
        samplePayment.setTransactionId("TXN-123");
        samplePayment.setGateway(PaymentGateway.SSLCOMMERZ);
        samplePayment.setAmount(new BigDecimal("1500.00"));
        samplePayment.setStatus(PaymentStatus.SUCCESS);
    }

    @Test
    @DisplayName("Should aggregate dashboard summary correctly excluding pending/failed payments from revenue")
    void getDashboardSummary_Success() {
        given(userRepository.count()).willReturn(15L);
        given(productRepository.count()).willReturn(50L);
        given(orderRepository.count()).willReturn(100L);
        given(orderRepository.countByStatus(OrderStatus.PENDING_PAYMENT)).willReturn(10L);
        given(orderRepository.countByStatus(OrderStatus.PROCESSING)).willReturn(20L);
        given(orderRepository.countByStatus(OrderStatus.SHIPPED)).willReturn(30L);
        given(orderRepository.countByStatus(OrderStatus.DELIVERED)).willReturn(35L);
        given(orderRepository.countByStatus(OrderStatus.CANCELLED)).willReturn(5L);
        given(orderRepository.sumSuccessfulRevenue()).willReturn(new BigDecimal("125000.00"));

        AdminDashboardSummaryResponse summary = adminService.getDashboardSummary();

        assertThat(summary).isNotNull();
        assertThat(summary.totalUsers()).isEqualTo(15L);
        assertThat(summary.totalProducts()).isEqualTo(50L);
        assertThat(summary.totalOrders()).isEqualTo(100L);
        assertThat(summary.pendingOrders()).isEqualTo(10L);
        assertThat(summary.processingOrders()).isEqualTo(20L);
        assertThat(summary.shippedOrders()).isEqualTo(30L);
        assertThat(summary.deliveredOrders()).isEqualTo(35L);
        assertThat(summary.cancelledOrders()).isEqualTo(5L);
        assertThat(summary.totalSuccessfulRevenue()).isEqualTo(new BigDecimal("125000.00"));
    }

    @Test
    @DisplayName("Should list paginated orders filtered by status")
    void getOrders_WithStatusFilter() {
        Pageable pageable = PageRequest.of(0, 10);
        given(orderRepository.findByStatus(OrderStatus.PAID, pageable))
                .willReturn(new PageImpl<>(List.of(sampleOrder), pageable, 1));
        given(paymentRepository.findByOrderId(sampleOrder.getId())).willReturn(Optional.of(samplePayment));

        PageResponse<AdminOrderSummaryResponse> response = adminService.getOrders(OrderStatus.PAID, pageable);

        assertThat(response).isNotNull();
        assertThat(response.content()).hasSize(1);
        assertThat(response.content().get(0).orderNumber()).isEqualTo("JH-2026-0001");
        assertThat(response.content().get(0).paymentStatus()).isEqualTo(PaymentStatus.SUCCESS);
    }

    @Test
    @DisplayName("Should return detailed order response for admin")
    void getOrderById_Success() {
        UUID orderId = sampleOrder.getId();
        given(orderRepository.findById(orderId)).willReturn(Optional.of(sampleOrder));
        given(paymentRepository.findByOrderId(orderId)).willReturn(Optional.of(samplePayment));

        AdminOrderDetailResponse response = adminService.getOrderById(orderId);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(orderId);
        assertThat(response.customerEmail()).isEqualTo("admin@jerseyhub.com");
        assertThat(response.payment()).isNotNull();
        assertThat(response.payment().transactionId()).isEqualTo("TXN-123");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException for nonexistent order ID")
    void getOrderById_NotFound() {
        UUID orderId = UUID.randomUUID();
        given(orderRepository.findById(orderId)).willReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.getOrderById(orderId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Order not found");
    }

    @Test
    @DisplayName("Should return paginated users for admin without credentials")
    void getUsers_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        given(userRepository.findAll(pageable)).willReturn(new PageImpl<>(List.of(sampleUser), pageable, 1));

        PageResponse<AdminUserResponse> response = adminService.getUsers(pageable);

        assertThat(response).isNotNull();
        assertThat(response.content()).hasSize(1);
        assertThat(response.content().get(0).email()).isEqualTo("admin@jerseyhub.com");
    }

    @Test
    @DisplayName("Should return user by ID for admin")
    void getUserById_Success() {
        UUID userId = sampleUser.getId();
        given(userRepository.findById(userId)).willReturn(Optional.of(sampleUser));

        AdminUserResponse response = adminService.getUserById(userId);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(userId);
        assertThat(response.role()).isEqualTo(UserRole.ADMIN);
    }
}
