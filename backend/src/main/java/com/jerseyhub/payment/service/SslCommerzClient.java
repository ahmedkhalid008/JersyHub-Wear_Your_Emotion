package com.jerseyhub.payment.service;

import com.jerseyhub.order.Order;
import com.jerseyhub.payment.Payment;
import com.jerseyhub.payment.config.SslCommerzConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class SslCommerzClient {

    private static final Logger log = LoggerFactory.getLogger(SslCommerzClient.class);

    private final SslCommerzConfig config;
    private final RestTemplate restTemplate;

    @org.springframework.beans.factory.annotation.Autowired
    public SslCommerzClient(SslCommerzConfig config) {
        this.config = config;
        this.restTemplate = new RestTemplate();
    }

    public SslCommerzClient(SslCommerzConfig config, RestTemplate restTemplate) {
        this.config = config;
        this.restTemplate = restTemplate;
    }

    @SuppressWarnings("unchecked")
    public String initiateSession(Payment payment, Order order, String callbackBaseUrl) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("store_id", config.getStoreId());
        body.add("store_passwd", config.getStorePassword());
        body.add("total_amount", payment.getAmount().toPlainString());
        body.add("currency", payment.getCurrency());
        body.add("tran_id", payment.getTransactionId());
        body.add("success_url", callbackBaseUrl + "/api/v1/payments/sslcommerz/success");
        body.add("fail_url", callbackBaseUrl + "/api/v1/payments/sslcommerz/fail");
        body.add("cancel_url", callbackBaseUrl + "/api/v1/payments/sslcommerz/cancel");
        body.add("ipn_url", callbackBaseUrl + "/api/v1/payments/sslcommerz/ipn");

        body.add("cus_name", order.getShippingRecipientName());
        body.add("cus_email", order.getUser() != null ? order.getUser().getEmail() : "customer@example.com");
        body.add("cus_add1", order.getShippingAddressLine());
        body.add("cus_city", order.getShippingDistrict());
        body.add("cus_postcode", order.getShippingPostalCode() != null ? order.getShippingPostalCode() : "1000");
        body.add("cus_country", "Bangladesh");
        body.add("cus_phone", order.getShippingPhone());

        body.add("shipping_method", "NO");
        body.add("product_name", "JerseyHub Order " + order.getOrderNumber());
        body.add("product_category", "Clothing");
        body.add("product_profile", "general");

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);

        try {
            log.info("Initiating SSLCommerz payment session for transaction: {}", payment.getTransactionId());
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(config.getSessionInitUrl(), requestEntity, Map.class);
            Map<String, Object> response = responseEntity.getBody();

            if (response != null && "SUCCESS".equalsIgnoreCase(String.valueOf(response.get("status")))) {
                String gatewayUrl = String.valueOf(response.get("GatewayPageURL"));
                log.info("SSLCommerz session created successfully. GatewayPageURL: {}", gatewayUrl);
                return gatewayUrl;
            } else {
                String reason = response != null ? String.valueOf(response.get("failedreason")) : "Unknown gateway error";
                log.error("SSLCommerz session creation failed: {}", reason);
                throw new RuntimeException("SSLCommerz session creation failed: " + reason);
            }
        } catch (Exception e) {
            log.error("Error communicating with SSLCommerz API", e);
            throw new RuntimeException("SSLCommerz API error: " + e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> validateTransaction(String valId) {
        String validationUrl = String.format("%s?val_id=%s&store_id=%s&store_passwd=%s&v=1&format=json",
                config.getValidationUrl(), valId, config.getStoreId(), config.getStorePassword());

        try {
            log.info("Validating SSLCommerz transaction val_id: {}", valId);
            ResponseEntity<Map> responseEntity = restTemplate.getForEntity(validationUrl, Map.class);
            return responseEntity.getBody();
        } catch (Exception e) {
            log.error("Error validating SSLCommerz transaction val_id: {}", valId, e);
            throw new RuntimeException("SSLCommerz transaction validation failed: " + e.getMessage(), e);
        }
    }
}
