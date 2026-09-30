package com.jerseyhub.coupon;

import com.jerseyhub.common.response.ApiResponse;
import com.jerseyhub.common.response.PageResponse;
import com.jerseyhub.coupon.dto.CouponCreateRequest;
import com.jerseyhub.coupon.dto.CouponResponse;
import com.jerseyhub.coupon.dto.CouponUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/coupons")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Coupon Management", description = "Admin Coupon CRUD & Lifecycle Management APIs")
public class CouponAdminController {

    private final CouponService couponService;

    public CouponAdminController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping
    @Operation(summary = "Create a new discount coupon (Admin)")
    public ResponseEntity<ApiResponse<CouponResponse>> createCoupon(@Valid @RequestBody CouponCreateRequest request) {
        CouponResponse response = couponService.createCoupon(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Coupon created successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get paginated list of coupons (Admin)")
    public ResponseEntity<ApiResponse<PageResponse<CouponResponse>>> getCoupons(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageResponse<CouponResponse> response = couponService.getCoupons(pageable);
        return ResponseEntity.ok(ApiResponse.success("Coupons retrieved successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get coupon details by ID (Admin)")
    public ResponseEntity<ApiResponse<CouponResponse>> getCouponById(@PathVariable UUID id) {
        CouponResponse response = couponService.getCouponById(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon details retrieved successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update coupon details (Admin)")
    public ResponseEntity<ApiResponse<CouponResponse>> updateCoupon(
            @PathVariable UUID id,
            @Valid @RequestBody CouponUpdateRequest request
    ) {
        CouponResponse response = couponService.updateCoupon(id, request);
        return ResponseEntity.ok(ApiResponse.success("Coupon updated successfully", response));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate coupon (Admin)")
    public ResponseEntity<ApiResponse<CouponResponse>> activateCoupon(@PathVariable UUID id) {
        CouponResponse response = couponService.setCouponActive(id, true);
        return ResponseEntity.ok(ApiResponse.success("Coupon activated successfully", response));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate coupon (Admin)")
    public ResponseEntity<ApiResponse<CouponResponse>> deactivateCoupon(@PathVariable UUID id) {
        CouponResponse response = couponService.setCouponActive(id, false);
        return ResponseEntity.ok(ApiResponse.success("Coupon deactivated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete coupon (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable UUID id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted successfully", null));
    }
}
