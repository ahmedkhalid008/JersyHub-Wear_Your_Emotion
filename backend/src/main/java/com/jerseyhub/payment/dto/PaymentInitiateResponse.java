package com.jerseyhub.payment.dto;

import com.jerseyhub.payment.PaymentStatus;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentInitiateResponse(
    UUID paymentId,
    UUID orderId,
    String transactionId,
    BigDecimal amount,
    String currency,
    String gatewayPageUrl,
    PaymentStatus status
) {}
