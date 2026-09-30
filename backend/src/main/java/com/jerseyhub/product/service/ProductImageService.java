package com.jerseyhub.product.service;

import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.product.Product;
import com.jerseyhub.product.ProductImage;
import com.jerseyhub.product.ProductImageRepository;
import com.jerseyhub.product.ProductRepository;
import com.jerseyhub.product.dto.ProductImageCreateRequest;
import com.jerseyhub.product.dto.ProductImageReorderRequest;
import com.jerseyhub.product.dto.ProductImageResponse;
import com.jerseyhub.product.dto.ProductImageUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProductImageService {

    private final ProductRepository productRepository;
    private final ProductImageRepository imageRepository;

    public ProductImageService(ProductRepository productRepository, ProductImageRepository imageRepository) {
        this.productRepository = productRepository;
        this.imageRepository = imageRepository;
    }

    @Transactional
    public ProductImageResponse addImage(UUID productId, ProductImageCreateRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        boolean isPrimary = Boolean.TRUE.equals(request.isPrimary());

        if (isPrimary) {
            clearPrimaryFlag(product);
        } else if (product.getImages().isEmpty()) {
            isPrimary = true; // First image default to primary
        }

        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setImageUrl(request.imageUrl());
        image.setPublicId(request.publicId());
        image.setAltText(request.altText());
        image.setDisplayOrder(request.displayOrder() != null ? request.displayOrder() : product.getImages().size());
        image.setPrimary(isPrimary);

        ProductImage savedImage = imageRepository.save(image);
        return ProductImageResponse.from(savedImage);
    }

    @Transactional
    public ProductImageResponse updateImage(UUID productId, UUID imageId, ProductImageUpdateRequest request) {
        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Product image not found"));

        if (!image.getProduct().getId().equals(productId)) {
            throw new BusinessException("Image does not belong to specified product", ErrorCode.INVALID_REQUEST.getCode());
        }

        if (Boolean.TRUE.equals(request.isPrimary())) {
            clearPrimaryFlag(image.getProduct());
            image.setPrimary(true);
        }

        image.setImageUrl(request.imageUrl());
        if (request.altText() != null) {
            image.setAltText(request.altText());
        }
        if (request.displayOrder() != null) {
            image.setDisplayOrder(request.displayOrder());
        }

        ProductImage savedImage = imageRepository.save(image);
        return ProductImageResponse.from(savedImage);
    }

    @Transactional
    public void deleteImage(UUID productId, UUID imageId) {
        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Product image not found"));

        if (!image.getProduct().getId().equals(productId)) {
            throw new BusinessException("Image does not belong to specified product", ErrorCode.INVALID_REQUEST.getCode());
        }

        boolean wasPrimary = image.isPrimary();
        Product product = image.getProduct();

        imageRepository.delete(image);

        if (wasPrimary) {
            List<ProductImage> remaining = imageRepository.findByProductIdOrderByDisplayOrderAsc(productId);
            if (!remaining.isEmpty()) {
                ProductImage newPrimary = remaining.get(0);
                newPrimary.setPrimary(true);
                imageRepository.save(newPrimary);
            }
        }
    }

    @Transactional
    public ProductImageResponse setPrimaryImage(UUID productId, UUID imageId) {
        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Product image not found"));

        if (!image.getProduct().getId().equals(productId)) {
            throw new BusinessException("Image does not belong to specified product", ErrorCode.INVALID_REQUEST.getCode());
        }

        clearPrimaryFlag(image.getProduct());
        image.setPrimary(true);

        ProductImage savedImage = imageRepository.save(image);
        return ProductImageResponse.from(savedImage);
    }

    @Transactional
    public List<ProductImageResponse> reorderImages(UUID productId, ProductImageReorderRequest request) {
        List<ProductImage> images = imageRepository.findByProductIdOrderByDisplayOrderAsc(productId);
        Map<UUID, Integer> orderMap = request.imageOrders().stream()
                .collect(Collectors.toMap(ProductImageReorderRequest.ImageOrderItem::imageId, ProductImageReorderRequest.ImageOrderItem::displayOrder));

        for (ProductImage img : images) {
            if (orderMap.containsKey(img.getId())) {
                img.setDisplayOrder(orderMap.get(img.getId()));
            }
        }

        List<ProductImage> savedImages = imageRepository.saveAll(images);
        return savedImages.stream().map(ProductImageResponse::from).toList();
    }

    private void clearPrimaryFlag(Product product) {
        List<ProductImage> images = imageRepository.findByProductIdOrderByDisplayOrderAsc(product.getId());
        for (ProductImage img : images) {
            if (img.isPrimary()) {
                img.setPrimary(false);
                imageRepository.save(img);
            }
        }
    }
}
