package com.jerseyhub.product.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record ProductImageReorderRequest(
    @NotEmpty(message = "Image order list cannot be empty")
    List<ImageOrderItem> imageOrders
) {
    public record ImageOrderItem(
        @NotNull(message = "Image ID is required")
        UUID imageId,

        @NotNull(message = "Display order is required")
        Integer displayOrder
    ) {}
}
