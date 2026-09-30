package com.jerseyhub.product.dto;

import jakarta.validation.constraints.NotBlank;

public record ProductImageUpdateRequest(
    @NotBlank(message = "Image URL is required")
    String imageUrl,
    String altText,
    Integer displayOrder,
    Boolean isPrimary
) {}
