package com.jerseyhub.payment;

import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.order.Order;
import com.jerseyhub.order.OrderRepository;
import com.jerseyhub.order.OrderStatus;
import com.jerseyhub.payment.dto.PaymentInitiateRequest;
import com.jerseyhub.payment.dto.PaymentInitiateResponse;
import com.jerseyhub.payment.dto.PaymentResponse;
import com.jerseyhub.payment.dto.SslCommerzCallbackPayload;
import com.jerseyhub.payment.service.SslCommerzClient;
import com.jerseyhub.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private SslCommerzClient sslCommerzClient;

    @InjectMocks
    private PaymentService paymentService;

    private UUID userId;
    private User sampleUser;
    private Order sampleOrder;
    private UUID orderId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        sampleUser = new User();
        sampleUser.setId(userId);
        sampleUser.setEmail("payer@example.com");

        orderId = UUID.randomUUID();
        sampleOrder = new Order();
        sampleOrder.setId(orderId);
        sampleOrder.setOrderNumber("JH-PAY-01");
        sampleOrder.setUser(sampleUser);
        sampleOrder.setStatus(OrderStatus.PENDING_PAYMENT);
        sampleOrder.setTotalAmount(new BigDecimal("2500.00"));
        sampleOrder.setCurrency("BDT");
    }

    @Test
    @DisplayName("Should initiate payment successfully with server-side order total")
    void initiatePayment_Success() {
        PaymentInitiateRequest request = new PaymentInitiateRequest(orderId);

        given(orderRepository.findByIdAndUserId(orderId, userId)).willReturn(Optional.of(sampleOrder));
        given(paymentRepository.findByOrderId(orderId)).willReturn(Optional.empty());
        given(paymentRepository.save(any(Payment.class))).willAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            if (p.getId() == null) p.setId(UUID.randomUUID());
            return p;
        });
        given(sslCommerzClient.initiateSession(any(Payment.class), any(Order.class), any())).willReturn("https://sandbox.sslcommerz.com/gwprocess/v4/api.php?sessionkey=MOCK123");

        PaymentInitiateResponse response = paymentService.initiatePayment(userId, request, "http://localhost:8080");

        assertThat(response).isNotNull();
        assertThat(response.orderId()).isEqualTo(orderId);
        assertThat(response.amount()).isEqualTo(new BigDecimal("2500.00"));
        assertThat(response.gatewayPageUrl()).contains("sandbox.sslcommerz.com");
        assertThat(response.status()).isEqualTo(PaymentStatus.INITIATED);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when initiating payment for another user's order (IDOR)")
    void initiatePayment_OrderBelongsToAnotherUser_ThrowsException() {
        PaymentInitiateRequest request = new PaymentInitiateRequest(orderId);
        given(orderRepository.findByIdAndUserId(orderId, userId)).willReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.initiatePayment(userId, request, "http://localhost:8080"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Order not found")
                .extracting("errorCode").isEqualTo(ErrorCode.ORDER_NOT_FOUND.getCode());
    }

    @Test
    @DisplayName("Should throw BusinessException when order is not in PENDING_PAYMENT status")
    void initiatePayment_NonPayableOrder_ThrowsException() {
        sampleOrder.setStatus(OrderStatus.CANCELLED);
        PaymentInitiateRequest request = new PaymentInitiateRequest(orderId);

        given(orderRepository.findByIdAndUserId(orderId, userId)).willReturn(Optional.of(sampleOrder));

        assertThatThrownBy(() -> paymentService.initiatePayment(userId, request, "http://localhost:8080"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("cannot be paid");
    }

    @Test
    @DisplayName("Should process successful callback, validate with SSLCommerz server, update Payment to SUCCESS and Order to PAID")
    void handleSuccessCallback_Success() {
        Payment payment = new Payment();
        payment.setId(UUID.randomUUID());
        payment.setOrder(sampleOrder);
        payment.setTransactionId("TXN-123");
        payment.setAmount(new BigDecimal("2500.00"));
        payment.setCurrency("BDT");
        payment.setStatus(PaymentStatus.INITIATED);

        SslCommerzCallbackPayload payload = new SslCommerzCallbackPayload(
                "VALID", "TXN-123", "VAL-999", "2500.00", "BDT", "2450.00", "VISA", "BANK123", "2026-09-11", null
        );

        given(paymentRepository.findByTransactionId("TXN-123")).willReturn(Optional.of(payment));
        given(sslCommerzClient.validateTransaction("VAL-999")).willReturn(Map.of(
                "status", "VALID",
                "amount", "2500.00",
                "currency", "BDT"
        ));
        given(paymentRepository.save(any(Payment.class))).willAnswer(invocation -> invocation.getArgument(0));

        PaymentResponse response = paymentService.handleSuccessCallback(payload);

        assertThat(response.status()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(sampleOrder.getStatus()).isEqualTo(OrderStatus.PAID);
    }

    @Test
    @DisplayName("Should be idempotent when receiving duplicate success callback for already completed payment")
    void handleSuccessCallback_Idempotent() {
        Payment payment = new Payment();
        payment.setId(UUID.randomUUID());
        payment.setOrder(sampleOrder);
        payment.setTransactionId("TXN-123");
        payment.setAmount(new BigDecimal("2500.00"));
        payment.setCurrency("BDT");
        payment.setStatus(PaymentStatus.SUCCESS); // Already SUCCESS

        SslCommerzCallbackPayload payload = new SslCommerzCallbackPayload(
                "VALID", "TXN-123", "VAL-999", "2500.00", "BDT", "2450.00", "VISA", "BANK123", "2026-09-11", null
        );

        given(paymentRepository.findByTransactionId("TXN-123")).willReturn(Optional.of(payment));

        PaymentResponse response = paymentService.handleSuccessCallback(payload);

        assertThat(response.status()).isEqualTo(PaymentStatus.SUCCESS);
        verify(sslCommerzClient, never()).validateTransaction(any());
    }

    @Test
    @DisplayName("Should throw BusinessException when server validation detects amount mismatch")
    void handleSuccessCallback_AmountMismatch_ThrowsException() {
        Payment payment = new Payment();
        payment.setId(UUID.randomUUID());
        payment.setOrder(sampleOrder);
        payment.setTransactionId("TXN-123");
        payment.setAmount(new BigDecimal("2500.00"));
        payment.setCurrency("BDT");
        payment.setStatus(PaymentStatus.INITIATED);

        SslCommerzCallbackPayload payload = new SslCommerzCallbackPayload(
                "VALID", "TXN-123", "VAL-999", "100.00", "BDT", "100.00", "VISA", "BANK123", "2026-09-11", null
        );

        given(paymentRepository.findByTransactionId("TXN-123")).willReturn(Optional.of(payment));
        given(sslCommerzClient.validateTransaction("VAL-999")).willReturn(Map.of(
                "status", "VALID",
                "amount", "100.00", // Tampered amount returned from validation
                "currency", "BDT"
        ));

        assertThatThrownBy(() -> paymentService.handleSuccessCallback(payload))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("mismatch");
    }

    @Test
    @DisplayName("Should process failure callback and mark payment FAILED without confirming order")
    void handleFailCallback_Success() {
        Payment payment = new Payment();
        payment.setId(UUID.randomUUID());
        payment.setOrder(sampleOrder);
        payment.setTransactionId("TXN-123");
        payment.setStatus(PaymentStatus.INITIATED);

        SslCommerzCallbackPayload payload = new SslCommerzCallbackPayload(
                "FAILED", "TXN-123", null, "2500.00", "BDT", null, null, null, null, "Card declined"
        );

        given(paymentRepository.findByTransactionId("TXN-123")).willReturn(Optional.of(payment));
        given(paymentRepository.save(any(Payment.class))).willAnswer(invocation -> invocation.getArgument(0));

        PaymentResponse response = paymentService.handleFailCallback(payload);

        assertThat(response.status()).isEqualTo(PaymentStatus.FAILED);
        assertThat(sampleOrder.getStatus()).isEqualTo(OrderStatus.PENDING_PAYMENT); // Order remains unchanged
    }

    @Test
    @DisplayName("Should process cancellation callback and mark payment CANCELLED")
    void handleCancelCallback_Success() {
        Payment payment = new Payment();
        payment.setId(UUID.randomUUID());
        payment.setOrder(sampleOrder);
        payment.setTransactionId("TXN-123");
        payment.setStatus(PaymentStatus.INITIATED);

        SslCommerzCallbackPayload payload = new SslCommerzCallbackPayload(
                "CANCELLED", "TXN-123", null, "2500.00", "BDT", null, null, null, null, "User cancelled"
        );

        given(paymentRepository.findByTransactionId("TXN-123")).willReturn(Optional.of(payment));
        given(paymentRepository.save(any(Payment.class))).willAnswer(invocation -> invocation.getArgument(0));

        PaymentResponse response = paymentService.handleCancelCallback(payload);

        assertThat(response.status()).isEqualTo(PaymentStatus.CANCELLED);
    }
}
