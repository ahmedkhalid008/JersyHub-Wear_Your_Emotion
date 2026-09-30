package com.jerseyhub.order.dto;

import com.jerseyhub.order.OrderItem;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(
    UUID id,
    UUID productId,
    UUID productVariantId,
    String productName,
    String sku,
    String size,
    BigDecimal unitPrice,
    int quantity,
    BigDecimal customizationPrice,
    BigDecimal subtotal
) {
    public static OrderItemResponse from(OrderItem item) {
        return new OrderItemResponse(
            item.getId(),
            item.getProduct() != null ? item.getProduct().getId() : null,
            item.getProductVariant() != null ? item.getProductVariant().getId() : null,
            item.getProductName(),
            item.getSku(),
            item.getSize(),
            item.getUnitPrice(),
            item.getQuantity(),
            item.getCustomizationPrice() != null ? item.getCustomizationPrice() : BigDecimal.ZERO,
            item.getSubtotal()
        );
    }
}
