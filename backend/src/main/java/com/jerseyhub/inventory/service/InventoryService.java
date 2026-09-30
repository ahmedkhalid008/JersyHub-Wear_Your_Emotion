package com.jerseyhub.inventory.service;

import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.common.response.PageResponse;
import com.jerseyhub.inventory.InventoryTransaction;
import com.jerseyhub.inventory.InventoryTransactionRepository;
import com.jerseyhub.inventory.dto.InventoryAdjustmentRequest;
import com.jerseyhub.inventory.dto.InventoryTransactionResponse;
import com.jerseyhub.product.ProductVariant;
import com.jerseyhub.product.ProductVariantRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class InventoryService {

    private final ProductVariantRepository variantRepository;
    private final InventoryTransactionRepository transactionRepository;

    public InventoryService(ProductVariantRepository variantRepository, InventoryTransactionRepository transactionRepository) {
        this.variantRepository = variantRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public InventoryTransactionResponse adjustStock(InventoryAdjustmentRequest request) {
        ProductVariant variant = variantRepository.findById(request.productVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Product variant not found"));

        int currentStock = variant.getStockQuantity();
        int newStock = currentStock + request.quantityChange();

        if (newStock < 0) {
            throw new BusinessException(
                    "Stock quantity cannot be negative. Current stock: " + currentStock + ", change requested: " + request.quantityChange(),
                    ErrorCode.INSUFFICIENT_STOCK.getCode()
            );
        }

        variant.setStockQuantity(newStock);
        variantRepository.save(variant);

        InventoryTransaction tx = new InventoryTransaction();
        tx.setProductVariant(variant);
        tx.setQuantityChange(request.quantityChange());
        tx.setTransactionType(request.transactionType());
        tx.setNote(request.note());

        InventoryTransaction savedTx = transactionRepository.save(tx);
        return InventoryTransactionResponse.from(savedTx);
    }

    @Transactional(readOnly = true)
    public PageResponse<InventoryTransactionResponse> getVariantTransactions(UUID productVariantId, Pageable pageable) {
        if (!variantRepository.existsById(productVariantId)) {
            throw new ResourceNotFoundException("Product variant not found");
        }

        Page<InventoryTransactionResponse> page = transactionRepository.findByProductVariantId(productVariantId, pageable)
                .map(InventoryTransactionResponse::from);

        return PageResponse.from(page);
    }
}
