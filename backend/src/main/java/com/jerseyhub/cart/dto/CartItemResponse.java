package com.jerseyhub.cart.dto;

import com.jerseyhub.cart.CartItem;
import com.jerseyhub.product.JerseySize;
import com.jerseyhub.product.Product;
import com.jerseyhub.product.ProductImage;
import com.jerseyhub.product.ProductVariant;

import java.math.BigDecimal;
import java.util.UUID;

public record CartItemResponse(
    UUID id,
    UUID productVariantId,
    UUID productId,
    String productName,
    String productSlug,
    String sku,
    JerseySize size,
    String imageUrl,
    BigDecimal unitPrice,
    int quantity,
    BigDecimal subtotal,
    boolean active,
    int stockQuantity,
    boolean available
) {
    public static CartItemResponse from(CartItem item) {
        ProductVariant variant = item.getProductVariant();
        Product product = variant != null ? variant.getProduct() : null;

        String imageUrl = null;
        if (product != null && product.getImages() != null && !product.getImages().isEmpty()) {
            imageUrl = product.getImages().stream()
                    .filter(ProductImage::isPrimary)
                    .findFirst()
                    .orElse(product.getImages().get(0))
                    .getImageUrl();
        }

        BigDecimal unitPrice = variant != null && variant.getPrice() != null ? variant.getPrice() : BigDecimal.ZERO;
        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
        boolean isProductActive = product != null && product.isActive();
        boolean isVariantActive = variant != null && variant.isActive();
        boolean isAvailable = isProductActive && isVariantActive && variant != null && variant.getStockQuantity() >= item.getQuantity();

        return new CartItemResponse(
            item.getId(),
            variant != null ? variant.getId() : null,
            product != null ? product.getId() : null,
            product != null ? product.getName() : null,
            product != null ? product.getSlug() : null,
            variant != null ? variant.getSku() : null,
            variant != null ? variant.getSize() : null,
            imageUrl,
            unitPrice,
            item.getQuantity(),
            subtotal,
            isProductActive && isVariantActive,
            variant != null ? variant.getStockQuantity() : 0,
            isAvailable
        );
    }
}
