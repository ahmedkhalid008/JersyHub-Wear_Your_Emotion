package com.jerseyhub.inventory.dto;

import com.jerseyhub.inventory.InventoryTransaction;
import com.jerseyhub.inventory.InventoryTransactionType;

import java.time.Instant;
import java.util.UUID;

public record InventoryTransactionResponse(
    UUID id,
    UUID productVariantId,
    String productVariantSku,
    int quantityChange,
    InventoryTransactionType transactionType,
    String referenceType,
    UUID referenceId,
    String note,
    Instant createdAt
) {
    public static InventoryTransactionResponse from(InventoryTransaction tx) {
        return new InventoryTransactionResponse(
            tx.getId(),
            tx.getProductVariant() != null ? tx.getProductVariant().getId() : null,
            tx.getProductVariant() != null ? tx.getProductVariant().getSku() : null,
            tx.getQuantityChange(),
            tx.getTransactionType(),
            tx.getReferenceType(),
            tx.getReferenceId(),
            tx.getNote(),
            tx.getCreatedAt()
        );
    }
}
