package com.jerseyhub.payment.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PaymentInitiateRequest(
    @NotNull(message = "Order ID is required")
    UUID orderId
) {}
