package com.jerseyhub.order.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CheckoutItemRequest(
    @NotNull(message = "Product variant ID is required")
    UUID productVariantId,
    @NotNull(message = "Quantity is required")
    Integer quantity
) {}
