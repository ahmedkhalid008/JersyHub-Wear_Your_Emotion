package com.jerseyhub.order;

import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.payment.Payment;
import com.jerseyhub.payment.PaymentGateway;
import com.jerseyhub.payment.PaymentRepository;
import com.jerseyhub.payment.PaymentStatus;
import com.jerseyhub.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class OrderPdfServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private OrderPdfService orderPdfService;

    private UUID userId;
    private User sampleUser;
    private Order sampleOrder;
    private UUID orderId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        sampleUser = new User();
        sampleUser.setId(userId);
        sampleUser.setName("Invoice Customer");
        sampleUser.setEmail("invoice.customer@example.com");

        orderId = UUID.randomUUID();
        sampleOrder = new Order();
        sampleOrder.setId(orderId);
        sampleOrder.setOrderNumber("JH-INV-2026-001");
        sampleOrder.setUser(sampleUser);
        sampleOrder.setStatus(OrderStatus.PAID);
        sampleOrder.setSubtotal(new BigDecimal("3000.00"));
        sampleOrder.setShippingAmount(new BigDecimal("100.00"));
        sampleOrder.setDiscountAmount(BigDecimal.ZERO);
        sampleOrder.setTotalAmount(new BigDecimal("3100.00"));
        sampleOrder.setCurrency("BDT");
        sampleOrder.setCreatedAt(Instant.now());

        sampleOrder.setShippingRecipientName("Invoice Customer");
        sampleOrder.setShippingPhone("01700000000");
        sampleOrder.setShippingDivision("Dhaka");
        sampleOrder.setShippingDistrict("Dhaka");
        sampleOrder.setShippingArea("Dhanmondi");
        sampleOrder.setShippingAddressLine("Road 7, House 42");
        sampleOrder.setShippingPostalCode("1209");

        OrderItem item1 = new OrderItem();
        item1.setId(UUID.randomUUID());
        item1.setProductName("Real Madrid Home Jersey 2025/26");
        item1.setSku("RM-HOME-L");
        item1.setSize("L");
        item1.setUnitPrice(new BigDecimal("1500.00"));
        item1.setQuantity(1);
        item1.setSubtotal(new BigDecimal("1500.00"));
        sampleOrder.addItem(item1);

        OrderItem item2 = new OrderItem();
        item2.setId(UUID.randomUUID());
        item2.setProductName("Barcelona Away Jersey 2025/26");
        item2.setSku("BARCA-AWAY-M");
        item2.setSize("M");
        item2.setUnitPrice(new BigDecimal("1500.00"));
        item2.setQuantity(1);
        item2.setSubtotal(new BigDecimal("1500.00"));
        sampleOrder.addItem(item2);
    }

    @Test
    @DisplayName("Should generate valid PDF invoice byte array starting with %PDF signature")
    void generateOrderInvoicePdf_Success() {
        Payment payment = new Payment();
        payment.setId(UUID.randomUUID());
        payment.setOrder(sampleOrder);
        payment.setTransactionId("TXN-SSL-999");
        payment.setGateway(PaymentGateway.SSLCOMMERZ);
        payment.setAmount(new BigDecimal("3100.00"));
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(Instant.now());

        given(orderRepository.findByIdAndUserId(orderId, userId)).willReturn(Optional.of(sampleOrder));
        given(paymentRepository.findByOrderId(orderId)).willReturn(Optional.of(payment));

        byte[] pdfBytes = orderPdfService.generateOrderInvoicePdf(userId, orderId);

        assertThat(pdfBytes).isNotNull();
        assertThat(pdfBytes.length).isGreaterThan(100);

        // Verify PDF Header Signature (%PDF)
        String pdfHeader = new String(pdfBytes, 0, 4);
        assertThat(pdfHeader).isEqualTo("%PDF");
    }

    @Test
    @DisplayName("Should generate valid PDF invoice when payment is missing (pending payment order)")
    void generateOrderInvoicePdf_WithoutPayment() {
        given(orderRepository.findByIdAndUserId(orderId, userId)).willReturn(Optional.of(sampleOrder));
        given(paymentRepository.findByOrderId(orderId)).willReturn(Optional.empty());

        byte[] pdfBytes = orderPdfService.generateOrderInvoicePdf(userId, orderId);

        assertThat(pdfBytes).isNotNull();
        String pdfHeader = new String(pdfBytes, 0, 4);
        assertThat(pdfHeader).isEqualTo("%PDF");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when accessing another user's invoice (IDOR)")
    void generateOrderInvoicePdf_IDOR_ThrowsException() {
        given(orderRepository.findByIdAndUserId(orderId, userId)).willReturn(Optional.empty());

        assertThatThrownBy(() -> orderPdfService.generateOrderInvoicePdf(userId, orderId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Order not found")
                .extracting("errorCode").isEqualTo(ErrorCode.ORDER_NOT_FOUND.getCode());
    }
}
