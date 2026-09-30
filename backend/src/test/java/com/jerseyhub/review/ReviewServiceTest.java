package com.jerseyhub.review;

import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.common.response.PageResponse;
import com.jerseyhub.order.OrderItemRepository;
import com.jerseyhub.product.Product;
import com.jerseyhub.product.ProductRepository;
import com.jerseyhub.review.dto.AdminReviewResponse;
import com.jerseyhub.review.dto.ReviewCreateRequest;
import com.jerseyhub.review.dto.ReviewResponse;
import com.jerseyhub.review.dto.ReviewSummaryResponse;
import com.jerseyhub.review.dto.ReviewUpdateRequest;
import com.jerseyhub.user.User;
import com.jerseyhub.user.UserRepository;
import com.jerseyhub.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @InjectMocks
    private ReviewService reviewService;

    private UUID userId;
    private UUID productId;
    private User sampleUser;
    private Product sampleProduct;
    private Review sampleReview;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        productId = UUID.randomUUID();

        sampleUser = new User("John Customer", "customer@example.com", "hash", UserRole.CUSTOMER);
        sampleUser.setId(userId);

        sampleProduct = new Product();
        sampleProduct.setId(productId);
        sampleProduct.setName("Barcelona Home Jersey");
        sampleProduct.setBasePrice(new BigDecimal("1500.00"));

        sampleReview = new Review();
        sampleReview.setId(UUID.randomUUID());
        sampleReview.setProduct(sampleProduct);
        sampleReview.setUser(sampleUser);
        sampleReview.setRating(5);
        sampleReview.setTitle("Awesome Quality");
        sampleReview.setComment("Best kit ever purchased!");
        sampleReview.setVerifiedPurchase(true);
        sampleReview.setApproved(false);
    }

    @Test
    @DisplayName("Should create review successfully for verified purchase")
    void createReview_Success() {
        ReviewCreateRequest request = new ReviewCreateRequest(5, "Awesome Quality", "Best kit ever purchased!");

        given(productRepository.findById(productId)).willReturn(Optional.of(sampleProduct));
        given(orderItemRepository.existsVerifiedPurchase(userId, productId)).willReturn(true);
        given(reviewRepository.existsByProductIdAndUserId(productId, userId)).willReturn(false);
        given(userRepository.findById(userId)).willReturn(Optional.of(sampleUser));
        given(reviewRepository.save(any(Review.class))).willReturn(sampleReview);

        ReviewResponse response = reviewService.createReview(userId, productId, request);

        assertThat(response).isNotNull();
        assertThat(response.rating()).isEqualTo(5);
        assertThat(response.comment()).isEqualTo("Best kit ever purchased!");
        assertThat(response.verifiedPurchase()).isTrue();
    }

    @Test
    @DisplayName("Should throw BusinessException when customer has not purchased the product")
    void createReview_WithoutPurchase_ThrowsException() {
        ReviewCreateRequest request = new ReviewCreateRequest(5, "Unverified Review", "Nice kit!");

        given(productRepository.findById(productId)).willReturn(Optional.of(sampleProduct));
        given(orderItemRepository.existsVerifiedPurchase(userId, productId)).willReturn(false);

        assertThatThrownBy(() -> reviewService.createReview(userId, productId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Verified purchase required")
                .extracting("errorCode").isEqualTo(ErrorCode.VERIFIED_PURCHASE_REQUIRED.getCode());
    }

    @Test
    @DisplayName("Should throw BusinessException when user attempts duplicate review")
    void createReview_AlreadyReviewed_ThrowsException() {
        ReviewCreateRequest request = new ReviewCreateRequest(5, "Duplicate Review", "Duplicate!");

        given(productRepository.findById(productId)).willReturn(Optional.of(sampleProduct));
        given(orderItemRepository.existsVerifiedPurchase(userId, productId)).willReturn(true);
        given(reviewRepository.existsByProductIdAndUserId(productId, userId)).willReturn(true);

        assertThatThrownBy(() -> reviewService.createReview(userId, productId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already reviewed")
                .extracting("errorCode").isEqualTo(ErrorCode.REVIEW_ALREADY_EXISTS.getCode());
    }

    @Test
    @DisplayName("Should throw BusinessException when rating is less than 1 or greater than 5")
    void createReview_InvalidRating_ThrowsException() {
        ReviewCreateRequest request0 = new ReviewCreateRequest(0, "Title", "Comment");
        ReviewCreateRequest request6 = new ReviewCreateRequest(6, "Title", "Comment");

        assertThatThrownBy(() -> reviewService.createReview(userId, productId, request0))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Rating must be between 1 and 5");

        assertThatThrownBy(() -> reviewService.createReview(userId, productId, request6))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Rating must be between 1 and 5");
    }

    @Test
    @DisplayName("Should update own review successfully")
    void updateReview_Success() {
        UUID reviewId = sampleReview.getId();
        ReviewUpdateRequest updateRequest = new ReviewUpdateRequest(4, "Updated Title", "Updated Comment");

        given(reviewRepository.findById(reviewId)).willReturn(Optional.of(sampleReview));

        ReviewResponse response = reviewService.updateReview(userId, productId, reviewId, updateRequest);

        assertThat(response).isNotNull();
        assertThat(response.rating()).isEqualTo(4);
        assertThat(response.comment()).isEqualTo("Updated Comment");
    }

    @Test
    @DisplayName("Should throw BusinessException when attempting to update another user's review")
    void updateReview_NotOwner_ThrowsException() {
        UUID reviewId = sampleReview.getId();
        UUID otherUserId = UUID.randomUUID();
        ReviewUpdateRequest updateRequest = new ReviewUpdateRequest(4, "Updated Title", "Updated Comment");

        given(reviewRepository.findById(reviewId)).willReturn(Optional.of(sampleReview));

        assertThatThrownBy(() -> reviewService.updateReview(otherUserId, productId, reviewId, updateRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Access denied")
                .extracting("errorCode").isEqualTo(ErrorCode.FORBIDDEN.getCode());
    }

    @Test
    @DisplayName("Should delete own review successfully")
    void deleteReview_Success() {
        UUID reviewId = sampleReview.getId();
        given(reviewRepository.findById(reviewId)).willReturn(Optional.of(sampleReview));

        reviewService.deleteReview(userId, productId, reviewId);

        verify(reviewRepository).delete(sampleReview);
    }

    @Test
    @DisplayName("Should calculate review summary average rating correctly")
    void getReviewSummary_Success() {
        given(productRepository.existsById(productId)).willReturn(true);
        given(reviewRepository.getAverageRatingByProductId(productId)).willReturn(4.6666);
        given(reviewRepository.countByProductIdAndApprovedTrue(productId)).willReturn(3L);

        ReviewSummaryResponse summary = reviewService.getReviewSummary(productId);

        assertThat(summary).isNotNull();
        assertThat(summary.productId()).isEqualTo(productId);
        assertThat(summary.averageRating()).isEqualTo(4.7);
        assertThat(summary.totalReviews()).isEqualTo(3L);
    }

    @Test
    @DisplayName("Should approve review as admin")
    void approveReview_Success() {
        UUID reviewId = sampleReview.getId();
        given(reviewRepository.findById(reviewId)).willReturn(Optional.of(sampleReview));

        AdminReviewResponse response = reviewService.approveReview(reviewId);

        assertThat(response).isNotNull();
        assertThat(response.approved()).isTrue();
    }
}
