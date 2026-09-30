package com.jerseyhub.product.controller;

import com.jerseyhub.common.response.ApiResponse;
import com.jerseyhub.product.dto.ProductImageCreateRequest;
import com.jerseyhub.product.dto.ProductImageReorderRequest;
import com.jerseyhub.product.dto.ProductImageResponse;
import com.jerseyhub.product.dto.ProductImageUpdateRequest;
import com.jerseyhub.product.service.ProductImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/products/{productId}/images")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Product Image Management", description = "Admin Image Metadata, Primary Selection & Reordering APIs")
public class ProductImageAdminController {

    private final ProductImageService imageService;

    public ProductImageAdminController(ProductImageService imageService) {
        this.imageService = imageService;
    }

    @PostMapping
    @Operation(summary = "Add image metadata to product (Admin)")
    public ResponseEntity<ApiResponse<ProductImageResponse>> addImage(
            @PathVariable UUID productId,
            @Valid @RequestBody ProductImageCreateRequest request
    ) {
        ProductImageResponse response = imageService.addImage(productId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Image added successfully", response));
    }

    @PutMapping("/{imageId}")
    @Operation(summary = "Update image metadata (Admin)")
    public ResponseEntity<ApiResponse<ProductImageResponse>> updateImage(
            @PathVariable UUID productId,
            @PathVariable UUID imageId,
            @Valid @RequestBody ProductImageUpdateRequest request
    ) {
        ProductImageResponse response = imageService.updateImage(productId, imageId, request);
        return ResponseEntity.ok(ApiResponse.success("Image updated successfully", response));
    }

    @DeleteMapping("/{imageId}")
    @Operation(summary = "Delete image metadata (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @PathVariable UUID productId,
            @PathVariable UUID imageId
    ) {
        imageService.deleteImage(productId, imageId);
        return ResponseEntity.ok(ApiResponse.success("Image deleted successfully"));
    }

    @PatchMapping("/{imageId}/primary")
    @Operation(summary = "Set primary display image for product (Admin)")
    public ResponseEntity<ApiResponse<ProductImageResponse>> setPrimaryImage(
            @PathVariable UUID productId,
            @PathVariable UUID imageId
    ) {
        ProductImageResponse response = imageService.setPrimaryImage(productId, imageId);
        return ResponseEntity.ok(ApiResponse.success("Primary image set successfully", response));
    }

    @PatchMapping("/reorder")
    @Operation(summary = "Reorder display order of product images (Admin)")
    public ResponseEntity<ApiResponse<List<ProductImageResponse>>> reorderImages(
            @PathVariable UUID productId,
            @Valid @RequestBody ProductImageReorderRequest request
    ) {
        List<ProductImageResponse> response = imageService.reorderImages(productId, request);
        return ResponseEntity.ok(ApiResponse.success("Images reordered successfully", response));
    }
}
