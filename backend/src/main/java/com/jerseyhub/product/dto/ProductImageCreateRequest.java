package com.jerseyhub.product.dto;

import jakarta.validation.constraints.NotBlank;

public record ProductImageCreateRequest(
    @NotBlank(message = "Image URL is required")
    String imageUrl,
    String publicId,
    String altText,
    Integer displayOrder,
    Boolean isPrimary
) {}
