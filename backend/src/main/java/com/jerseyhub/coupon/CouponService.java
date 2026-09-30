package com.jerseyhub.coupon;

import com.jerseyhub.cart.CartService;
import com.jerseyhub.cart.dto.CartResponse;
import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.common.response.PageResponse;
import com.jerseyhub.coupon.dto.ApplyCouponRequest;
import com.jerseyhub.coupon.dto.CouponApplyResponse;
import com.jerseyhub.coupon.dto.CouponCreateRequest;
import com.jerseyhub.coupon.dto.CouponResponse;
import com.jerseyhub.coupon.dto.CouponUpdateRequest;
import com.jerseyhub.order.Order;
import com.jerseyhub.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final CartService cartService;

    public CouponService(
            CouponRepository couponRepository,
            CouponUsageRepository couponUsageRepository,
            CartService cartService
    ) {
        this.couponRepository = couponRepository;
        this.couponUsageRepository = couponUsageRepository;
        this.cartService = cartService;
    }

    public BigDecimal validateAndCalculateDiscount(Coupon coupon, UUID userId, BigDecimal subtotal) {
        if (coupon == null || !coupon.isActive()) {
            throw new BusinessException("Coupon is invalid or inactive", ErrorCode.COUPON_INVALID.getCode());
        }

        Instant now = Instant.now();
        if (coupon.getStartsAt() != null && now.isBefore(coupon.getStartsAt())) {
            throw new BusinessException("Coupon is not active yet", ErrorCode.COUPON_NOT_STARTED.getCode());
        }

        if (coupon.getExpiresAt() != null && now.isAfter(coupon.getExpiresAt())) {
            throw new BusinessException("Coupon has expired", ErrorCode.COUPON_EXPIRED.getCode());
        }

        if (coupon.getUsageLimit() != null && coupon.getUsageCount() >= coupon.getUsageLimit()) {
            throw new BusinessException("Global coupon usage limit has been reached", ErrorCode.COUPON_USAGE_LIMIT_REACHED.getCode());
        }

        if (coupon.getPerUserLimit() != null) {
            long userUsages = couponUsageRepository.countByCouponIdAndUserId(coupon.getId(), userId);
            if (userUsages >= coupon.getPerUserLimit()) {
                throw new BusinessException("Per-user limit reached for this coupon", ErrorCode.COUPON_USER_LIMIT_REACHED.getCode());
            }
        }

        if (coupon.getMinimumOrderAmount() != null && subtotal.compareTo(coupon.getMinimumOrderAmount()) < 0) {
            throw new BusinessException("Cart subtotal does not meet coupon minimum order amount of " + coupon.getMinimumOrderAmount() + " BDT", ErrorCode.COUPON_MIN_ORDER_NOT_MET.getCode());
        }

        BigDecimal discountAmount;
        if (coupon.getDiscountType() == CouponDiscountType.PERCENTAGE) {
            discountAmount = subtotal.multiply(coupon.getDiscountValue())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

            if (coupon.getMaximumDiscountAmount() != null && discountAmount.compareTo(coupon.getMaximumDiscountAmount()) > 0) {
                discountAmount = coupon.getMaximumDiscountAmount();
            }
        } else {
            discountAmount = coupon.getDiscountValue();
        }

        // Fixed discount must never exceed eligible subtotal (never negative payable amount)
        if (discountAmount.compareTo(subtotal) > 0) {
            discountAmount = subtotal;
        }

        return discountAmount;
    }

    public CouponApplyResponse applyCouponToCart(UUID userId, ApplyCouponRequest request) {
        if (request.code() == null || request.code().isBlank()) {
            throw new BusinessException("Coupon code is required", ErrorCode.INVALID_REQUEST.getCode());
        }

        String normalizedCode = request.code().trim().toUpperCase();

        CartResponse cart = cartService.getCart(userId);
        if (cart.items() == null || cart.items().isEmpty() || cart.total().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Cart is empty", ErrorCode.CART_EMPTY.getCode());
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(normalizedCode)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found", ErrorCode.COUPON_NOT_FOUND.getCode()));

        BigDecimal discountAmount = validateAndCalculateDiscount(coupon, userId, cart.total());
        BigDecimal shippingAmount = new BigDecimal("100.00");
        BigDecimal totalAfterDiscount = cart.total().subtract(discountAmount).add(shippingAmount);

        return new CouponApplyResponse(
                coupon.getCode(),
                coupon.getDiscountType(),
                discountAmount,
                cart.total(),
                shippingAmount,
                totalAfterDiscount
        );
    }

    @Transactional
    public void recordCouponUsage(Coupon coupon, User user, Order order, BigDecimal discountAmount) {
        coupon.setUsageCount(coupon.getUsageCount() + 1);
        couponRepository.save(coupon);

        CouponUsage usage = new CouponUsage(coupon, user, order, discountAmount);
        couponUsageRepository.save(usage);
    }

    @Transactional
    public CouponResponse createCoupon(CouponCreateRequest request) {
        String normalizedCode = request.code().trim().toUpperCase();

        if (couponRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new BusinessException("Coupon code already exists", ErrorCode.COUPON_CODE_ALREADY_EXISTS.getCode());
        }

        if (request.discountType() == CouponDiscountType.PERCENTAGE && request.discountValue().compareTo(new BigDecimal("100")) > 0) {
            throw new BusinessException("Percentage discount value cannot exceed 100", ErrorCode.INVALID_REQUEST.getCode());
        }

        if (request.startsAt() != null && request.expiresAt() != null && request.startsAt().isAfter(request.expiresAt())) {
            throw new BusinessException("StartsAt timestamp must be before expiresAt timestamp", ErrorCode.INVALID_REQUEST.getCode());
        }

        Coupon coupon = new Coupon();
        coupon.setCode(normalizedCode);
        coupon.setDescription(request.description());
        coupon.setDiscountType(request.discountType());
        coupon.setDiscountValue(request.discountValue());
        coupon.setMinimumOrderAmount(request.minimumOrderAmount() != null ? request.minimumOrderAmount() : BigDecimal.ZERO);
        coupon.setMaximumDiscountAmount(request.maximumDiscountAmount());
        coupon.setUsageLimit(request.usageLimit());
        coupon.setPerUserLimit(request.perUserLimit() != null ? request.perUserLimit() : 1);
        coupon.setStartsAt(request.startsAt());
        coupon.setExpiresAt(request.expiresAt());
        coupon.setActive(request.active() != null ? request.active() : true);

        Coupon savedCoupon = couponRepository.save(coupon);
        return CouponResponse.from(savedCoupon);
    }

    @Transactional
    public CouponResponse updateCoupon(UUID id, CouponUpdateRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found", ErrorCode.COUPON_NOT_FOUND.getCode()));

        if (request.code() != null && !request.code().isBlank()) {
            String normalizedCode = request.code().trim().toUpperCase();
            if (!coupon.getCode().equalsIgnoreCase(normalizedCode) && couponRepository.existsByCodeIgnoreCase(normalizedCode)) {
                throw new BusinessException("Coupon code already exists", ErrorCode.COUPON_CODE_ALREADY_EXISTS.getCode());
            }
            coupon.setCode(normalizedCode);
        }

        if (request.discountType() != null) {
            coupon.setDiscountType(request.discountType());
        }

        if (request.discountValue() != null) {
            if (coupon.getDiscountType() == CouponDiscountType.PERCENTAGE && request.discountValue().compareTo(new BigDecimal("100")) > 0) {
                throw new BusinessException("Percentage discount value cannot exceed 100", ErrorCode.INVALID_REQUEST.getCode());
            }
            coupon.setDiscountValue(request.discountValue());
        }

        if (request.description() != null) {
            coupon.setDescription(request.description());
        }

        if (request.minimumOrderAmount() != null) {
            coupon.setMinimumOrderAmount(request.minimumOrderAmount());
        }

        if (request.maximumDiscountAmount() != null) {
            coupon.setMaximumDiscountAmount(request.maximumDiscountAmount());
        }

        if (request.usageLimit() != null) {
            coupon.setUsageLimit(request.usageLimit());
        }

        if (request.perUserLimit() != null) {
            coupon.setPerUserLimit(request.perUserLimit());
        }

        if (request.startsAt() != null) {
            coupon.setStartsAt(request.startsAt());
        }

        if (request.expiresAt() != null) {
            coupon.setExpiresAt(request.expiresAt());
        }

        if (request.startsAt() != null && request.expiresAt() != null && request.startsAt().isAfter(request.expiresAt())) {
            throw new BusinessException("StartsAt timestamp must be before expiresAt timestamp", ErrorCode.INVALID_REQUEST.getCode());
        }

        if (request.active() != null) {
            coupon.setActive(request.active());
        }

        return CouponResponse.from(coupon);
    }

    public PageResponse<CouponResponse> getCoupons(Pageable pageable) {
        Page<Coupon> couponPage = couponRepository.findAll(pageable);
        return PageResponse.from(couponPage.map(CouponResponse::from));
    }

    public CouponResponse getCouponById(UUID id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found", ErrorCode.COUPON_NOT_FOUND.getCode()));
        return CouponResponse.from(coupon);
    }

    @Transactional
    public CouponResponse setCouponActive(UUID id, boolean active) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found", ErrorCode.COUPON_NOT_FOUND.getCode()));
        coupon.setActive(active);
        return CouponResponse.from(coupon);
    }

    @Transactional
    public void deleteCoupon(UUID id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found", ErrorCode.COUPON_NOT_FOUND.getCode()));
        couponRepository.delete(coupon);
    }
}
