package com.jerseyhub.cart;

import com.jerseyhub.auth.security.UserPrincipal;
import com.jerseyhub.cart.dto.AddToCartRequest;
import com.jerseyhub.cart.dto.CartResponse;
import com.jerseyhub.cart.dto.UpdateCartItemRequest;
import com.jerseyhub.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cart")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Cart", description = "Shopping Cart Management APIs")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    @Operation(summary = "Get current authenticated user's cart")
    public ResponseEntity<ApiResponse<CartResponse>> getCart(@AuthenticationPrincipal UserPrincipal currentUser) {
        CartResponse response = cartService.getCart(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", response));
    }

    @PostMapping("/items")
    @Operation(summary = "Add product variant to cart")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @Valid @RequestBody AddToCartRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        CartResponse response = cartService.addItem(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", response));
    }

    @PatchMapping("/items/{cartItemId}")
    @Operation(summary = "Update cart item quantity")
    public ResponseEntity<ApiResponse<CartResponse>> updateItemQuantity(
            @PathVariable UUID cartItemId,
            @Valid @RequestBody UpdateCartItemRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        CartResponse response = cartService.updateItemQuantity(currentUser.getId(), cartItemId, request);
        return ResponseEntity.ok(ApiResponse.success("Cart item quantity updated", response));
    }

    @DeleteMapping("/items/{cartItemId}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @PathVariable UUID cartItemId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        CartResponse response = cartService.removeItem(currentUser.getId(), cartItemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", response));
    }

    @DeleteMapping
    @Operation(summary = "Clear all items from cart")
    public ResponseEntity<ApiResponse<CartResponse>> clearCart(@AuthenticationPrincipal UserPrincipal currentUser) {
        CartResponse response = cartService.clearCart(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", response));
    }
}
