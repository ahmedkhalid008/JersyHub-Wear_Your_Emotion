package com.jerseyhub.review;

import com.jerseyhub.auth.RefreshTokenRepository;
import com.jerseyhub.auth.security.CustomUserDetailsService;
import com.jerseyhub.auth.security.JwtAuthenticationFilter;
import com.jerseyhub.auth.security.JwtTokenProvider;
import com.jerseyhub.auth.security.UserPrincipal;
import com.jerseyhub.common.config.CustomAccessDeniedHandler;
import com.jerseyhub.common.config.CustomAuthenticationEntryPoint;
import com.jerseyhub.common.config.SecurityConfig;
import com.jerseyhub.common.exception.GlobalExceptionHandler;
import com.jerseyhub.common.response.PageResponse;
import com.jerseyhub.review.dto.AdminReviewResponse;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ReviewAdminController.class)
@Import({SecurityConfig.class, CustomAuthenticationEntryPoint.class, CustomAccessDeniedHandler.class, GlobalExceptionHandler.class})
class ReviewAdminControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

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

    private UserPrincipal customerPrincipal;
    private UserPrincipal adminPrincipal;

    @BeforeEach
    void setUp() throws Exception {
        customerPrincipal = new UserPrincipal(
                UUID.randomUUID(),
                "John Customer",
                "customer@example.com",
                "password",
                UserRole.CUSTOMER,
                true,
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );

        adminPrincipal = new UserPrincipal(
                UUID.randomUUID(),
                "Admin Boss",
                "admin@jerseyhub.com",
                "password",
                UserRole.ADMIN,
                true,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
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
    @DisplayName("GET /api/v1/admin/reviews - Should return 401 Unauthorized when unauthenticated")
    void getAdminReviews_Unauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/admin/reviews"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_UNAUTHORIZED"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/reviews - Should return 403 Forbidden for CUSTOMER role")
    void getAdminReviews_CustomerRole_Returns403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/reviews").with(user(customerPrincipal)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_FORBIDDEN"));
    }

    @Test
    @DisplayName("GET /api/v1/admin/reviews - Should return 200 OK for ADMIN role")
    void getAdminReviews_AdminRole_Returns200() throws Exception {
        AdminReviewResponse reviewResponse = new AdminReviewResponse(
                UUID.randomUUID(), UUID.randomUUID(), "Real Madrid Jersey", customerPrincipal.getId(),
                "John Customer", "customer@example.com", 5, "Awesome", "Great kit", true, false, Instant.now(), Instant.now()
        );

        PageResponse<AdminReviewResponse> pageResponse = PageResponse.from(
                new PageImpl<>(List.of(reviewResponse), PageRequest.of(0, 20), 1)
        );

        given(reviewService.getAdminReviews(eq(null), any())).willReturn(pageResponse);

        mockMvc.perform(get("/api/v1/admin/reviews").with(user(adminPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].productName").value("Real Madrid Jersey"));
    }

    @Test
    @DisplayName("PATCH /api/v1/admin/reviews/{id}/approve - Should return 403 Forbidden for CUSTOMER role")
    void approveReview_CustomerRole_Returns403() throws Exception {
        UUID reviewId = UUID.randomUUID();

        mockMvc.perform(patch("/api/v1/admin/reviews/" + reviewId + "/approve").with(user(customerPrincipal)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_FORBIDDEN"));
    }

    @Test
    @DisplayName("PATCH /api/v1/admin/reviews/{id}/approve - Should approve review for ADMIN role (200 OK)")
    void approveReview_AdminRole_Returns200() throws Exception {
        UUID reviewId = UUID.randomUUID();
        AdminReviewResponse reviewResponse = new AdminReviewResponse(
                reviewId, UUID.randomUUID(), "Real Madrid Jersey", customerPrincipal.getId(),
                "John Customer", "customer@example.com", 5, "Awesome", "Great kit", true, true, Instant.now(), Instant.now()
        );

        given(reviewService.approveReview(eq(reviewId))).willReturn(reviewResponse);

        mockMvc.perform(patch("/api/v1/admin/reviews/" + reviewId + "/approve").with(user(adminPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.approved").value(true));
    }

    @Test
    @DisplayName("PATCH /api/v1/admin/reviews/{id}/reject - Should reject review for ADMIN role (200 OK)")
    void rejectReview_AdminRole_Returns200() throws Exception {
        UUID reviewId = UUID.randomUUID();
        AdminReviewResponse reviewResponse = new AdminReviewResponse(
                reviewId, UUID.randomUUID(), "Real Madrid Jersey", customerPrincipal.getId(),
                "John Customer", "customer@example.com", 5, "Awesome", "Great kit", true, false, Instant.now(), Instant.now()
        );

        given(reviewService.rejectReview(eq(reviewId))).willReturn(reviewResponse);

        mockMvc.perform(patch("/api/v1/admin/reviews/" + reviewId + "/reject").with(user(adminPrincipal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.approved").value(false));
    }
}
