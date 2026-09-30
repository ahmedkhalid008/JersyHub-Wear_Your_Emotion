package com.jerseyhub.coupon.dto;

import com.jerseyhub.coupon.CouponDiscountType;

import java.math.BigDecimal;

public record CouponApplyResponse(
        String couponCode,
        CouponDiscountType discountType,
        BigDecimal discountAmount,
        BigDecimal subtotal,
        BigDecimal shippingAmount,
        BigDecimal totalAfterDiscount
) {}
