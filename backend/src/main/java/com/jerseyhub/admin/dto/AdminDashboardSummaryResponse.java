package com.jerseyhub.admin.dto;

import java.math.BigDecimal;

public record AdminDashboardSummaryResponse(
        long totalUsers,
        long totalProducts,
        long totalOrders,
        long pendingOrders,
        long processingOrders,
        long shippedOrders,
        long deliveredOrders,
        long cancelledOrders,
        BigDecimal totalSuccessfulRevenue
) {}
