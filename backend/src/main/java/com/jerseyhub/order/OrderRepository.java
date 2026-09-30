package com.jerseyhub.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByOrderNumber(String orderNumber);
    boolean existsByOrderNumber(String orderNumber);
    List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<Order> findByIdAndUserId(UUID id, UUID userId);
    List<Order> findByStatus(OrderStatus status);
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
    long countByStatus(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status IN (com.jerseyhub.order.OrderStatus.PAID, com.jerseyhub.order.OrderStatus.PROCESSING, com.jerseyhub.order.OrderStatus.SHIPPED, com.jerseyhub.order.OrderStatus.DELIVERED)")
    BigDecimal sumSuccessfulRevenue();
}

