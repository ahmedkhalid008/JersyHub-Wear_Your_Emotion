package com.jerseyhub.inventory.dto;

import com.jerseyhub.inventory.InventoryTransactionType;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record InventoryAdjustmentRequest(
    @NotNull(message = "Product variant ID is required")
    UUID productVariantId,

    @NotNull(message = "Quantity change is required")
    Integer quantityChange,

    @NotNull(message = "Transaction type is required")
    InventoryTransactionType transactionType,

    String note
) {}
