package com.jerseyhub.product.controller;

import com.jerseyhub.common.response.ApiResponse;
import com.jerseyhub.common.response.PageResponse;
import com.jerseyhub.product.JerseyAuthenticity;
import com.jerseyhub.product.JerseyType;
import com.jerseyhub.product.dto.ProductDetailResponse;
import com.jerseyhub.product.dto.ProductSummaryResponse;
import com.jerseyhub.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@Tag(name = "Product Catalog", description = "Public Product Catalog Browsing, Search, and Filtering APIs")
public class ProductPublicController {

    private final ProductService productService;

    public ProductPublicController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "Browse, search, and filter active products in catalog")
    public ResponseEntity<ApiResponse<PageResponse<ProductSummaryResponse>>> getPublicProducts(
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
        PageResponse<ProductSummaryResponse> response = productService.getPublicProducts(
                search, category, brand, team, league, season, jerseyType, authenticity, featured, minPrice, maxPrice, sort, page, size
        );
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get active product details by ID")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getProductById(@PathVariable UUID id) {
        ProductDetailResponse response = productService.getProductById(id, true);
        return ResponseEntity.ok(ApiResponse.success("Product details retrieved successfully", response));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get active product details by slug")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getProductBySlug(@PathVariable String slug) {
        ProductDetailResponse response = productService.getProductBySlug(slug, true);
        return ResponseEntity.ok(ApiResponse.success("Product details retrieved successfully", response));
    }
}
