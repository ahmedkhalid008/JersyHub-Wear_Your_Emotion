package com.jerseyhub.review;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByProductIdAndApprovedTrueOrderByCreatedAtDesc(UUID productId);
    List<Review> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Page<Review> findByProductIdAndApprovedTrue(UUID productId, Pageable pageable);
    Page<Review> findByApproved(boolean approved, Pageable pageable);
    boolean existsByProductIdAndUserId(UUID productId, UUID userId);
    Optional<Review> findByProductIdAndUserId(UUID productId, UUID userId);
    long countByProductIdAndApprovedTrue(UUID productId);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.product.id = :productId AND r.approved = true")
    Double getAverageRatingByProductId(@Param("productId") UUID productId);
}
