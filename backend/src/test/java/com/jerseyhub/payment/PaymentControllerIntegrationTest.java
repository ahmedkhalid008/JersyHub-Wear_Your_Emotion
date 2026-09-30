package com.jerseyhub.payment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jerseyhub.auth.RefreshTokenRepository;
import com.jerseyhub.auth.security.CustomUserDetailsService;
import com.jerseyhub.auth.security.JwtAuthenticationFilter;
import com.jerseyhub.auth.security.JwtTokenProvider;
import com.jerseyhub.auth.security.UserPrincipal;
import com.jerseyhub.common.config.CustomAccessDeniedHandler;
import com.jerseyhub.common.config.CustomAuthenticationEntryPoint;
import com.jerseyhub.common.config.SecurityConfig;
import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.GlobalExceptionHandler;
import com.jerseyhub.payment.dto.PaymentInitiateRequest;
import com.jerseyhub.payment.dto.PaymentInitiateResponse;
import com.jerseyhub.payment.dto.PaymentResponse;
import com.jerseyhub.payment.dto.SslCommerzCallbackPayload;
import com.jerseyhub.user.UserRepository;
import com.jerseyhub.user.UserRole;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.doAnswer;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = PaymentController.class)
@Import({SecurityConfig.class, CustomAuthenticationEntryPoint.class, CustomAccessDeniedHandler.class, GlobalExceptionHandler.class})
class PaymentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PaymentService paymentService;

    @MockitoBean
    private JwtTokenProvider tokenProvider;

    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private RefreshTokenRepository refreshTokenRepository;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private UserPrincipal mockUserPrincipal;

    @BeforeEach
    void setUp() throws Exception {
        mockUserPrincipal = new UserPrincipal(
                UUID.randomUUID(),
                "Customer Payer",
                "payer@example.com",
                "password",
                UserRole.CUSTOMER,
                true,
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );

        doAnswer(invocation -> {
            HttpServletRequest req = invocation.getArgument(0);
            HttpServletResponse res = invocation.getArgument(1);
            FilterChain chain = invocation.getArgument(2);
            chain.doFilter(req, res);
            return null;
        }).when(jwtAuthenticationFilter).doFilter(any(), any(), any());
    }

    @Test
    @DisplayName("POST /api/v1/payments/sslcommerz/initiate - Should return 401 Unauthorized when unauthenticated")
    void initiatePayment_Unauthenticated_Returns401() throws Exception {
        PaymentInitiateRequest request = new PaymentInitiateRequest(UUID.randomUUID());

        mockMvc.perform(post("/api/v1/payments/sslcommerz/initiate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_UNAUTHORIZED"));
    }

    @Test
    @DisplayName("POST /api/v1/payments/sslcommerz/initiate - Should initiate payment session and return 201 Created")
    void initiatePayment_Success() throws Exception {
        UUID orderId = UUID.randomUUID();
        UUID paymentId = UUID.randomUUID();
        PaymentInitiateRequest request = new PaymentInitiateRequest(orderId);

        PaymentInitiateResponse response = new PaymentInitiateResponse(
                paymentId, orderId, "TXN-100", new BigDecimal("2500.00"), "BDT",
                "https://sandbox.sslcommerz.com/gwprocess/v4/api.php?sessionkey=TEST", PaymentStatus.INITIATED
        );

        given(paymentService.initiatePayment(eq(mockUserPrincipal.getId()), any(PaymentInitiateRequest.class), any())).willReturn(response);

        mockMvc.perform(post("/api/v1/payments/sslcommerz/initiate")
                        .with(user(mockUserPrincipal))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.paymentId").value(paymentId.toString()))
                .andExpect(jsonPath("$.data.gatewayPageUrl").value("https://sandbox.sslcommerz.com/gwprocess/v4/api.php?sessionkey=TEST"));
    }

    @Test
    @DisplayName("POST /api/v1/payments/sslcommerz/success - Should process public success callback")
    void handleSuccess_PublicCallback_Success() throws Exception {
        UUID paymentId = UUID.randomUUID();
        PaymentResponse response = new PaymentResponse(
                paymentId, UUID.randomUUID(), "TXN-100", PaymentGateway.SSLCOMMERZ,
                new BigDecimal("2500.00"), "BDT", PaymentStatus.SUCCESS, Instant.now(), Instant.now(), Instant.now()
        );

        given(paymentService.handleSuccessCallback(any(SslCommerzCallbackPayload.class))).willReturn(response);

        mockMvc.perform(post("/api/v1/payments/sslcommerz/success")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("tran_id", "TXN-100")
                        .param("val_id", "VAL-123")
                        .param("status", "VALID")
                        .param("amount", "2500.00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("SUCCESS"));
    }

    @Test
    @DisplayName("POST /api/v1/payments/sslcommerz/fail - Should process public fail callback")
    void handleFail_PublicCallback_Success() throws Exception {
        UUID paymentId = UUID.randomUUID();
        PaymentResponse response = new PaymentResponse(
                paymentId, UUID.randomUUID(), "TXN-100", PaymentGateway.SSLCOMMERZ,
                new BigDecimal("2500.00"), "BDT", PaymentStatus.FAILED, null, Instant.now(), Instant.now()
        );

        given(paymentService.handleFailCallback(any(SslCommerzCallbackPayload.class))).willReturn(response);

        mockMvc.perform(post("/api/v1/payments/sslcommerz/fail")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("tran_id", "TXN-100")
                        .param("status", "FAILED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("FAILED"));
    }

    @Test
    @DisplayName("POST /api/v1/payments/sslcommerz/cancel - Should process public cancel callback")
    void handleCancel_PublicCallback_Success() throws Exception {
        UUID paymentId = UUID.randomUUID();
        PaymentResponse response = new PaymentResponse(
                paymentId, UUID.randomUUID(), "TXN-100", PaymentGateway.SSLCOMMERZ,
                new BigDecimal("2500.00"), "BDT", PaymentStatus.CANCELLED, null, Instant.now(), Instant.now()
        );

        given(paymentService.handleCancelCallback(any(SslCommerzCallbackPayload.class))).willReturn(response);

        mockMvc.perform(post("/api/v1/payments/sslcommerz/cancel")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("tran_id", "TXN-100")
                        .param("status", "CANCELLED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));
    }

    @Test
    @DisplayName("POST /api/v1/payments/sslcommerz/ipn - Should process public IPN callback")
    void handleIpn_PublicCallback_Success() throws Exception {
        UUID paymentId = UUID.randomUUID();
        PaymentResponse response = new PaymentResponse(
                paymentId, UUID.randomUUID(), "TXN-100", PaymentGateway.SSLCOMMERZ,
                new BigDecimal("2500.00"), "BDT", PaymentStatus.SUCCESS, Instant.now(), Instant.now(), Instant.now()
        );

        given(paymentService.handleSuccessCallback(any(SslCommerzCallbackPayload.class))).willReturn(response);

        mockMvc.perform(post("/api/v1/payments/sslcommerz/ipn")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("tran_id", "TXN-100")
                        .param("val_id", "VAL-123")
                        .param("status", "VALID"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("SUCCESS"));
    }
}
