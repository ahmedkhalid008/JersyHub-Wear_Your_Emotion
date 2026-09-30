package com.jerseyhub.inventory.controller;

import com.jerseyhub.common.response.ApiResponse;
import com.jerseyhub.common.response.PageResponse;
import com.jerseyhub.inventory.dto.InventoryAdjustmentRequest;
import com.jerseyhub.inventory.dto.InventoryTransactionResponse;
import com.jerseyhub.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/inventory")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Inventory Management", description = "Admin Stock Adjustment & Transaction Log APIs")
public class InventoryAdminController {

    private final InventoryService inventoryService;

    public InventoryAdminController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/adjust")
    @Operation(summary = "Adjust variant stock quantity (Admin)")
    public ResponseEntity<ApiResponse<InventoryTransactionResponse>> adjustStock(
            @Valid @RequestBody InventoryAdjustmentRequest request
    ) {
        InventoryTransactionResponse response = inventoryService.adjustStock(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Stock adjusted successfully", response));
    }

    @GetMapping("/{productVariantId}/transactions")
    @Operation(summary = "Get paginated audit transactions for a product variant (Admin)")
    public ResponseEntity<ApiResponse<PageResponse<InventoryTransactionResponse>>> getVariantTransactions(
            @PathVariable UUID productVariantId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageResponse<InventoryTransactionResponse> response = inventoryService.getVariantTransactions(productVariantId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Inventory transactions retrieved successfully", response));
    }
}
