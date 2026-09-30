package com.jerseyhub.review;

import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.common.response.PageResponse;
import com.jerseyhub.order.OrderItemRepository;
import com.jerseyhub.product.Product;
import com.jerseyhub.product.ProductRepository;
import com.jerseyhub.review.dto.AdminReviewResponse;
import com.jerseyhub.review.dto.ReviewCreateRequest;
import com.jerseyhub.review.dto.ReviewResponse;
import com.jerseyhub.review.dto.ReviewSummaryResponse;
import com.jerseyhub.review.dto.ReviewUpdateRequest;
import com.jerseyhub.user.User;
import com.jerseyhub.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            OrderItemRepository orderItemRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @Transactional
    public ReviewResponse createReview(UUID userId, UUID productId, ReviewCreateRequest request) {
        if (request.rating() < 1 || request.rating() > 5) {
            throw new BusinessException("Rating must be between 1 and 5", ErrorCode.INVALID_REQUEST.getCode());
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found", ErrorCode.PRODUCT_NOT_FOUND.getCode()));

        boolean hasPurchased = orderItemRepository.existsVerifiedPurchase(userId, productId);
        if (!hasPurchased) {
            throw new BusinessException("Verified purchase required to review this product", ErrorCode.VERIFIED_PURCHASE_REQUIRED.getCode());
        }

        boolean alreadyReviewed = reviewRepository.existsByProductIdAndUserId(productId, userId);
        if (alreadyReviewed) {
            throw new BusinessException("User has already reviewed this product", ErrorCode.REVIEW_ALREADY_EXISTS.getCode());
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found", ErrorCode.RESOURCE_NOT_FOUND.getCode()));

        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setRating(request.rating());
        review.setTitle(request.title());
        review.setComment(request.comment());
        review.setVerifiedPurchase(true);
        review.setApproved(false);

        Review savedReview = reviewRepository.save(review);
        return ReviewResponse.from(savedReview);
    }

    @Transactional
    public ReviewResponse updateReview(UUID userId, UUID productId, UUID reviewId, ReviewUpdateRequest request) {
        if (request.rating() < 1 || request.rating() > 5) {
            throw new BusinessException("Rating must be between 1 and 5", ErrorCode.INVALID_REQUEST.getCode());
        }

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found", ErrorCode.REVIEW_NOT_FOUND.getCode()));

        if (!review.getProduct().getId().equals(productId)) {
            throw new ResourceNotFoundException("Review not found for this product", ErrorCode.REVIEW_NOT_FOUND.getCode());
        }

        if (!review.getUser().getId().equals(userId)) {
            throw new BusinessException("Access denied: You do not own this review", ErrorCode.FORBIDDEN.getCode());
        }

        review.setRating(request.rating());
        review.setTitle(request.title());
        review.setComment(request.comment());

        return ReviewResponse.from(review);
    }

    @Transactional
    public void deleteReview(UUID userId, UUID productId, UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found", ErrorCode.REVIEW_NOT_FOUND.getCode()));

        if (!review.getProduct().getId().equals(productId)) {
            throw new ResourceNotFoundException("Review not found for this product", ErrorCode.REVIEW_NOT_FOUND.getCode());
        }

        if (!review.getUser().getId().equals(userId)) {
            throw new BusinessException("Access denied: You do not own this review", ErrorCode.FORBIDDEN.getCode());
        }

        reviewRepository.delete(review);
    }

    public PageResponse<ReviewResponse> getProductReviews(UUID productId, Pageable pageable) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found", ErrorCode.PRODUCT_NOT_FOUND.getCode());
        }

        Page<Review> reviewPage = reviewRepository.findByProductIdAndApprovedTrue(productId, pageable);
        return PageResponse.from(reviewPage.map(ReviewResponse::from));
    }

    public ReviewSummaryResponse getReviewSummary(UUID productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found", ErrorCode.PRODUCT_NOT_FOUND.getCode());
        }

        Double avgRating = reviewRepository.getAverageRatingByProductId(productId);
        long totalReviews = reviewRepository.countByProductIdAndApprovedTrue(productId);

        double roundedAvg = BigDecimal.valueOf(avgRating != null ? avgRating : 0.0)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();

        return new ReviewSummaryResponse(productId, roundedAvg, totalReviews);
    }

    public ReviewResponse getReviewById(UUID productId, UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found", ErrorCode.REVIEW_NOT_FOUND.getCode()));

        if (!review.getProduct().getId().equals(productId)) {
            throw new ResourceNotFoundException("Review not found for this product", ErrorCode.REVIEW_NOT_FOUND.getCode());
        }

        return ReviewResponse.from(review);
    }

    public PageResponse<AdminReviewResponse> getAdminReviews(Boolean approved, Pageable pageable) {
        Page<Review> reviewPage = approved != null
                ? reviewRepository.findByApproved(approved, pageable)
                : reviewRepository.findAll(pageable);
        return PageResponse.from(reviewPage.map(AdminReviewResponse::from));
    }

    @Transactional
    public AdminReviewResponse approveReview(UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found", ErrorCode.REVIEW_NOT_FOUND.getCode()));
        review.setApproved(true);
        return AdminReviewResponse.from(review);
    }

    @Transactional
    public AdminReviewResponse rejectReview(UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found", ErrorCode.REVIEW_NOT_FOUND.getCode()));
        review.setApproved(false);
        return AdminReviewResponse.from(review);
    }
}
