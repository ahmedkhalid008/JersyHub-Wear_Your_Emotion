package com.jerseyhub.category.dto;

import com.jerseyhub.category.Category;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CategoryResponse(
    UUID id,
    String name,
    String slug,
    String description,
    String imageUrl,
    UUID parentId,
    String parentName,
    boolean active,
    List<CategoryResponse> children,
    Instant createdAt,
    Instant updatedAt
) {
    public static CategoryResponse from(Category category) {
        List<CategoryResponse> childResponses = category.getChildren() != null
                ? category.getChildren().stream().map(CategoryResponse::from).toList()
                : List.of();

        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getImageUrl(),
                category.getParent() != null ? category.getParent().getId() : null,
                category.getParent() != null ? category.getParent().getName() : null,
                category.isActive(),
                childResponses,
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }

    public static CategoryResponse shallowFrom(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getImageUrl(),
                category.getParent() != null ? category.getParent().getId() : null,
                category.getParent() != null ? category.getParent().getName() : null,
                category.isActive(),
                List.of(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
}
