package com.jerseyhub.product.dto;

import jakarta.validation.constraints.NotNull;

public record ProductVariantStatusRequest(
    @NotNull(message = "Active status is required")
    Boolean active
) {}
