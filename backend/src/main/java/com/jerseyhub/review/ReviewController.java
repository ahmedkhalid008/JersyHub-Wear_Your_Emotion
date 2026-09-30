package com.jerseyhub.review;

import com.jerseyhub.auth.security.UserPrincipal;
import com.jerseyhub.common.response.ApiResponse;
import com.jerseyhub.common.response.PageResponse;
import com.jerseyhub.review.dto.ReviewCreateRequest;
import com.jerseyhub.review.dto.ReviewResponse;
import com.jerseyhub.review.dto.ReviewSummaryResponse;
import com.jerseyhub.review.dto.ReviewUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products/{productId}/reviews")
@Tag(name = "Product Reviews", description = "Customer Product Reviews & Rating APIs")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Submit a review for a verified purchased product")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @PathVariable UUID productId,
            @Valid @RequestBody ReviewCreateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        ReviewResponse response = reviewService.createReview(currentUser.getId(), productId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get paginated approved reviews for a product (Public)")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getProductReviews(
            @PathVariable UUID productId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageResponse<ReviewResponse> response = reviewService.getProductReviews(productId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Product reviews retrieved successfully", response));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get rating summary and count for a product (Public)")
    public ResponseEntity<ApiResponse<ReviewSummaryResponse>> getReviewSummary(@PathVariable UUID productId) {
        ReviewSummaryResponse response = reviewService.getReviewSummary(productId);
        return ResponseEntity.ok(ApiResponse.success("Review summary retrieved successfully", response));
    }

    @GetMapping("/{reviewId}")
    @Operation(summary = "Get specific product review details (Public)")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewById(
            @PathVariable UUID productId,
            @PathVariable UUID reviewId
    ) {
        ReviewResponse response = reviewService.getReviewById(productId, reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review retrieved successfully", response));
    }

    @PutMapping("/{reviewId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update own product review")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable UUID productId,
            @PathVariable UUID reviewId,
            @Valid @RequestBody ReviewUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        ReviewResponse response = reviewService.updateReview(currentUser.getId(), productId, reviewId, request);
        return ResponseEntity.ok(ApiResponse.success("Review updated successfully", response));
    }

    @DeleteMapping("/{reviewId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete own product review")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable UUID productId,
            @PathVariable UUID reviewId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        reviewService.deleteReview(currentUser.getId(), productId, reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
    }
}
