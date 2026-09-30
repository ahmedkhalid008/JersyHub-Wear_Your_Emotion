package com.jerseyhub.coupon;

import com.jerseyhub.auth.security.UserPrincipal;
import com.jerseyhub.common.response.ApiResponse;
import com.jerseyhub.coupon.dto.ApplyCouponRequest;
import com.jerseyhub.coupon.dto.CouponApplyResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cart/coupon")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Cart Coupon", description = "Customer Cart Coupon & Discount Calculation APIs")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping
    @Operation(summary = "Validate and apply coupon to current cart subtotal")
    public ResponseEntity<ApiResponse<CouponApplyResponse>> applyCoupon(
            @Valid @RequestBody ApplyCouponRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        CouponApplyResponse response = couponService.applyCouponToCart(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Coupon applied successfully", response));
    }

    @DeleteMapping
    @Operation(summary = "Remove applied coupon from current cart session")
    public ResponseEntity<ApiResponse<Void>> removeCoupon(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(ApiResponse.success("Coupon removed from cart", null));
    }
}
