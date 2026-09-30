package com.jerseyhub.admin.dto;

import com.jerseyhub.order.Order;
import com.jerseyhub.order.OrderStatus;
import com.jerseyhub.payment.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AdminOrderSummaryResponse(
        UUID id,
        String orderNumber,
        UUID userId,
        String customerName,
        String customerEmail,
        OrderStatus status,
        PaymentStatus paymentStatus,
        BigDecimal totalAmount,
        String currency,
        int totalItems,
        Instant createdAt
) {
    public static AdminOrderSummaryResponse from(Order order, PaymentStatus paymentStatus) {
        return new AdminOrderSummaryResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getUser() != null ? order.getUser().getId() : null,
                order.getUser() != null ? order.getUser().getName() : order.getShippingRecipientName(),
                order.getUser() != null ? order.getUser().getEmail() : "N/A",
                order.getStatus(),
                paymentStatus,
                order.getTotalAmount(),
                order.getCurrency(),
                order.getItems() != null ? order.getItems().size() : 0,
                order.getCreatedAt()
        );
    }
}
