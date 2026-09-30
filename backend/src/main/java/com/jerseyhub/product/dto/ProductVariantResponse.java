package com.jerseyhub.product.dto;

import com.jerseyhub.product.JerseySize;
import com.jerseyhub.product.ProductVariant;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ProductVariantResponse(
    UUID id,
    UUID productId,
    String sku,
    JerseySize size,
    BigDecimal price,
    int stockQuantity,
    boolean active,
    String stockStatus,
    boolean available,
    Instant createdAt,
    Instant updatedAt
) {
    public static ProductVariantResponse from(ProductVariant variant) {
        int qty = variant.getStockQuantity();
        String stockStatus = qty == 0 ? "OUT_OF_STOCK" : (qty < 5 ? "LOW_STOCK" : "IN_STOCK");

        return new ProductVariantResponse(
            variant.getId(),
            variant.getProduct() != null ? variant.getProduct().getId() : null,
            variant.getSku(),
            variant.getSize(),
            variant.getPrice(),
            variant.getStockQuantity(),
            variant.isActive(),
            stockStatus,
            variant.isActive() && qty > 0,
            variant.getCreatedAt(),
            variant.getUpdatedAt()
        );
    }
}
