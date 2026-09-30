package com.jerseyhub.order;

import com.jerseyhub.auth.security.UserPrincipal;
import com.jerseyhub.common.response.ApiResponse;
import com.jerseyhub.order.dto.CheckoutRequest;
import com.jerseyhub.order.dto.OrderResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Orders", description = "Order & Checkout Management APIs")
public class OrderController {

    private final OrderService orderService;
    private final OrderPdfService orderPdfService;

    public OrderController(OrderService orderService, OrderPdfService orderPdfService) {
        this.orderService = orderService;
        this.orderPdfService = orderPdfService;
    }

    @PostMapping("/checkout")
    @Operation(summary = "Checkout cart and place an order")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(
            @Valid @RequestBody CheckoutRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        OrderResponse response = orderService.checkout(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get all orders for the current user")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getUserOrders(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        List<OrderResponse> response = orderService.getUserOrders(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific order by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getUserOrder(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        OrderResponse response = orderService.getUserOrder(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", response));
    }

    @GetMapping(value = "/{id}/invoice", produces = MediaType.APPLICATION_PDF_VALUE)
    @Operation(summary = "Download PDF invoice for order")
    public ResponseEntity<byte[]> getOrderInvoice(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        OrderResponse order = orderService.getUserOrder(currentUser.getId(), id);
        byte[] pdfBytes = orderPdfService.generateOrderInvoicePdf(currentUser.getId(), id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "jerseyhub-order-" + order.orderNumber() + ".pdf");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel an order and release reserved stock")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        OrderResponse response = orderService.cancelOrder(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", response));
    }
}

