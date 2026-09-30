package com.jerseyhub.product.service;

import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.product.Product;
import com.jerseyhub.product.ProductRepository;
import com.jerseyhub.product.ProductVariant;
import com.jerseyhub.product.ProductVariantRepository;
import com.jerseyhub.product.dto.ProductVariantCreateRequest;
import com.jerseyhub.product.dto.ProductVariantResponse;
import com.jerseyhub.product.dto.ProductVariantUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Service
public class ProductVariantService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;

    public ProductVariantService(ProductRepository productRepository, ProductVariantRepository variantRepository) {
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
    }

    @Transactional
    public ProductVariantResponse createVariant(UUID productId, ProductVariantCreateRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        String normalizedSku = normalizeSku(request.sku());

        if (variantRepository.existsBySku(normalizedSku)) {
            throw new BusinessException("SKU already exists", ErrorCode.DUPLICATE_SKU.getCode());
        }

        if (variantRepository.existsByProductIdAndSize(productId, request.size())) {
            throw new BusinessException("Variant size already exists for this product", ErrorCode.INVALID_REQUEST.getCode());
        }

        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setSku(normalizedSku);
        variant.setSize(request.size());
        variant.setPrice(request.price());
        variant.setStockQuantity(0);
        variant.setActive(true);

        ProductVariant savedVariant = variantRepository.save(variant);
        return ProductVariantResponse.from(savedVariant);
    }

    @Transactional
    public ProductVariantResponse updateVariant(UUID productId, UUID variantId, ProductVariantUpdateRequest request) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product variant not found"));

        if (!variant.getProduct().getId().equals(productId)) {
            throw new BusinessException("Variant does not belong to specified product", ErrorCode.INVALID_REQUEST.getCode());
        }

        String normalizedSku = normalizeSku(request.sku());

        if (!variant.getSku().equalsIgnoreCase(normalizedSku) && variantRepository.existsBySku(normalizedSku)) {
            throw new BusinessException("SKU already exists", ErrorCode.DUPLICATE_SKU.getCode());
        }

        if (variant.getSize() != request.size() && variantRepository.existsByProductIdAndSize(productId, request.size())) {
            throw new BusinessException("Variant size already exists for this product", ErrorCode.INVALID_REQUEST.getCode());
        }

        variant.setSku(normalizedSku);
        variant.setSize(request.size());
        variant.setPrice(request.price());
        if (request.active() != null) {
            variant.setActive(request.active());
        }

        ProductVariant savedVariant = variantRepository.save(variant);
        return ProductVariantResponse.from(savedVariant);
    }

    @Transactional
    public ProductVariantResponse updateVariantStatus(UUID productId, UUID variantId, boolean active) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product variant not found"));

        if (!variant.getProduct().getId().equals(productId)) {
            throw new BusinessException("Variant does not belong to specified product", ErrorCode.INVALID_REQUEST.getCode());
        }

        variant.setActive(active);
        ProductVariant savedVariant = variantRepository.save(variant);
        return ProductVariantResponse.from(savedVariant);
    }

    private String normalizeSku(String sku) {
        return sku != null ? sku.trim().toUpperCase(Locale.ROOT) : "";
    }
}
