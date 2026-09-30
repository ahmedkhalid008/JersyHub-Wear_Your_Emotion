package com.jerseyhub.order.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record CheckoutRequest(
    @NotNull(message = "Shipping address ID is required")
    UUID shippingAddressId,
    String couponCode,
    String paymentMethod,
    List<CheckoutItemRequest> items
) {
    public CheckoutRequest(UUID shippingAddressId) {
        this(shippingAddressId, null, "SSLCOMMERZ", null);
    }

    public CheckoutRequest(UUID shippingAddressId, String couponCode) {
        this(shippingAddressId, couponCode, "SSLCOMMERZ", null);
    }
}
