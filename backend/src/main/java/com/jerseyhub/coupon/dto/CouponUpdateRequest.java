package com.jerseyhub.coupon.dto;

import com.jerseyhub.coupon.CouponDiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

public record CouponUpdateRequest(
        @Size(max = 50, message = "Coupon code cannot exceed 50 characters")
        String code,

        String description,

        @NotNull(message = "Discount type is required")
        CouponDiscountType discountType,

        @NotNull(message = "Discount value is required")
        @DecimalMin(value = "0.01", message = "Discount value must be greater than 0")
        BigDecimal discountValue,

        @DecimalMin(value = "0.00", message = "Minimum order amount cannot be negative")
        BigDecimal minimumOrderAmount,

        @DecimalMin(value = "0.01", message = "Maximum discount amount must be greater than 0")
        BigDecimal maximumDiscountAmount,

        @Min(value = 1, message = "Usage limit must be positive")
        Integer usageLimit,

        @Min(value = 1, message = "Per-user limit must be positive")
        Integer perUserLimit,

        Instant startsAt,
        Instant expiresAt,
        Boolean active
) {}
