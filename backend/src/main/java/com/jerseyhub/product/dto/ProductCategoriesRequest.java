package com.jerseyhub.product.dto;

import jakarta.validation.constraints.NotNull;

import java.util.Set;
import java.util.UUID;

public record ProductCategoriesRequest(
    @NotNull(message = "Category IDs set is required")
    Set<UUID> categoryIds
) {}
