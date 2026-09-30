package com.jerseyhub.review;

import com.jerseyhub.common.response.ApiResponse;
import com.jerseyhub.common.response.PageResponse;
import com.jerseyhub.review.dto.AdminReviewResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/reviews")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Review Moderation", description = "Admin Review Moderation & Audit APIs")
public class ReviewAdminController {

    private final ReviewService reviewService;

    public ReviewAdminController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    @Operation(summary = "Get paginated reviews list across products for admin moderation")
    public ResponseEntity<ApiResponse<PageResponse<AdminReviewResponse>>> getAdminReviews(
            @RequestParam(required = false) Boolean approved,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageResponse<AdminReviewResponse> response = reviewService.getAdminReviews(approved, pageable);
        return ResponseEntity.ok(ApiResponse.success("Admin reviews retrieved successfully", response));
    }

    @PatchMapping("/{id}/approve")
    @Operation(summary = "Approve customer product review (Admin)")
    public ResponseEntity<ApiResponse<AdminReviewResponse>> approveReview(@PathVariable UUID id) {
        AdminReviewResponse response = reviewService.approveReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review approved successfully", response));
    }

    @PatchMapping("/{id}/reject")
    @Operation(summary = "Reject customer product review (Admin)")
    public ResponseEntity<ApiResponse<AdminReviewResponse>> rejectReview(@PathVariable UUID id) {
        AdminReviewResponse response = reviewService.rejectReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review rejected successfully", response));
    }
}
