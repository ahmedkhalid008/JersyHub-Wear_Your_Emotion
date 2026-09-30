package com.jerseyhub.cart.dto;

import com.jerseyhub.cart.Cart;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public record CartResponse(
    UUID id,
    UUID userId,
    List<CartItemResponse> items,
    BigDecimal total,
    int totalItems,
    Instant createdAt,
    Instant updatedAt
) {
    public static CartResponse from(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems() != null
                ? cart.getItems().stream().map(CartItemResponse::from).toList()
                : Collections.emptyList();

        BigDecimal total = itemResponses.stream()
                .map(CartItemResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = itemResponses.stream()
                .mapToInt(CartItemResponse::quantity)
                .sum();

        return new CartResponse(
            cart.getId(),
            cart.getUser() != null ? cart.getUser().getId() : null,
            itemResponses,
            total,
            totalItems,
            cart.getCreatedAt(),
            cart.getUpdatedAt()
        );
    }
}
