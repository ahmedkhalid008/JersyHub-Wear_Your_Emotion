package com.jerseyhub.payment;

import com.jerseyhub.auth.security.UserPrincipal;
import com.jerseyhub.common.response.ApiResponse;
import com.jerseyhub.payment.dto.PaymentInitiateRequest;
import com.jerseyhub.payment.dto.PaymentInitiateResponse;
import com.jerseyhub.payment.dto.PaymentResponse;
import com.jerseyhub.payment.dto.SslCommerzCallbackPayload;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@Tag(name = "Payments", description = "SSLCommerz Payment Gateway APIs")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/sslcommerz/initiate")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Initiate SSLCommerz payment for an order")
    public ResponseEntity<ApiResponse<PaymentInitiateResponse>> initiatePayment(
            @Valid @RequestBody PaymentInitiateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest httpRequest
    ) {
        String baseUrl = getBaseUrl(httpRequest);
        PaymentInitiateResponse response = paymentService.initiatePayment(currentUser.getId(), request, baseUrl);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment session initiated successfully", response));
    }

    @GetMapping("/{paymentId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get payment details by ID")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPayment(
            @PathVariable UUID paymentId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        PaymentResponse response = paymentService.getPayment(currentUser.getId(), paymentId);
        return ResponseEntity.ok(ApiResponse.success("Payment retrieved successfully", response));
    }

    @PostMapping(value = "/sslcommerz/success", consumes = {MediaType.APPLICATION_FORM_URLENCODED_VALUE, MediaType.APPLICATION_JSON_VALUE})
    @Operation(summary = "SSLCommerz payment success callback")
    public ResponseEntity<ApiResponse<PaymentResponse>> handleSuccess(@ModelAttribute SslCommerzCallbackPayload payload) {
        PaymentResponse response = paymentService.handleSuccessCallback(payload);
        return ResponseEntity.ok(ApiResponse.success("Payment completed successfully", response));
    }

    @PostMapping(value = "/sslcommerz/fail", consumes = {MediaType.APPLICATION_FORM_URLENCODED_VALUE, MediaType.APPLICATION_JSON_VALUE})
    @Operation(summary = "SSLCommerz payment failure callback")
    public ResponseEntity<ApiResponse<PaymentResponse>> handleFail(@ModelAttribute SslCommerzCallbackPayload payload) {
        PaymentResponse response = paymentService.handleFailCallback(payload);
        return ResponseEntity.ok(ApiResponse.success("Payment failure recorded", response));
    }

    @PostMapping(value = "/sslcommerz/cancel", consumes = {MediaType.APPLICATION_FORM_URLENCODED_VALUE, MediaType.APPLICATION_JSON_VALUE})
    @Operation(summary = "SSLCommerz payment cancellation callback")
    public ResponseEntity<ApiResponse<PaymentResponse>> handleCancel(@ModelAttribute SslCommerzCallbackPayload payload) {
        PaymentResponse response = paymentService.handleCancelCallback(payload);
        return ResponseEntity.ok(ApiResponse.success("Payment cancellation recorded", response));
    }

    @PostMapping(value = "/sslcommerz/ipn", consumes = {MediaType.APPLICATION_FORM_URLENCODED_VALUE, MediaType.APPLICATION_JSON_VALUE})
    @Operation(summary = "SSLCommerz Instant Payment Notification (IPN)")
    public ResponseEntity<ApiResponse<PaymentResponse>> handleIpn(@ModelAttribute SslCommerzCallbackPayload payload) {
        PaymentResponse response;
        if (payload != null && ("VALID".equalsIgnoreCase(payload.status()) || "VALIDATED".equalsIgnoreCase(payload.status()))) {
            response = paymentService.handleSuccessCallback(payload);
        } else {
            response = paymentService.handleFailCallback(payload);
        }
        return ResponseEntity.ok(ApiResponse.success("IPN processed successfully", response));
    }

    private String getBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int serverPort = request.getServerPort();
        if ((scheme.equals("http") && serverPort == 80) || (scheme.equals("https") && serverPort == 443)) {
            return scheme + "://" + serverName;
        }
        return scheme + "://" + serverName + ":" + serverPort;
    }
}
