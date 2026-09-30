package com.jerseyhub.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CategoryCreateRequest(
    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
    String name,

    @NotBlank(message = "Category slug is required")
    @Size(min = 2, max = 100, message = "Category slug must be between 2 and 100 characters")
    String slug,

    String description,
    String imageUrl,
    UUID parentId
) {}
