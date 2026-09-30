package com.jerseyhub.review.dto;

import com.jerseyhub.review.Review;

import java.time.Instant;
import java.util.UUID;

public record AdminReviewResponse(
        UUID id,
        UUID productId,
        String productName,
        UUID userId,
        String userName,
        String userEmail,
        int rating,
        String title,
        String comment,
        boolean verifiedPurchase,
        boolean approved,
        Instant createdAt,
        Instant updatedAt
) {
    public static AdminReviewResponse from(Review review) {
        return new AdminReviewResponse(
                review.getId(),
                review.getProduct() != null ? review.getProduct().getId() : null,
                review.getProduct() != null ? review.getProduct().getName() : "N/A",
                review.getUser() != null ? review.getUser().getId() : null,
                review.getUser() != null ? review.getUser().getName() : "N/A",
                review.getUser() != null ? review.getUser().getEmail() : "N/A",
                review.getRating(),
                review.getTitle(),
                review.getComment(),
                review.isVerifiedPurchase(),
                review.isApproved(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }
}
