package com.jerseyhub.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, UUID> {
    List<InventoryTransaction> findByProductVariantIdOrderByCreatedAtDesc(UUID productVariantId);
    org.springframework.data.domain.Page<InventoryTransaction> findByProductVariantId(UUID productVariantId, org.springframework.data.domain.Pageable pageable);
}
