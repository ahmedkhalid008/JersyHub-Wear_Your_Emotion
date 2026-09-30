package com.jerseyhub.category.controller;

import com.jerseyhub.category.dto.CategoryCreateRequest;
import com.jerseyhub.category.dto.CategoryResponse;
import com.jerseyhub.category.dto.CategoryStatusRequest;
import com.jerseyhub.category.dto.CategoryUpdateRequest;
import com.jerseyhub.category.service.CategoryService;
import com.jerseyhub.common.response.ApiResponse;
import com.jerseyhub.common.response.PageResponse;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/categories")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Category Management", description = "Admin Category CRUD & Hierarchy Management APIs")
public class CategoryAdminController {

    private final CategoryService categoryService;

    public CategoryAdminController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    @Operation(summary = "Create a new category (Admin)")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update category details (Admin)")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody CategoryUpdateRequest request
    ) {
        CategoryResponse response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Activate or deactivate category (Admin)")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategoryStatus(
            @PathVariable UUID id,
            @Valid @RequestBody CategoryStatusRequest request
    ) {
        CategoryResponse response = categoryService.updateCategoryStatus(id, request.active());
        return ResponseEntity.ok(ApiResponse.success("Category status updated successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get paginated list of all categories including inactive ones (Admin)")
    public ResponseEntity<ApiResponse<PageResponse<CategoryResponse>>> getAllCategories(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageResponse<CategoryResponse> categories = categoryService.getAllCategoriesAdmin(pageable);
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get any category details by ID including inactive (Admin)")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryByIdAdmin(@PathVariable UUID id) {
        CategoryResponse category = categoryService.getCategoryById(id, false);
        return ResponseEntity.ok(ApiResponse.success("Category retrieved successfully", category));
    }
}
