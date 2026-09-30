package com.jerseyhub.category.service;

import com.jerseyhub.category.Category;
import com.jerseyhub.category.CategoryRepository;
import com.jerseyhub.category.dto.CategoryCreateRequest;
import com.jerseyhub.category.dto.CategoryResponse;
import com.jerseyhub.category.dto.CategoryUpdateRequest;
import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.common.response.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        String normalizedSlug = normalizeSlug(request.slug());

        if (categoryRepository.existsBySlug(normalizedSlug)) {
            throw new BusinessException("Category slug already exists", ErrorCode.DUPLICATE_SLUG.getCode());
        }

        Category category = new Category();
        category.setName(request.name().trim());
        category.setSlug(normalizedSlug);
        category.setDescription(request.description());
        category.setImageUrl(request.imageUrl());
        category.setActive(true);

        if (request.parentId() != null) {
            Category parent = categoryRepository.findById(request.parentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
            category.setParent(parent);
        }

        Category savedCategory = categoryRepository.save(category);
        return CategoryResponse.shallowFrom(savedCategory);
    }

    @Transactional
    public CategoryResponse updateCategory(UUID id, CategoryUpdateRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        String normalizedSlug = normalizeSlug(request.slug());

        if (!category.getSlug().equalsIgnoreCase(normalizedSlug) && categoryRepository.existsBySlug(normalizedSlug)) {
            throw new BusinessException("Category slug already exists", ErrorCode.DUPLICATE_SLUG.getCode());
        }

        if (request.parentId() != null) {
            if (request.parentId().equals(id)) {
                throw new BusinessException("Category cannot be its own parent", ErrorCode.INVALID_CATEGORY_HIERARCHY.getCode());
            }

            Category parent = categoryRepository.findById(request.parentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));

            // Check circular hierarchy
            Category current = parent;
            while (current != null) {
                if (current.getId().equals(id)) {
                    throw new BusinessException("Circular category hierarchy detected", ErrorCode.INVALID_CATEGORY_HIERARCHY.getCode());
                }
                current = current.getParent();
            }

            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        category.setName(request.name().trim());
        category.setSlug(normalizedSlug);
        category.setDescription(request.description());
        category.setImageUrl(request.imageUrl());

        Category updatedCategory = categoryRepository.save(category);
        return CategoryResponse.shallowFrom(updatedCategory);
    }

    @Transactional
    public CategoryResponse updateCategoryStatus(UUID id, boolean active) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        category.setActive(active);
        Category saved = categoryRepository.save(category);
        return CategoryResponse.shallowFrom(saved);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategoryTree() {
        List<Category> allActive = categoryRepository.findByActiveTrue();
        // Return root categories (where parent is null or inactive)
        return allActive.stream()
                .filter(c -> c.getParent() == null || !c.getParent().isActive())
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(UUID id, boolean publicOnly) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (publicOnly && !category.isActive()) {
            throw new ResourceNotFoundException("Category not found");
        }

        return CategoryResponse.shallowFrom(category);
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryBySlug(String slug, boolean publicOnly) {
        String normalizedSlug = normalizeSlug(slug);
        Category category = categoryRepository.findBySlug(normalizedSlug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (publicOnly && !category.isActive()) {
            throw new ResourceNotFoundException("Category not found");
        }

        return CategoryResponse.shallowFrom(category);
    }

    @Transactional(readOnly = true)
    public PageResponse<CategoryResponse> getAllCategoriesAdmin(Pageable pageable) {
        Page<CategoryResponse> page = categoryRepository.findAll(pageable)
                .map(CategoryResponse::shallowFrom);
        return PageResponse.from(page);
    }

    private String normalizeSlug(String slug) {
        return slug != null ? slug.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", "-") : "";
    }
}
