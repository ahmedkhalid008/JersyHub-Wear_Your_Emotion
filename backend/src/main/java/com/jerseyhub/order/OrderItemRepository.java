package com.jerseyhub.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {
    List<OrderItem> findByOrderId(UUID orderId);

    @Query("SELECT CASE WHEN COUNT(oi) > 0 THEN true ELSE false END FROM OrderItem oi WHERE oi.order.user.id = :userId AND oi.product.id = :productId AND oi.order.status IN (com.jerseyhub.order.OrderStatus.PAID, com.jerseyhub.order.OrderStatus.PROCESSING, com.jerseyhub.order.OrderStatus.SHIPPED, com.jerseyhub.order.OrderStatus.DELIVERED)")
    boolean existsVerifiedPurchase(@Param("userId") UUID userId, @Param("productId") UUID productId);
}
