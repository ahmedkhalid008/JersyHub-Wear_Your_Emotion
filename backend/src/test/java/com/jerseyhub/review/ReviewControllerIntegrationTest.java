package com.jerseyhub.review;

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
import com.jerseyhub.common.response.PageResponse;
import com.jerseyhub.review.dto.ReviewCreateRequest;
import com.jerseyhub.review.dto.ReviewResponse;
import com.jerseyhub.review.dto.ReviewSummaryResponse;
import com.jerseyhub.review.dto.ReviewUpdateRequest;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.doAnswer;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ReviewController.class)
@Import({SecurityConfig.class, CustomAuthenticationEntryPoint.class, CustomAccessDeniedHandler.class, GlobalExceptionHandler.class})
class ReviewControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ReviewService reviewService;

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

    private UserPrincipal mockCustomer;
    private UUID productId;

    @BeforeEach
    void setUp() throws Exception {
        productId = UUID.randomUUID();
        mockCustomer = new UserPrincipal(
                UUID.randomUUID(),
                "John Customer",
                "john@example.com",
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
    @DisplayName("POST /api/v1/products/{productId}/reviews - Should return 401 Unauthorized when unauthenticated")
    void createReview_Unauthenticated_Returns401() throws Exception {
        ReviewCreateRequest request = new ReviewCreateRequest(5, "Great", "Loved it!");

        mockMvc.perform(post("/api/v1/products/" + productId + "/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_UNAUTHORIZED"));
    }

    @Test
    @DisplayName("POST /api/v1/products/{productId}/reviews - Should submit review successfully (201 Created)")
    void createReview_Success() throws Exception {
        ReviewCreateRequest request = new ReviewCreateRequest(5, "Great Kit", "Loved the quality!");
        UUID reviewId = UUID.randomUUID();
        ReviewResponse reviewResponse = new ReviewResponse(
                reviewId, productId, mockCustomer.getId(), "John Customer",
                5, "Great Kit", "Loved the quality!", true, Instant.now(), Instant.now()
        );

        given(reviewService.createReview(eq(mockCustomer.getId()), eq(productId), any(ReviewCreateRequest.class)))
                .willReturn(reviewResponse);

        mockMvc.perform(post("/api/v1/products/" + productId + "/reviews")
                        .with(user(mockCustomer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(reviewId.toString()))
                .andExpect(jsonPath("$.data.rating").value(5));
    }

    @Test
    @DisplayName("POST /api/v1/products/{productId}/reviews - Should return 400 Bad Request when purchase is missing")
    void createReview_WithoutPurchase_Returns400() throws Exception {
        ReviewCreateRequest request = new ReviewCreateRequest(5, "Great Kit", "Loved the quality!");

        given(reviewService.createReview(eq(mockCustomer.getId()), eq(productId), any(ReviewCreateRequest.class)))
                .willThrow(new BusinessException("Verified purchase required to review this product", ErrorCode.VERIFIED_PURCHASE_REQUIRED.getCode()));

        mockMvc.perform(post("/api/v1/products/" + productId + "/reviews")
                        .with(user(mockCustomer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_VERIFIED_PURCHASE_REQUIRED"));
    }

    @Test
    @DisplayName("GET /api/v1/products/{productId}/reviews - Should return public approved reviews list (200 OK)")
    void getProductReviews_Public_Returns200() throws Exception {
        ReviewResponse reviewResponse = new ReviewResponse(
                UUID.randomUUID(), productId, mockCustomer.getId(), "John Customer",
                5, "Great Kit", "Loved the quality!", true, Instant.now(), Instant.now()
        );

        PageResponse<ReviewResponse> pageResponse = PageResponse.from(
                new PageImpl<>(List.of(reviewResponse), PageRequest.of(0, 10), 1)
        );

        given(reviewService.getProductReviews(eq(productId), any())).willReturn(pageResponse);

        mockMvc.perform(get("/api/v1/products/" + productId + "/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].rating").value(5));
    }

    @Test
    @DisplayName("GET /api/v1/products/{productId}/reviews/summary - Should return review summary (200 OK)")
    void getReviewSummary_Public_Returns200() throws Exception {
        ReviewSummaryResponse summaryResponse = new ReviewSummaryResponse(productId, 4.7, 12L);

        given(reviewService.getReviewSummary(eq(productId))).willReturn(summaryResponse);

        mockMvc.perform(get("/api/v1/products/" + productId + "/reviews/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.averageRating").value(4.7))
                .andExpect(jsonPath("$.data.totalReviews").value(12));
    }

    @Test
    @DisplayName("PUT /api/v1/products/{productId}/reviews/{reviewId} - Should update own review (200 OK)")
    void updateReview_Owner_Returns200() throws Exception {
        UUID reviewId = UUID.randomUUID();
        ReviewUpdateRequest updateRequest = new ReviewUpdateRequest(4, "Updated Title", "Updated Comment");
        ReviewResponse reviewResponse = new ReviewResponse(
                reviewId, productId, mockCustomer.getId(), "John Customer",
                4, "Updated Title", "Updated Comment", true, Instant.now(), Instant.now()
        );

        given(reviewService.updateReview(eq(mockCustomer.getId()), eq(productId), eq(reviewId), any(ReviewUpdateRequest.class)))
                .willReturn(reviewResponse);

        mockMvc.perform(put("/api/v1/products/" + productId + "/reviews/" + reviewId)
                        .with(user(mockCustomer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.rating").value(4))
                .andExpect(jsonPath("$.data.comment").value("Updated Comment"));
    }

    @Test
    @DisplayName("DELETE /api/v1/products/{productId}/reviews/{reviewId} - Should delete own review (200 OK)")
    void deleteReview_Owner_Returns200() throws Exception {
        UUID reviewId = UUID.randomUUID();

        mockMvc.perform(delete("/api/v1/products/" + productId + "/reviews/" + reviewId)
                        .with(user(mockCustomer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
