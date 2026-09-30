package com.jerseyhub.payment.dto;

import com.jerseyhub.payment.Payment;
import com.jerseyhub.payment.PaymentGateway;
import com.jerseyhub.payment.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentResponse(
    UUID id,
    UUID orderId,
    String transactionId,
    PaymentGateway gateway,
    BigDecimal amount,
    String currency,
    PaymentStatus status,
    Instant paidAt,
    Instant createdAt,
    Instant updatedAt
) {
    public static PaymentResponse from(Payment payment) {
        return new PaymentResponse(
            payment.getId(),
            payment.getOrder() != null ? payment.getOrder().getId() : null,
            payment.getTransactionId(),
            payment.getGateway(),
            payment.getAmount(),
            payment.getCurrency(),
            payment.getStatus(),
            payment.getPaidAt(),
            payment.getCreatedAt(),
            payment.getUpdatedAt()
        );
    }
}
