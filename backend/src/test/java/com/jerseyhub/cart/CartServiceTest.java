package com.jerseyhub.cart;

import com.jerseyhub.cart.dto.AddToCartRequest;
import com.jerseyhub.cart.dto.CartResponse;
import com.jerseyhub.cart.dto.UpdateCartItemRequest;
import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.product.JerseySize;
import com.jerseyhub.product.Product;
import com.jerseyhub.product.ProductVariant;
import com.jerseyhub.product.ProductVariantRepository;
import com.jerseyhub.user.User;
import com.jerseyhub.user.UserRepository;
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
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductVariantRepository variantRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CartService cartService;

    private UUID userId;
    private User sampleUser;
    private Cart sampleCart;
    private Product sampleProduct;
    private ProductVariant sampleVariant;
    private UUID variantId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        sampleUser = new User();
        sampleUser.setId(userId);
        sampleUser.setName("Test User");
        sampleUser.setEmail("test@example.com");

        sampleCart = new Cart(sampleUser);
        sampleCart.setId(UUID.randomUUID());

        sampleProduct = new Product();
        sampleProduct.setId(UUID.randomUUID());
        sampleProduct.setName("Real Madrid Jersey");
        sampleProduct.setSlug("real-madrid-jersey");
        sampleProduct.setBasePrice(new BigDecimal("1000.00"));
        sampleProduct.setActive(true);

        variantId = UUID.randomUUID();
        sampleVariant = new ProductVariant(sampleProduct, "RM-L", JerseySize.L, new BigDecimal("1200.00"), 10);
        sampleVariant.setId(variantId);
        sampleVariant.setActive(true);
    }

    @Test
    @DisplayName("Should return empty cart for new user")
    void getCart_EmptyCart() {
        given(cartRepository.findByUserIdWithItems(userId)).willReturn(Optional.of(sampleCart));

        CartResponse response = cartService.getCart(userId);

        assertThat(response).isNotNull();
        assertThat(response.items()).isEmpty();
        assertThat(response.total()).isEqualTo(BigDecimal.ZERO);
        assertThat(response.totalItems()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should add item to cart successfully and calculate subtotal/total")
    void addItem_Success() {
        AddToCartRequest request = new AddToCartRequest(variantId, 2);

        given(cartRepository.findByUserIdWithItems(userId)).willReturn(Optional.of(sampleCart));
        given(variantRepository.findById(variantId)).willReturn(Optional.of(sampleVariant));
        given(cartRepository.save(any(Cart.class))).willAnswer(invocation -> invocation.getArgument(0));

        CartResponse response = cartService.addItem(userId, request);

        assertThat(response).isNotNull();
        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).quantity()).isEqualTo(2);
        assertThat(response.items().get(0).unitPrice()).isEqualTo(new BigDecimal("1200.00"));
        assertThat(response.items().get(0).subtotal()).isEqualTo(new BigDecimal("2400.00"));
        assertThat(response.total()).isEqualTo(new BigDecimal("2400.00"));
        assertThat(response.totalItems()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should accumulate quantity when adding same variant again")
    void addItem_AddSameVariantAgain() {
        CartItem existingItem = new CartItem(sampleCart, sampleVariant, 2);
        existingItem.setId(UUID.randomUUID());
        sampleCart.addItem(existingItem);

        AddToCartRequest request = new AddToCartRequest(variantId, 3);

        given(cartRepository.findByUserIdWithItems(userId)).willReturn(Optional.of(sampleCart));
        given(variantRepository.findById(variantId)).willReturn(Optional.of(sampleVariant));
        given(cartRepository.save(any(Cart.class))).willAnswer(invocation -> invocation.getArgument(0));

        CartResponse response = cartService.addItem(userId, request);

        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).quantity()).isEqualTo(5);
        assertThat(response.total()).isEqualTo(new BigDecimal("6000.00"));
    }

    @Test
    @DisplayName("Should throw BusinessException when requested quantity exceeds available stock")
    void addItem_QuantityExceedsStock() {
        AddToCartRequest request = new AddToCartRequest(variantId, 15); // stock is 10

        given(cartRepository.findByUserIdWithItems(userId)).willReturn(Optional.of(sampleCart));
        given(variantRepository.findById(variantId)).willReturn(Optional.of(sampleVariant));

        assertThatThrownBy(() -> cartService.addItem(userId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("exceeds available stock")
                .extracting("errorCode").isEqualTo(ErrorCode.INSUFFICIENT_STOCK.getCode());
    }

    @Test
    @DisplayName("Should throw BusinessException when quantity is less than 1")
    void addItem_InvalidQuantity() {
        AddToCartRequest request = new AddToCartRequest(variantId, 0);

        assertThatThrownBy(() -> cartService.addItem(userId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Quantity must be greater than 0");
    }

    @Test
    @DisplayName("Should throw BusinessException when product or variant is inactive")
    void addItem_InactiveProductOrVariant() {
        sampleVariant.setActive(false);
        AddToCartRequest request = new AddToCartRequest(variantId, 1);

        given(cartRepository.findByUserIdWithItems(userId)).willReturn(Optional.of(sampleCart));
        given(variantRepository.findById(variantId)).willReturn(Optional.of(sampleVariant));

        assertThatThrownBy(() -> cartService.addItem(userId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("inactive")
                .extracting("errorCode").isEqualTo(ErrorCode.VARIANT_INACTIVE.getCode());
    }

    @Test
    @DisplayName("Should update cart item quantity successfully")
    void updateItemQuantity_Success() {
        CartItem item = new CartItem(sampleCart, sampleVariant, 2);
        UUID itemId = UUID.randomUUID();
        item.setId(itemId);
        sampleCart.addItem(item);

        UpdateCartItemRequest request = new UpdateCartItemRequest(5);

        given(cartRepository.findByUserIdWithItems(userId)).willReturn(Optional.of(sampleCart));
        given(cartRepository.save(any(Cart.class))).willAnswer(invocation -> invocation.getArgument(0));

        CartResponse response = cartService.updateItemQuantity(userId, itemId, request);

        assertThat(response.items().get(0).quantity()).isEqualTo(5);
        assertThat(response.total()).isEqualTo(new BigDecimal("6000.00"));
    }

    @Test
    @DisplayName("Should remove item from cart successfully")
    void removeItem_Success() {
        CartItem item = new CartItem(sampleCart, sampleVariant, 2);
        UUID itemId = UUID.randomUUID();
        item.setId(itemId);
        sampleCart.addItem(item);

        given(cartRepository.findByUserIdWithItems(userId)).willReturn(Optional.of(sampleCart));
        given(cartRepository.save(any(Cart.class))).willAnswer(invocation -> invocation.getArgument(0));

        CartResponse response = cartService.removeItem(userId, itemId);

        assertThat(response.items()).isEmpty();
        assertThat(response.total()).isEqualTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should clear all items from cart")
    void clearCart_Success() {
        CartItem item = new CartItem(sampleCart, sampleVariant, 2);
        item.setId(UUID.randomUUID());
        sampleCart.addItem(item);

        given(cartRepository.findByUserIdWithItems(userId)).willReturn(Optional.of(sampleCart));
        given(cartRepository.save(any(Cart.class))).willAnswer(invocation -> invocation.getArgument(0));

        CartResponse response = cartService.clearCart(userId);

        assertThat(response.items()).isEmpty();
        assertThat(response.total()).isEqualTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when accessing non-existent cart item")
    void updateItemQuantity_ItemNotFound() {
        given(cartRepository.findByUserIdWithItems(userId)).willReturn(Optional.of(sampleCart));
        UpdateCartItemRequest request = new UpdateCartItemRequest(3);

        assertThatThrownBy(() -> cartService.updateItemQuantity(userId, UUID.randomUUID(), request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Cart item not found");
    }
}
