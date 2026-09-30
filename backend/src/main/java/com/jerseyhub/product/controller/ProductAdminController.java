package com.jerseyhub.product.controller;

import com.jerseyhub.common.response.ApiResponse;
import com.jerseyhub.common.response.PageResponse;
import com.jerseyhub.product.JerseyAuthenticity;
import com.jerseyhub.product.JerseyType;
import com.jerseyhub.product.dto.ProductCategoriesRequest;
import com.jerseyhub.product.dto.ProductCreateRequest;
import com.jerseyhub.product.dto.ProductDetailResponse;
import com.jerseyhub.product.dto.ProductStatusRequest;
import com.jerseyhub.product.dto.ProductSummaryResponse;
import com.jerseyhub.product.dto.ProductUpdateRequest;
import com.jerseyhub.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/products")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Product Management", description = "Admin Product CRUD & Category Mapping APIs")
public class ProductAdminController {

    private final ProductService productService;

    public ProductAdminController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    @Operation(summary = "Create a new product (Admin)")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        ProductDetailResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update product details (Admin)")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody ProductUpdateRequest request
    ) {
        ProductDetailResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Activate or deactivate product (Admin)")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> updateProductStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ProductStatusRequest request
    ) {
        ProductDetailResponse response = productService.updateProductStatus(id, request.active());
        return ResponseEntity.ok(ApiResponse.success("Product status updated successfully", response));
    }

    @PutMapping("/{id}/categories")
    @Operation(summary = "Assign categories to product (Admin)")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> updateProductCategories(
            @PathVariable UUID id,
            @Valid @RequestBody ProductCategoriesRequest request
    ) {
        ProductDetailResponse response = productService.updateProductCategories(id, request.categoryIds());
        return ResponseEntity.ok(ApiResponse.success("Product categories updated successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get paginated list of all products including inactive ones (Admin)")
    public ResponseEntity<ApiResponse<PageResponse<ProductSummaryResponse>>> getAllProductsAdmin(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String team,
            @RequestParam(required = false) String league,
            @RequestParam(required = false) String season,
            @RequestParam(required = false) JerseyType jerseyType,
            @RequestParam(required = false) JerseyAuthenticity authenticity,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false, defaultValue = "newest") String sort,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size
    ) {
        PageResponse<ProductSummaryResponse> response = productService.getAdminProducts(
                active, search, category, brand, team, league, season, jerseyType, authenticity, featured, minPrice, maxPrice, sort, page, size
        );
        return ResponseEntity.ok(ApiResponse.success("Admin products retrieved successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get any product details by ID including inactive (Admin)")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getProductByIdAdmin(@PathVariable UUID id) {
        ProductDetailResponse response = productService.getProductById(id, false);
        return ResponseEntity.ok(ApiResponse.success("Product details retrieved successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete product (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully"));
    }
}
