package com.jerseyhub.product.dto;

import com.jerseyhub.category.dto.CategoryResponse;
import com.jerseyhub.product.JerseyAuthenticity;
import com.jerseyhub.product.JerseyType;
import com.jerseyhub.product.Product;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProductDetailResponse(
    UUID id,
    String name,
    String slug,
    String description,
    String brand,
    String team,
    String league,
    String country,
    String season,
    JerseyType jerseyType,
    JerseyAuthenticity authenticity,
    String material,
    BigDecimal basePrice,
    boolean active,
    boolean featured,
    List<CategoryResponse> categories,
    List<ProductImageResponse> images,
    List<ProductVariantResponse> variants,
    String stockStatus,
    boolean available,
    Instant createdAt,
    Instant updatedAt
) {
    public static ProductDetailResponse from(Product product) {
        List<CategoryResponse> categories = product.getCategories() != null
                ? product.getCategories().stream().map(CategoryResponse::shallowFrom).toList()
                : List.of();

        List<ProductImageResponse> images = product.getImages() != null
                ? product.getImages().stream().map(ProductImageResponse::from).toList()
                : List.of();

        List<ProductVariantResponse> variants = product.getVariants() != null
                ? product.getVariants().stream().map(ProductVariantResponse::from).toList()
                : List.of();

        int totalStock = variants.stream()
                .filter(ProductVariantResponse::active)
                .mapToInt(ProductVariantResponse::stockQuantity)
                .sum();

        String stockStatus = totalStock == 0 ? "OUT_OF_STOCK" : (totalStock < 10 ? "LOW_STOCK" : "IN_STOCK");

        return new ProductDetailResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getBrand(),
                product.getTeam(),
                product.getLeague(),
                product.getCountry(),
                product.getSeason(),
                product.getJerseyType(),
                product.getAuthenticity(),
                product.getMaterial(),
                product.getBasePrice(),
                product.isActive(),
                product.isFeatured(),
                categories,
                images,
                variants,
                stockStatus,
                totalStock > 0,
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
