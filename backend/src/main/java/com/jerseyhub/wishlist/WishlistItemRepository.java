package com.jerseyhub.wishlist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, UUID> {
    Optional<WishlistItem> findByWishlistIdAndProductId(UUID wishlistId, UUID productId);
    boolean existsByWishlistIdAndProductId(UUID wishlistId, UUID productId);
}
