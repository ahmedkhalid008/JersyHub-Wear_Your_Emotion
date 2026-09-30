package com.jerseyhub.product.controller;

import com.jerseyhub.common.response.ApiResponse;
import com.jerseyhub.product.dto.ProductVariantCreateRequest;
import com.jerseyhub.product.dto.ProductVariantResponse;
import com.jerseyhub.product.dto.ProductVariantStatusRequest;
import com.jerseyhub.product.dto.ProductVariantUpdateRequest;
import com.jerseyhub.product.service.ProductVariantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/products/{productId}/variants")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Product Variant Management", description = "Admin Variant CRUD & Status APIs")
public class ProductVariantAdminController {

    private final ProductVariantService variantService;

    public ProductVariantAdminController(ProductVariantService variantService) {
        this.variantService = variantService;
    }

    @PostMapping
    @Operation(summary = "Create product variant (Admin)")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> createVariant(
            @PathVariable UUID productId,
            @Valid @RequestBody ProductVariantCreateRequest request
    ) {
        ProductVariantResponse response = variantService.createVariant(productId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Variant created successfully", response));
    }

    @PutMapping("/{variantId}")
    @Operation(summary = "Update product variant (Admin)")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> updateVariant(
            @PathVariable UUID productId,
            @PathVariable UUID variantId,
            @Valid @RequestBody ProductVariantUpdateRequest request
    ) {
        ProductVariantResponse response = variantService.updateVariant(productId, variantId, request);
        return ResponseEntity.ok(ApiResponse.success("Variant updated successfully", response));
    }

    @PatchMapping("/{variantId}/status")
    @Operation(summary = "Activate or deactivate variant (Admin)")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> updateVariantStatus(
            @PathVariable UUID productId,
            @PathVariable UUID variantId,
            @Valid @RequestBody ProductVariantStatusRequest request
    ) {
        ProductVariantResponse response = variantService.updateVariantStatus(productId, variantId, request.active());
        return ResponseEntity.ok(ApiResponse.success("Variant status updated successfully", response));
    }
}
