package com.jerseyhub.auth;

import com.jerseyhub.auth.security.JwtTokenProvider;
import com.jerseyhub.user.User;
import com.jerseyhub.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private User testUser;
    private UUID userId;

    private final String secret = "SecretKeyForJerseyHubJwtAuthenticationSystemMustBeAtLeast256BitsLong!";
    private final long accessTokenExpiration = 900000L; // 15 mins
    private final long refreshTokenExpiration = 604800000L; // 7 days

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider(secret, accessTokenExpiration, refreshTokenExpiration);
        userId = UUID.randomUUID();
        testUser = new User("Jane Doe", "jane.doe@example.com", "hashed_pwd", UserRole.CUSTOMER);
        testUser.setId(userId);
    }

    @Test
    @DisplayName("Should generate valid access token and extract user ID")
    void generateAndValidateAccessToken() {
        String token = tokenProvider.generateAccessToken(testUser);

        assertThat(token).isNotBlank();
        assertThat(tokenProvider.validateToken(token)).isTrue();
        assertThat(tokenProvider.getUserIdFromToken(token)).isEqualTo(userId.toString());
    }

    @Test
    @DisplayName("Should return false when validating malformed or invalid token")
    void validateMalformedToken() {
        assertThat(tokenProvider.validateToken("invalid.jwt.token")).isFalse();
        assertThat(tokenProvider.validateToken("")).isFalse();
        assertThat(tokenProvider.validateToken(null)).isFalse();
    }

    @Test
    @DisplayName("Should return false when validating token signed with different secret key")
    void validateInvalidSignature() {
        JwtTokenProvider otherProvider = new JwtTokenProvider("AnotherDifferentSecretKeyThatIsAtLeast256BitsLongForTesting!", accessTokenExpiration, refreshTokenExpiration);
        String tokenFromOther = otherProvider.generateAccessToken(testUser);

        assertThat(tokenProvider.validateToken(tokenFromOther)).isFalse();
    }

    @Test
    @DisplayName("Should correctly hash refresh token string using SHA-256")
    void hashToken_Success() {
        String rawToken = "my-secret-raw-refresh-token";
        String hash1 = tokenProvider.hashToken(rawToken);
        String hash2 = tokenProvider.hashToken(rawToken);

        assertThat(hash1).isNotBlank().hasSize(64); // SHA-256 hex string is 64 characters
        assertThat(hash1).isEqualTo(hash2);
    }
}
