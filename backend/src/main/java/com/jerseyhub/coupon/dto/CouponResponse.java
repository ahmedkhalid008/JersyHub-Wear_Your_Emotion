package com.jerseyhub.coupon.dto;

import com.jerseyhub.coupon.Coupon;
import com.jerseyhub.coupon.CouponDiscountType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CouponResponse(
        UUID id,
        String code,
        String description,
        CouponDiscountType discountType,
        BigDecimal discountValue,
        BigDecimal minimumOrderAmount,
        BigDecimal maximumDiscountAmount,
        Integer usageLimit,
        int usageCount,
        Integer perUserLimit,
        Instant startsAt,
        Instant expiresAt,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static CouponResponse from(Coupon coupon) {
        return new CouponResponse(
                coupon.getId(),
                coupon.getCode(),
                coupon.getDescription(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                coupon.getMinimumOrderAmount(),
                coupon.getMaximumDiscountAmount(),
                coupon.getUsageLimit(),
                coupon.getUsageCount(),
                coupon.getPerUserLimit(),
                coupon.getStartsAt(),
                coupon.getExpiresAt(),
                coupon.isActive(),
                coupon.getCreatedAt(),
                coupon.getUpdatedAt()
        );
    }
}
