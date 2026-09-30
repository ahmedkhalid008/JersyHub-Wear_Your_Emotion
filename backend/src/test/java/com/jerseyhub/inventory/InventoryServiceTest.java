package com.jerseyhub.inventory;

import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.inventory.dto.InventoryAdjustmentRequest;
import com.jerseyhub.inventory.dto.InventoryTransactionResponse;
import com.jerseyhub.inventory.service.InventoryService;
import com.jerseyhub.product.JerseySize;
import com.jerseyhub.product.Product;
import com.jerseyhub.product.ProductVariant;
import com.jerseyhub.product.ProductVariantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private ProductVariantRepository variantRepository;

    @Mock
    private InventoryTransactionRepository transactionRepository;

    @InjectMocks
    private InventoryService inventoryService;

    private UUID variantId;
    private ProductVariant variant;

    @BeforeEach
    void setUp() {
        variantId = UUID.randomUUID();
        Product product = new Product();
        product.setName("Real Madrid Jersey");

        variant = new ProductVariant(product, "RM-HM-M", JerseySize.M, new BigDecimal("2490.00"), 10);
        variant.setId(variantId);
    }

    @Test
    @DisplayName("Should successfully increase stock quantity and create audit transaction")
    void adjustStock_PositiveAdjustment_Success() {
        InventoryAdjustmentRequest request = new InventoryAdjustmentRequest(variantId, 15, InventoryTransactionType.RESTOCK, "New delivery");

        given(variantRepository.findById(variantId)).willReturn(Optional.of(variant));
        given(transactionRepository.save(any(InventoryTransaction.class))).willAnswer(inv -> inv.getArgument(0));

        InventoryTransactionResponse response = inventoryService.adjustStock(request);

        assertThat(response).isNotNull();
        assertThat(variant.getStockQuantity()).isEqualTo(25); // 10 + 15 = 25
        assertThat(response.quantityChange()).isEqualTo(15);
        assertThat(response.transactionType()).isEqualTo(InventoryTransactionType.RESTOCK);

        verify(variantRepository).save(variant);
        verify(transactionRepository).save(any(InventoryTransaction.class));
    }

    @Test
    @DisplayName("Should throw BusinessException when stock adjustment would result in negative stock")
    void adjustStock_NegativeStock_ThrowsException() {
        InventoryAdjustmentRequest request = new InventoryAdjustmentRequest(variantId, -20, InventoryTransactionType.ADJUSTMENT, "Correction");

        given(variantRepository.findById(variantId)).willReturn(Optional.of(variant));

        assertThatThrownBy(() -> inventoryService.adjustStock(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Stock quantity cannot be negative");
    }
}
