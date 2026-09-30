package com.jerseyhub.order.dto;

import com.jerseyhub.order.Order;
import com.jerseyhub.order.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
    UUID id,
    String orderNumber,
    UUID userId,
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
    Instant createdAt,
    Instant updatedAt
) {
    public static OrderResponse from(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems() != null
                ? order.getItems().stream().map(OrderItemResponse::from).toList()
                : Collections.emptyList();

        return new OrderResponse(
            order.getId(),
            order.getOrderNumber(),
            order.getUser() != null ? order.getUser().getId() : null,
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
            order.getCreatedAt(),
            order.getUpdatedAt()
        );
    }
}
