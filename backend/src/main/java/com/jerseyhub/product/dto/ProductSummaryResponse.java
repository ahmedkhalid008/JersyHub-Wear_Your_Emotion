package com.jerseyhub.product.dto;

import com.jerseyhub.product.JerseyAuthenticity;
import com.jerseyhub.product.JerseyType;
import com.jerseyhub.product.Product;
import com.jerseyhub.product.ProductImage;
import com.jerseyhub.product.ProductVariant;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductSummaryResponse(
    UUID id,
    String name,
    String slug,
    String brand,
    String team,
    String league,
    JerseyType jerseyType,
    JerseyAuthenticity authenticity,
    BigDecimal basePrice,
    boolean active,
    boolean featured,
    String primaryImageUrl,
    String stockStatus,
    boolean available
) {
    public static ProductSummaryResponse from(Product product) {
        String primaryUrl = product.getImages() != null
                ? product.getImages().stream()
                    .filter(ProductImage::isPrimary)
                    .findFirst()
                    .or(() -> product.getImages().stream().findFirst())
                    .map(ProductImage::getImageUrl)
                    .orElse(null)
                : null;

        int totalStock = product.getVariants() != null
                ? product.getVariants().stream()
                    .filter(ProductVariant::isActive)
                    .mapToInt(ProductVariant::getStockQuantity)
                    .sum()
                : 0;

        String stockStatus = totalStock == 0 ? "OUT_OF_STOCK" : (totalStock < 10 ? "LOW_STOCK" : "IN_STOCK");

        return new ProductSummaryResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getBrand(),
                product.getTeam(),
                product.getLeague(),
                product.getJerseyType(),
                product.getAuthenticity(),
                product.getBasePrice(),
                product.isActive(),
                product.isFeatured(),
                primaryUrl,
                stockStatus,
                totalStock > 0
        );
    }
}
