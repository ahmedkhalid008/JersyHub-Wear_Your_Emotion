package com.jerseyhub.coupon;

import com.jerseyhub.cart.CartService;
import com.jerseyhub.cart.dto.CartItemResponse;
import com.jerseyhub.cart.dto.CartResponse;
import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.coupon.dto.ApplyCouponRequest;
import com.jerseyhub.coupon.dto.CouponApplyResponse;
import com.jerseyhub.coupon.dto.CouponCreateRequest;
import com.jerseyhub.coupon.dto.CouponResponse;
import com.jerseyhub.order.Order;
import com.jerseyhub.user.User;
import com.jerseyhub.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private CouponUsageRepository couponUsageRepository;

    @Mock
    private CartService cartService;

    @InjectMocks
    private CouponService couponService;

    private UUID userId;
    private User sampleUser;
    private Coupon percentageCoupon;
    private Coupon fixedCoupon;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        sampleUser = new User("John Customer", "john@example.com", "hash", UserRole.CUSTOMER);
        sampleUser.setId(userId);

        percentageCoupon = new Coupon();
        percentageCoupon.setId(UUID.randomUUID());
        percentageCoupon.setCode("WELCOME10");
        percentageCoupon.setDiscountType(CouponDiscountType.PERCENTAGE);
        percentageCoupon.setDiscountValue(new BigDecimal("10.00"));
        percentageCoupon.setMinimumOrderAmount(new BigDecimal("1000.00"));
        percentageCoupon.setMaximumDiscountAmount(new BigDecimal("500.00"));
        percentageCoupon.setUsageLimit(100);
        percentageCoupon.setUsageCount(10);
        percentageCoupon.setPerUserLimit(1);
        percentageCoupon.setActive(true);

        fixedCoupon = new Coupon();
        fixedCoupon.setId(UUID.randomUUID());
        fixedCoupon.setCode("FLAT200");
        fixedCoupon.setDiscountType(CouponDiscountType.FIXED_AMOUNT);
        fixedCoupon.setDiscountValue(new BigDecimal("200.00"));
        fixedCoupon.setMinimumOrderAmount(BigDecimal.ZERO);
        fixedCoupon.setActive(true);
    }

    @Test
    @DisplayName("Should calculate percentage discount correctly")
    void validateAndCalculateDiscount_Percentage_Success() {
        BigDecimal subtotal = new BigDecimal("3000.00");
        given(couponUsageRepository.countByCouponIdAndUserId(percentageCoupon.getId(), userId)).willReturn(0L);

        BigDecimal discount = couponService.validateAndCalculateDiscount(percentageCoupon, userId, subtotal);

        assertThat(discount).isEqualTo(new BigDecimal("300.00"));
    }

    @Test
    @DisplayName("Should cap percentage discount at maximumDiscountAmount")
    void validateAndCalculateDiscount_PercentageWithMaxCap() {
        BigDecimal subtotal = new BigDecimal("10000.00");
        given(couponUsageRepository.countByCouponIdAndUserId(percentageCoupon.getId(), userId)).willReturn(0L);

        BigDecimal discount = couponService.validateAndCalculateDiscount(percentageCoupon, userId, subtotal);

        assertThat(discount).isEqualTo(new BigDecimal("500.00"));
    }

    @Test
    @DisplayName("Should calculate fixed amount discount correctly")
    void validateAndCalculateDiscount_FixedAmount_Success() {
        BigDecimal subtotal = new BigDecimal("1500.00");

        BigDecimal discount = couponService.validateAndCalculateDiscount(fixedCoupon, userId, subtotal);

        assertThat(discount).isEqualTo(new BigDecimal("200.00"));
    }

    @Test
    @DisplayName("Should cap fixed discount at subtotal to prevent negative payable amount")
    void validateAndCalculateDiscount_FixedAmountExceedingSubtotal_CappedAtSubtotal() {
        fixedCoupon.setDiscountValue(new BigDecimal("4000.00"));
        BigDecimal subtotal = new BigDecimal("3000.00");

        BigDecimal discount = couponService.validateAndCalculateDiscount(fixedCoupon, userId, subtotal);

        assertThat(discount).isEqualTo(new BigDecimal("3000.00"));
    }

    @Test
    @DisplayName("Should throw BusinessException when coupon is expired")
    void validateAndCalculateDiscount_ExpiredCoupon_ThrowsException() {
        percentageCoupon.setExpiresAt(Instant.now().minus(1, ChronoUnit.DAYS));
        BigDecimal subtotal = new BigDecimal("3000.00");

        assertThatThrownBy(() -> couponService.validateAndCalculateDiscount(percentageCoupon, userId, subtotal))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("expired")
                .extracting("errorCode").isEqualTo(ErrorCode.COUPON_EXPIRED.getCode());
    }

    @Test
    @DisplayName("Should throw BusinessException when coupon starts in the future")
    void validateAndCalculateDiscount_NotStartedCoupon_ThrowsException() {
        percentageCoupon.setStartsAt(Instant.now().plus(1, ChronoUnit.DAYS));
        BigDecimal subtotal = new BigDecimal("3000.00");

        assertThatThrownBy(() -> couponService.validateAndCalculateDiscount(percentageCoupon, userId, subtotal))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("not active yet")
                .extracting("errorCode").isEqualTo(ErrorCode.COUPON_NOT_STARTED.getCode());
    }

    @Test
    @DisplayName("Should throw BusinessException when global usage limit reached")
    void validateAndCalculateDiscount_GlobalLimitReached_ThrowsException() {
        percentageCoupon.setUsageLimit(5);
        percentageCoupon.setUsageCount(5);
        BigDecimal subtotal = new BigDecimal("3000.00");

        assertThatThrownBy(() -> couponService.validateAndCalculateDiscount(percentageCoupon, userId, subtotal))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Global coupon usage limit")
                .extracting("errorCode").isEqualTo(ErrorCode.COUPON_USAGE_LIMIT_REACHED.getCode());
    }

    @Test
    @DisplayName("Should throw BusinessException when per-user limit reached")
    void validateAndCalculateDiscount_PerUserLimitReached_ThrowsException() {
        given(couponUsageRepository.countByCouponIdAndUserId(percentageCoupon.getId(), userId)).willReturn(1L);
        BigDecimal subtotal = new BigDecimal("3000.00");

        assertThatThrownBy(() -> couponService.validateAndCalculateDiscount(percentageCoupon, userId, subtotal))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Per-user limit reached")
                .extracting("errorCode").isEqualTo(ErrorCode.COUPON_USER_LIMIT_REACHED.getCode());
    }

    @Test
    @DisplayName("Should throw BusinessException when subtotal is below minimum order amount")
    void validateAndCalculateDiscount_MinOrderNotMet_ThrowsException() {
        BigDecimal subtotal = new BigDecimal("500.00");

        assertThatThrownBy(() -> couponService.validateAndCalculateDiscount(percentageCoupon, userId, subtotal))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("minimum order amount")
                .extracting("errorCode").isEqualTo(ErrorCode.COUPON_MIN_ORDER_NOT_MET.getCode());
    }

    @Test
    @DisplayName("Should apply coupon to customer cart subtotal")
    void applyCouponToCart_Success() {
        ApplyCouponRequest request = new ApplyCouponRequest("welcome10");
        CartItemResponse mockItem = new CartItemResponse(
                UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                "Jersey", "jersey", "SKU-1", null, null,
                new BigDecimal("3000.00"), 1, new BigDecimal("3000.00"), true, 10, true
        );
        CartResponse cartResponse = new CartResponse(
                UUID.randomUUID(), userId, List.of(mockItem), new BigDecimal("3000.00"), 1, Instant.now(), Instant.now()
        );

        given(cartService.getCart(userId)).willReturn(cartResponse);
        given(couponRepository.findByCodeIgnoreCase("WELCOME10")).willReturn(Optional.of(percentageCoupon));
        given(couponUsageRepository.countByCouponIdAndUserId(percentageCoupon.getId(), userId)).willReturn(0L);

        CouponApplyResponse response = couponService.applyCouponToCart(userId, request);

        assertThat(response).isNotNull();
        assertThat(response.couponCode()).isEqualTo("WELCOME10");
        assertThat(response.discountAmount()).isEqualTo(new BigDecimal("300.00"));
        assertThat(response.subtotal()).isEqualTo(new BigDecimal("3000.00"));
        assertThat(response.shippingAmount()).isEqualTo(new BigDecimal("100.00"));
        assertThat(response.totalAfterDiscount()).isEqualTo(new BigDecimal("2800.00"));
    }

    @Test
    @DisplayName("Should record coupon usage and increment usageCount")
    void recordCouponUsage_Success() {
        Order sampleOrder = new Order();
        sampleOrder.setId(UUID.randomUUID());

        couponService.recordCouponUsage(percentageCoupon, sampleUser, sampleOrder, new BigDecimal("300.00"));

        assertThat(percentageCoupon.getUsageCount()).isEqualTo(11);
        verify(couponRepository).save(percentageCoupon);
        verify(couponUsageRepository).save(any(CouponUsage.class));
    }
}
