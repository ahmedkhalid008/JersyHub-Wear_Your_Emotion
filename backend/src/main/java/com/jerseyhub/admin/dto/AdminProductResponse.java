package com.jerseyhub.admin.dto;

import com.jerseyhub.product.Product;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public record AdminProductResponse(
        UUID id,
        String name,
        String slug,
        String brand,
        String team,
        BigDecimal basePrice,
        boolean active,
        boolean featured,
        int totalStockQuantity,
        List<AdminProductVariantSummary> variants,
        Instant createdAt,
        Instant updatedAt
) {
    public static AdminProductResponse from(Product product) {
        List<AdminProductVariantSummary> variantSummaries = product.getVariants() != null
                ? product.getVariants().stream().map(AdminProductVariantSummary::from).toList()
                : Collections.emptyList();

        int totalStock = product.getVariants() != null
                ? product.getVariants().stream().mapToInt(v -> v.getStockQuantity()).sum()
                : 0;

        return new AdminProductResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getBrand(),
                product.getTeam(),
                product.getBasePrice(),
                product.isActive(),
                product.isFeatured(),
                totalStock,
                variantSummaries,
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
