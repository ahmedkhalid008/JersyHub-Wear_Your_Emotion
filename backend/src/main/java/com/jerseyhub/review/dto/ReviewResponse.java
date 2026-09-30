package com.jerseyhub.review.dto;

import com.jerseyhub.review.Review;

import java.time.Instant;
import java.util.UUID;

public record ReviewResponse(
        UUID id,
        UUID productId,
        UUID userId,
        String userName,
        int rating,
        String title,
        String comment,
        boolean verifiedPurchase,
        Instant createdAt,
        Instant updatedAt
) {
    public static ReviewResponse from(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getProduct() != null ? review.getProduct().getId() : null,
                review.getUser() != null ? review.getUser().getId() : null,
                review.getUser() != null ? review.getUser().getName() : "Anonymous",
                review.getRating(),
                review.getTitle(),
                review.getComment(),
                review.isVerifiedPurchase(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }
}
