package com.jerseyhub.product.dto;

import com.jerseyhub.product.JerseySize;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ProductVariantCreateRequest(
    @NotBlank(message = "SKU is required")
    String sku,

    @NotNull(message = "Size is required")
    JerseySize size,

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    BigDecimal price
) {}
