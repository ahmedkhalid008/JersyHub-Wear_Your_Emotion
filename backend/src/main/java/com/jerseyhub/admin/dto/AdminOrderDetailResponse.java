package com.jerseyhub.admin.dto;

import com.jerseyhub.order.Order;
import com.jerseyhub.order.OrderStatus;
import com.jerseyhub.order.dto.OrderItemResponse;
import com.jerseyhub.payment.dto.PaymentResponse;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public record AdminOrderDetailResponse(
        UUID id,
        String orderNumber,
        UUID userId,
        String customerName,
        String customerEmail,
        OrderStatus status,
        BigDecimal subtotal,
        BigDecimal discountAmount,
        BigDecimal shippingAmount,
        BigDecimal customizationAmount,
        BigDecimal totalAmount,
        String currency,
        String shippingRecipientName,
        String shippingPhone,
        String shippingDivision,
        String shippingDistrict,
        String shippingArea,
        String shippingAddressLine,
        String shippingPostalCode,
        List<OrderItemResponse> items,
        PaymentResponse payment,
        Instant createdAt,
        Instant updatedAt
) {
    public static AdminOrderDetailResponse from(Order order, PaymentResponse paymentResponse) {
        List<OrderItemResponse> itemResponses = order.getItems() != null
                ? order.getItems().stream().map(OrderItemResponse::from).toList()
                : Collections.emptyList();

        return new AdminOrderDetailResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getUser() != null ? order.getUser().getId() : null,
                order.getUser() != null ? order.getUser().getName() : order.getShippingRecipientName(),
                order.getUser() != null ? order.getUser().getEmail() : "N/A",
                order.getStatus(),
                order.getSubtotal(),
                order.getDiscountAmount(),
                order.getShippingAmount(),
                order.getCustomizationAmount(),
                order.getTotalAmount(),
                order.getCurrency(),
                order.getShippingRecipientName(),
                order.getShippingPhone(),
                order.getShippingDivision(),
                order.getShippingDistrict(),
                order.getShippingArea(),
                order.getShippingAddressLine(),
                order.getShippingPostalCode(),
                itemResponses,
                paymentResponse,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
