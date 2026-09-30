package com.jerseyhub.product;

import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.product.dto.ProductVariantCreateRequest;
import com.jerseyhub.product.dto.ProductVariantResponse;
import com.jerseyhub.product.service.ProductVariantService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class ProductVariantServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductVariantRepository variantRepository;

    @InjectMocks
    private ProductVariantService variantService;

    private UUID productId;
    private Product product;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        product = new Product();
        product.setId(productId);
        product.setName("Real Madrid Home Jersey");
    }

    @Test
    @DisplayName("Should create product variant successfully")
    void createVariant_Success() {
        ProductVariantCreateRequest request = new ProductVariantCreateRequest("RM-HM-2526-M", JerseySize.M, new BigDecimal("2490.00"));

        given(productRepository.findById(productId)).willReturn(Optional.of(product));
        given(variantRepository.existsBySku("RM-HM-2526-M")).willReturn(false);
        given(variantRepository.existsByProductIdAndSize(productId, JerseySize.M)).willReturn(false);

        ProductVariant savedVariant = new ProductVariant(product, "RM-HM-2526-M", JerseySize.M, new BigDecimal("2490.00"), 0);
        savedVariant.setId(UUID.randomUUID());
        given(variantRepository.save(any(ProductVariant.class))).willReturn(savedVariant);

        ProductVariantResponse response = variantService.createVariant(productId, request);

        assertThat(response).isNotNull();
        assertThat(response.sku()).isEqualTo("RM-HM-2526-M");
        assertThat(response.size()).isEqualTo(JerseySize.M);
    }

    @Test
    @DisplayName("Should throw BusinessException when variant SKU already exists")
    void createVariant_DuplicateSku_ThrowsException() {
        ProductVariantCreateRequest request = new ProductVariantCreateRequest("RM-HM-2526-M", JerseySize.M, new BigDecimal("2490.00"));

        given(productRepository.findById(productId)).willReturn(Optional.of(product));
        given(variantRepository.existsBySku("RM-HM-2526-M")).willReturn(true);

        assertThatThrownBy(() -> variantService.createVariant(productId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("SKU already exists");
    }

    @Test
    @DisplayName("Should throw BusinessException when variant size already exists for product")
    void createVariant_DuplicateSize_ThrowsException() {
        ProductVariantCreateRequest request = new ProductVariantCreateRequest("RM-HM-2526-M", JerseySize.M, new BigDecimal("2490.00"));

        given(productRepository.findById(productId)).willReturn(Optional.of(product));
        given(variantRepository.existsBySku("RM-HM-2526-M")).willReturn(false);
        given(variantRepository.existsByProductIdAndSize(productId, JerseySize.M)).willReturn(true);

        assertThatThrownBy(() -> variantService.createVariant(productId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Variant size already exists for this product");
    }
}
