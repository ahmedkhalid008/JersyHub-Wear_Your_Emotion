package com.jerseyhub.payment;

import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.order.Order;
import com.jerseyhub.order.OrderRepository;
import com.jerseyhub.order.OrderStatus;
import com.jerseyhub.payment.dto.PaymentInitiateRequest;
import com.jerseyhub.payment.dto.PaymentInitiateResponse;
import com.jerseyhub.payment.dto.PaymentResponse;
import com.jerseyhub.payment.dto.SslCommerzCallbackPayload;
import com.jerseyhub.payment.service.SslCommerzClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final SslCommerzClient sslCommerzClient;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            SslCommerzClient sslCommerzClient
    ) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.sslCommerzClient = sslCommerzClient;
    }

    public PaymentInitiateResponse initiatePayment(UUID userId, PaymentInitiateRequest request, String callbackBaseUrl) {
        Order order = orderRepository.findByIdAndUserId(request.orderId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND.getCode()));

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new BusinessException("Order cannot be paid in current status: " + order.getStatus(), ErrorCode.INVALID_REQUEST.getCode());
        }

        Optional<Payment> existingOpt = paymentRepository.findByOrderId(order.getId());
        if (existingOpt.isPresent() && existingOpt.get().getStatus() == PaymentStatus.SUCCESS) {
            throw new BusinessException("Order is already paid", ErrorCode.INVALID_REQUEST.getCode());
        }

        String tranId = "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Payment payment = existingOpt.orElseGet(Payment::new);
        payment.setOrder(order);
        payment.setTransactionId(tranId);
        payment.setGateway(PaymentGateway.SSLCOMMERZ);
        payment.setAmount(order.getTotalAmount()); // Server-side amount from Order!
        payment.setCurrency(order.getCurrency());
        payment.setStatus(PaymentStatus.INITIATED);

        Payment savedPayment = paymentRepository.save(payment);

        String gatewayPageUrl = sslCommerzClient.initiateSession(savedPayment, order, callbackBaseUrl);

        return new PaymentInitiateResponse(
                savedPayment.getId(),
                order.getId(),
                savedPayment.getTransactionId(),
                savedPayment.getAmount(),
                savedPayment.getCurrency(),
                gatewayPageUrl,
                savedPayment.getStatus()
        );
    }

    public PaymentResponse handleSuccessCallback(SslCommerzCallbackPayload payload) {
        String tranId = payload != null ? payload.tran_id() : null;
        if (tranId == null || tranId.isBlank()) {
            throw new BusinessException("Transaction ID missing from SSLCommerz payload", ErrorCode.INVALID_REQUEST.getCode());
        }

        Payment payment = paymentRepository.findByTransactionId(tranId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for transaction: " + tranId, ErrorCode.RESOURCE_NOT_FOUND.getCode()));

        // Idempotency check: if already successful, return state without re-processing
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            log.info("Payment transaction {} is already completed. Skipping idempotent processing.", tranId);
            return PaymentResponse.from(payment);
        }

        if (payload.val_id() != null && !payload.val_id().isBlank()) {
            Map<String, Object> validationResponse = sslCommerzClient.validateTransaction(payload.val_id());
            if (validationResponse != null) {
                String valStatus = String.valueOf(validationResponse.get("status"));
                if (!"VALID".equalsIgnoreCase(valStatus) && !"VALIDATED".equalsIgnoreCase(valStatus)) {
                    throw new BusinessException("SSLCommerz server validation failed for val_id: " + payload.val_id(), ErrorCode.INVALID_REQUEST.getCode());
                }

                if (validationResponse.get("amount") != null) {
                    BigDecimal validatedAmount = new BigDecimal(String.valueOf(validationResponse.get("amount")));
                    if (payment.getAmount().compareTo(validatedAmount) != 0) {
                        throw new BusinessException("Payment amount mismatch. Expected: " + payment.getAmount() + ", Got: " + validatedAmount, ErrorCode.INVALID_REQUEST.getCode());
                    }
                }

                if (validationResponse.get("currency") != null) {
                    String validatedCurrency = String.valueOf(validationResponse.get("currency"));
                    if (!payment.getCurrency().equalsIgnoreCase(validatedCurrency)) {
                        throw new BusinessException("Payment currency mismatch", ErrorCode.INVALID_REQUEST.getCode());
                    }
                }
            }
        }

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(Instant.now());
        Payment savedPayment = paymentRepository.save(payment);

        Order order = payment.getOrder();
        if (order != null) {
            order.setStatus(OrderStatus.PAID);
            orderRepository.save(order);
        }

        log.info("Payment transaction {} successfully verified and completed.", tranId);
        return PaymentResponse.from(savedPayment);
    }

    public PaymentResponse handleFailCallback(SslCommerzCallbackPayload payload) {
        String tranId = payload != null ? payload.tran_id() : null;
        if (tranId == null || tranId.isBlank()) {
            throw new BusinessException("Transaction ID missing from payload", ErrorCode.INVALID_REQUEST.getCode());
        }

        Payment payment = paymentRepository.findByTransactionId(tranId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for transaction: " + tranId, ErrorCode.RESOURCE_NOT_FOUND.getCode()));

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return PaymentResponse.from(payment);
        }

        payment.setStatus(PaymentStatus.FAILED);
        Payment savedPayment = paymentRepository.save(payment);
        log.warn("Payment transaction {} marked as FAILED", tranId);
        return PaymentResponse.from(savedPayment);
    }

    public PaymentResponse handleCancelCallback(SslCommerzCallbackPayload payload) {
        String tranId = payload != null ? payload.tran_id() : null;
        if (tranId == null || tranId.isBlank()) {
            throw new BusinessException("Transaction ID missing from payload", ErrorCode.INVALID_REQUEST.getCode());
        }

        Payment payment = paymentRepository.findByTransactionId(tranId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for transaction: " + tranId, ErrorCode.RESOURCE_NOT_FOUND.getCode()));

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return PaymentResponse.from(payment);
        }

        payment.setStatus(PaymentStatus.CANCELLED);
        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment transaction {} marked as CANCELLED", tranId);
        return PaymentResponse.from(savedPayment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPayment(UUID userId, UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found", ErrorCode.RESOURCE_NOT_FOUND.getCode()));

        if (payment.getOrder() == null || payment.getOrder().getUser() == null || !payment.getOrder().getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Payment not found", ErrorCode.RESOURCE_NOT_FOUND.getCode());
        }

        return PaymentResponse.from(payment);
    }
}
