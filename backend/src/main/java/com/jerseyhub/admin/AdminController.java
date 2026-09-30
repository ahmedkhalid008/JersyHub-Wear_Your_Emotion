package com.jerseyhub.admin;

import com.jerseyhub.admin.dto.AdminDashboardSummaryResponse;
import com.jerseyhub.admin.dto.AdminOrderDetailResponse;
import com.jerseyhub.admin.dto.AdminOrderSummaryResponse;
import com.jerseyhub.admin.dto.AdminProductResponse;
import com.jerseyhub.admin.dto.AdminUserResponse;
import com.jerseyhub.common.response.ApiResponse;
import com.jerseyhub.common.response.PageResponse;
import com.jerseyhub.order.OrderStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Foundation", description = "Admin Dashboard, Orders, Products & Users Management APIs")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard/summary")
    @Operation(summary = "Get high-level admin dashboard summary statistics")
    public ResponseEntity<ApiResponse<AdminDashboardSummaryResponse>> getDashboardSummary() {
        AdminDashboardSummaryResponse summary = adminService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.success("Dashboard summary retrieved successfully", summary));
    }

    @GetMapping("/orders")
    @Operation(summary = "Get paginated order overview across all customers with optional status filter")
    public ResponseEntity<ApiResponse<PageResponse<AdminOrderSummaryResponse>>> getOrders(
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageResponse<AdminOrderSummaryResponse> orders = adminService.getOrders(status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }

    @GetMapping("/orders/{id}")
    @Operation(summary = "Get comprehensive order details by ID for any customer")
    public ResponseEntity<ApiResponse<AdminOrderDetailResponse>> getOrderById(@PathVariable UUID id) {
        AdminOrderDetailResponse orderDetail = adminService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success("Order details retrieved successfully", orderDetail));
    }

    @GetMapping("/users")
    @Operation(summary = "Get paginated registered users overview")
    public ResponseEntity<ApiResponse<PageResponse<AdminUserResponse>>> getUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageResponse<AdminUserResponse> users = adminService.getUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get safe user profile details by user ID")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUserById(@PathVariable UUID id) {
        AdminUserResponse user = adminService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User details retrieved successfully", user));
    }
}
