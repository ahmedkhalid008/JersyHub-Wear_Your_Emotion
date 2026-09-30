package com.jerseyhub.product;

import com.jerseyhub.category.CategoryRepository;
import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.product.dto.ProductCreateRequest;
import com.jerseyhub.product.dto.ProductDetailResponse;
import com.jerseyhub.product.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductService productService;

    private UUID productId;
    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        sampleProduct = new Product();
        sampleProduct.setId(productId);
        sampleProduct.setName("Real Madrid Home Jersey 2025/26");
        sampleProduct.setSlug("real-madrid-home-jersey-2025-26");
        sampleProduct.setBrand("Adidas");
        sampleProduct.setTeam("Real Madrid");
        sampleProduct.setLeague("La Liga");
        sampleProduct.setJerseyType(JerseyType.HOME);
        sampleProduct.setAuthenticity(JerseyAuthenticity.AUTHENTIC);
        sampleProduct.setBasePrice(new BigDecimal("2490.00"));
        sampleProduct.setActive(true);
    }

    @Test
    @DisplayName("Should create product successfully")
    void createProduct_Success() {
        ProductCreateRequest request = new ProductCreateRequest(
                "Real Madrid Home Jersey 2025/26",
                "real-madrid-home-jersey-2025-26",
                "Description",
                "Adidas",
                "Real Madrid",
                "La Liga",
                "Spain",
                "2025/26",
                JerseyType.HOME,
                JerseyAuthenticity.AUTHENTIC,
                "Polyester",
                new BigDecimal("2490.00"),
                true,
                null
        );

        given(productRepository.existsBySlug("real-madrid-home-jersey-2025-26")).willReturn(false);
        given(productRepository.save(any(Product.class))).willReturn(sampleProduct);

        ProductDetailResponse response = productService.createProduct(request);

        assertThat(response).isNotNull();
        assertThat(response.name()).contains("Real Madrid");
        assertThat(response.basePrice()).isEqualTo(new BigDecimal("2490.00"));
        assertThat(response.active()).isTrue();
    }

    @Test
    @DisplayName("Should throw BusinessException when creating product with duplicate slug")
    void createProduct_DuplicateSlug_ThrowsException() {
        ProductCreateRequest request = new ProductCreateRequest(
                "Real Madrid Home Jersey 2025/26",
                "real-madrid-home-jersey-2025-26",
                "Desc",
                "Adidas",
                "Real Madrid",
                "La Liga",
                "Spain",
                "2025/26",
                JerseyType.HOME,
                JerseyAuthenticity.AUTHENTIC,
                "Polyester",
                new BigDecimal("2490.00"),
                true,
                null
        );

        given(productRepository.existsBySlug("real-madrid-home-jersey-2025-26")).willReturn(true);

        assertThatThrownBy(() -> productService.createProduct(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Product slug already exists");
    }
}
