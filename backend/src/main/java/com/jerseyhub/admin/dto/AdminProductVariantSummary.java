package com.jerseyhub.admin.dto;

import com.jerseyhub.product.JerseySize;
import com.jerseyhub.product.ProductVariant;

import java.math.BigDecimal;
import java.util.UUID;

public record AdminProductVariantSummary(
        UUID id,
        String sku,
        JerseySize size,
        BigDecimal price,
        int stockQuantity,
        boolean active
) {
    public static AdminProductVariantSummary from(ProductVariant variant) {
        return new AdminProductVariantSummary(
                variant.getId(),
                variant.getSku(),
                variant.getSize(),
                variant.getPrice(),
                variant.getStockQuantity(),
                variant.isActive()
        );
    }
}
