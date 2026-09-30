package com.jerseyhub.category;

import com.jerseyhub.category.dto.CategoryCreateRequest;
import com.jerseyhub.category.dto.CategoryResponse;
import com.jerseyhub.category.dto.CategoryUpdateRequest;
import com.jerseyhub.category.service.CategoryService;
import com.jerseyhub.common.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private Category parentCategory;
    private UUID parentId;

    @BeforeEach
    void setUp() {
        parentId = UUID.randomUUID();
        parentCategory = new Category("Clubs", "clubs");
        parentCategory.setId(parentId);
    }

    @Test
    @DisplayName("Should create root category successfully")
    void createCategory_Success() {
        CategoryCreateRequest request = new CategoryCreateRequest("Club Jerseys", "club-jerseys", "Desc", null, null);
        given(categoryRepository.existsBySlug("club-jerseys")).willReturn(false);

        Category saved = new Category("Club Jerseys", "club-jerseys");
        saved.setId(UUID.randomUUID());
        given(categoryRepository.save(any(Category.class))).willReturn(saved);

        CategoryResponse response = categoryService.createCategory(request);

        assertThat(response).isNotNull();
        assertThat(response.name()).isEqualTo("Club Jerseys");
        assertThat(response.slug()).isEqualTo("club-jerseys");
    }

    @Test
    @DisplayName("Should throw BusinessException when creating category with duplicate slug")
    void createCategory_DuplicateSlug_ThrowsException() {
        CategoryCreateRequest request = new CategoryCreateRequest("Club Jerseys", "club-jerseys", "Desc", null, null);
        given(categoryRepository.existsBySlug("club-jerseys")).willReturn(true);

        assertThatThrownBy(() -> categoryService.createCategory(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Category slug already exists");
    }

    @Test
    @DisplayName("Should throw BusinessException when category is set as its own parent")
    void updateCategory_SelfParent_ThrowsException() {
        CategoryUpdateRequest request = new CategoryUpdateRequest("Club Jerseys", "club-jerseys", "Desc", null, parentId);
        given(categoryRepository.findById(parentId)).willReturn(Optional.of(parentCategory));

        assertThatThrownBy(() -> categoryService.updateCategory(parentId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Category cannot be its own parent");
    }
}
