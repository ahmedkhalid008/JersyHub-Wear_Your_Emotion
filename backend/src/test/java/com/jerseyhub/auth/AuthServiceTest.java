package com.jerseyhub.auth;

import com.jerseyhub.auth.dto.AuthResponse;
import com.jerseyhub.auth.dto.LoginRequest;
import com.jerseyhub.auth.dto.RefreshTokenRequest;
import com.jerseyhub.auth.dto.RegisterRequest;
import com.jerseyhub.auth.dto.UserResponse;
import com.jerseyhub.auth.security.JwtTokenProvider;
import com.jerseyhub.auth.service.AuthService;
import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.user.User;
import com.jerseyhub.user.UserRepository;
import com.jerseyhub.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        sampleUser = new User("John Doe", "john.doe@example.com", "encoded_password", UserRole.CUSTOMER);
        sampleUser.setId(userId);
    }

    @Nested
    @DisplayName("Registration Tests")
    class RegistrationTests {

        @Test
        @DisplayName("Should successfully register customer user with normalized email and BCrypt password")
        void register_Success() {
            RegisterRequest request = new RegisterRequest("John Doe", "  John.Doe@Example.COM ", "Password123!", "01700000000");

            given(userRepository.existsByEmail("john.doe@example.com")).willReturn(false);
            given(passwordEncoder.encode("Password123!")).willReturn("encoded_password");
            given(userRepository.save(any(User.class))).willReturn(sampleUser);

            UserResponse response = authService.register(request);

            assertThat(response).isNotNull();
            assertThat(response.email()).isEqualTo("john.doe@example.com");
            assertThat(response.role()).isEqualTo(UserRole.CUSTOMER);

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertThat(userCaptor.getValue().getEmail()).isEqualTo("john.doe@example.com");
            assertThat(userCaptor.getValue().getRole()).isEqualTo(UserRole.CUSTOMER); // Forced CUSTOMER role
        }

        @Test
        @DisplayName("Should throw BusinessException when registration email is already registered")
        void register_DuplicateEmail_ThrowsException() {
            RegisterRequest request = new RegisterRequest("John Doe", "john.doe@example.com", "Password123!", null);
            given(userRepository.existsByEmail("john.doe@example.com")).willReturn(true);

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Email address is already registered");
        }
    }

    @Nested
    @DisplayName("Login Tests")
    class LoginTests {

        @Test
        @DisplayName("Should successfully login user and return access and refresh tokens")
        void login_Success() {
            LoginRequest request = new LoginRequest("JOHN.DOE@EXAMPLE.COM", "Password123!");

            given(userRepository.findByEmail("john.doe@example.com")).willReturn(Optional.of(sampleUser));
            given(passwordEncoder.matches("Password123!", "encoded_password")).willReturn(true);
            given(tokenProvider.generateAccessToken(sampleUser)).willReturn("mock_access_token");
            given(tokenProvider.generateRawRefreshToken()).willReturn("mock_raw_refresh_token");
            given(tokenProvider.hashToken("mock_raw_refresh_token")).willReturn("mock_token_hash");
            given(tokenProvider.getRefreshTokenExpirationMs()).willReturn(604800000L);
            given(tokenProvider.getAccessTokenExpirationMs()).willReturn(900000L);

            AuthResponse response = authService.login(request);

            assertThat(response).isNotNull();
            assertThat(response.accessToken()).isEqualTo("mock_access_token");
            assertThat(response.refreshToken()).isEqualTo("mock_raw_refresh_token");
            assertThat(response.tokenType()).isEqualTo("Bearer");
            assertThat(response.user().email()).isEqualTo("john.doe@example.com");

            verify(refreshTokenRepository).save(any(RefreshToken.class));
        }

        @Test
        @DisplayName("Should throw generic INVALID_CREDENTIALS exception when user email does not exist")
        void login_NonexistentEmail_ThrowsGenericCredentialsException() {
            LoginRequest request = new LoginRequest("unknown@example.com", "Password123!");
            given(userRepository.findByEmail("unknown@example.com")).willReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessage("Invalid email or password");
        }

        @Test
        @DisplayName("Should throw generic INVALID_CREDENTIALS exception when password does not match")
        void login_IncorrectPassword_ThrowsGenericCredentialsException() {
            LoginRequest request = new LoginRequest("john.doe@example.com", "WrongPassword!");
            given(userRepository.findByEmail("john.doe@example.com")).willReturn(Optional.of(sampleUser));
            given(passwordEncoder.matches("WrongPassword!", "encoded_password")).willReturn(false);

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessage("Invalid email or password");
        }

        @Test
        @DisplayName("Should throw ACCOUNT_DISABLED exception when user account is disabled")
        void login_DisabledAccount_ThrowsException() {
            sampleUser.setEnabled(false);
            LoginRequest request = new LoginRequest("john.doe@example.com", "Password123!");

            given(userRepository.findByEmail("john.doe@example.com")).willReturn(Optional.of(sampleUser));
            given(passwordEncoder.matches("Password123!", "encoded_password")).willReturn(true);

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessage("Account has been disabled");
        }
    }

    @Nested
    @DisplayName("Refresh Token & Rotation Tests")
    class RefreshTokenTests {

        @Test
        @DisplayName("Should successfully refresh tokens and rotate old refresh token")
        void refreshToken_Success() {
            RefreshTokenRequest request = new RefreshTokenRequest("valid_raw_refresh_token");
            RefreshToken storedToken = new RefreshToken(sampleUser, "valid_token_hash", Instant.now().plusSeconds(3600));

            given(tokenProvider.hashToken("valid_raw_refresh_token")).willReturn("valid_token_hash");
            given(refreshTokenRepository.findByTokenHash("valid_token_hash")).willReturn(Optional.of(storedToken));
            given(tokenProvider.generateAccessToken(sampleUser)).willReturn("new_access_token");
            given(tokenProvider.generateRawRefreshToken()).willReturn("new_raw_refresh_token");
            given(tokenProvider.hashToken("new_raw_refresh_token")).willReturn("new_token_hash");

            AuthResponse response = authService.refreshToken(request);

            assertThat(response).isNotNull();
            assertThat(response.accessToken()).isEqualTo("new_access_token");
            assertThat(response.refreshToken()).isEqualTo("new_raw_refresh_token");
            assertThat(storedToken.isRevoked()).isTrue(); // Old token is rotated and revoked
        }

        @Test
        @DisplayName("Should throw INVALID_REFRESH_TOKEN when refresh token is revoked")
        void refreshToken_RevokedToken_ThrowsException() {
            RefreshTokenRequest request = new RefreshTokenRequest("revoked_token");
            RefreshToken storedToken = new RefreshToken(sampleUser, "revoked_hash", Instant.now().plusSeconds(3600));
            storedToken.setRevoked(true);

            given(tokenProvider.hashToken("revoked_token")).willReturn("revoked_hash");
            given(refreshTokenRepository.findByTokenHash("revoked_hash")).willReturn(Optional.of(storedToken));

            assertThatThrownBy(() -> authService.refreshToken(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessage("Refresh token has been revoked");
        }

        @Test
        @DisplayName("Should throw REFRESH_TOKEN_EXPIRED when refresh token is expired")
        void refreshToken_ExpiredToken_ThrowsException() {
            RefreshTokenRequest request = new RefreshTokenRequest("expired_token");
            RefreshToken storedToken = new RefreshToken(sampleUser, "expired_hash", Instant.now().minusSeconds(3600));

            given(tokenProvider.hashToken("expired_token")).willReturn("expired_hash");
            given(refreshTokenRepository.findByTokenHash("expired_hash")).willReturn(Optional.of(storedToken));

            assertThatThrownBy(() -> authService.refreshToken(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessage("Refresh token has expired");
        }
    }

    @Nested
    @DisplayName("Logout Tests")
    class LogoutTests {

        @Test
        @DisplayName("Should revoke matching refresh token on logout")
        void logout_Success() {
            RefreshToken storedToken = new RefreshToken(sampleUser, "token_hash_logout", Instant.now().plusSeconds(3600));

            given(tokenProvider.hashToken("raw_logout_token")).willReturn("token_hash_logout");
            given(refreshTokenRepository.findByTokenHash("token_hash_logout")).willReturn(Optional.of(storedToken));

            authService.logout("raw_logout_token", userId);

            assertThat(storedToken.isRevoked()).isTrue();
            assertThat(storedToken.getRevokedAt()).isNotNull();
            verify(refreshTokenRepository).save(storedToken);
        }
    }
}
