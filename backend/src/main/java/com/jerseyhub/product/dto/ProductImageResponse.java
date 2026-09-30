package com.jerseyhub.product.dto;

import com.jerseyhub.product.ProductImage;

import java.time.Instant;
import java.util.UUID;

public record ProductImageResponse(
    UUID id,
    String imageUrl,
    String publicId,
    String altText,
    int displayOrder,
    boolean isPrimary,
    Instant createdAt
) {
    public static ProductImageResponse from(ProductImage image) {
        return new ProductImageResponse(
            image.getId(),
            image.getImageUrl(),
            image.getPublicId(),
            image.getAltText(),
            image.getDisplayOrder(),
            image.isPrimary(),
            image.getCreatedAt()
        );
    }
}
