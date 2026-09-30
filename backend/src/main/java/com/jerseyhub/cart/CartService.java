package com.jerseyhub.cart;

import com.jerseyhub.cart.dto.AddToCartRequest;
import com.jerseyhub.cart.dto.CartResponse;
import com.jerseyhub.cart.dto.UpdateCartItemRequest;
import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.product.Product;
import com.jerseyhub.product.ProductVariant;
import com.jerseyhub.product.ProductVariantRepository;
import com.jerseyhub.user.User;
import com.jerseyhub.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductVariantRepository variantRepository,
            UserRepository userRepository
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.variantRepository = variantRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(UUID userId) {
        Cart cart = getOrCreateCartEntity(userId);
        return CartResponse.from(cart);
    }

    public CartResponse addItem(UUID userId, AddToCartRequest request) {
        if (request.quantity() == null || request.quantity() <= 0) {
            throw new BusinessException("Quantity must be greater than 0", ErrorCode.INVALID_REQUEST.getCode());
        }

        Cart cart = getOrCreateCartEntity(userId);

        ProductVariant variant = variantRepository.findById(request.productVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Product variant not found", ErrorCode.VARIANT_NOT_FOUND.getCode()));

        Product product = variant.getProduct();
        if (product != null && !product.isActive()) {
            throw new BusinessException("Product is inactive", ErrorCode.PRODUCT_INACTIVE.getCode());
        }
        if (!variant.isActive()) {
            throw new BusinessException("Product variant is inactive", ErrorCode.VARIANT_INACTIVE.getCode());
        }

        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getProductVariant().getId().equals(variant.getId()))
                .findFirst();

        int targetQuantity = request.quantity();
        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            targetQuantity += existingItem.getQuantity();

            if (targetQuantity > variant.getStockQuantity()) {
                throw new BusinessException("Requested quantity exceeds available stock", ErrorCode.INSUFFICIENT_STOCK.getCode());
            }
            existingItem.setQuantity(targetQuantity);
        } else {
            if (targetQuantity > variant.getStockQuantity()) {
                throw new BusinessException("Requested quantity exceeds available stock", ErrorCode.INSUFFICIENT_STOCK.getCode());
            }
            CartItem newItem = new CartItem(cart, variant, targetQuantity);
            cart.addItem(newItem);
        }

        Cart savedCart = cartRepository.save(cart);
        return CartResponse.from(savedCart);
    }

    public CartResponse updateItemQuantity(UUID userId, UUID cartItemId, UpdateCartItemRequest request) {
        if (request.quantity() == null || request.quantity() <= 0) {
            throw new BusinessException("Quantity must be greater than 0", ErrorCode.INVALID_REQUEST.getCode());
        }

        Cart cart = getOrCreateCartEntity(userId);

        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found", ErrorCode.RESOURCE_NOT_FOUND.getCode()));

        ProductVariant variant = cartItem.getProductVariant();
        Product product = variant != null ? variant.getProduct() : null;

        if (product != null && !product.isActive()) {
            throw new BusinessException("Product is inactive", ErrorCode.PRODUCT_INACTIVE.getCode());
        }
        if (variant != null && !variant.isActive()) {
            throw new BusinessException("Product variant is inactive", ErrorCode.VARIANT_INACTIVE.getCode());
        }

        if (variant != null && request.quantity() > variant.getStockQuantity()) {
            throw new BusinessException("Requested quantity exceeds available stock", ErrorCode.INSUFFICIENT_STOCK.getCode());
        }

        cartItem.setQuantity(request.quantity());
        Cart savedCart = cartRepository.save(cart);
        return CartResponse.from(savedCart);
    }

    public CartResponse removeItem(UUID userId, UUID cartItemId) {
        Cart cart = getOrCreateCartEntity(userId);

        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found", ErrorCode.RESOURCE_NOT_FOUND.getCode()));

        cart.removeItem(cartItem);
        Cart savedCart = cartRepository.save(cart);
        return CartResponse.from(savedCart);
    }

    public CartResponse clearCart(UUID userId) {
        Cart cart = getOrCreateCartEntity(userId);
        cart.getItems().clear();
        Cart savedCart = cartRepository.save(cart);
        return CartResponse.from(savedCart);
    }

    private Cart getOrCreateCartEntity(UUID userId) {
        return cartRepository.findByUserIdWithItems(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found", ErrorCode.RESOURCE_NOT_FOUND.getCode()));
                    Cart newCart = new Cart(user);
                    return cartRepository.save(newCart);
                });
    }
}
