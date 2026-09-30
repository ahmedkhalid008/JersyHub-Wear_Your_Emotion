package com.jerseyhub.product.dto;

import com.jerseyhub.product.JerseyAuthenticity;
import com.jerseyhub.product.JerseyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

public record ProductCreateRequest(
    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 150, message = "Product name must be between 2 and 150 characters")
    String name,

    @NotBlank(message = "Product slug is required")
    @Size(min = 2, max = 150, message = "Product slug must be between 2 and 150 characters")
    String slug,

    String description,
    String brand,
    String team,
    String league,
    String country,
    String season,

    @NotNull(message = "Jersey type is required")
    JerseyType jerseyType,

    @NotNull(message = "Authenticity is required")
    JerseyAuthenticity authenticity,

    String material,

    @NotNull(message = "Base price is required")
    @Positive(message = "Base price must be positive")
    BigDecimal basePrice,

    Boolean featured,
    Set<UUID> categoryIds
) {}
