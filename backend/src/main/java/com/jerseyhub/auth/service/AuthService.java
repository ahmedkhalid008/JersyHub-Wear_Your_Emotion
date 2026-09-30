package com.jerseyhub.auth.service;

import com.jerseyhub.auth.RefreshToken;
import com.jerseyhub.auth.RefreshTokenRepository;
import com.jerseyhub.auth.dto.AuthResponse;
import com.jerseyhub.auth.dto.LoginRequest;
import com.jerseyhub.auth.dto.RefreshTokenRequest;
import com.jerseyhub.auth.dto.RegisterRequest;
import com.jerseyhub.auth.dto.UserResponse;
import com.jerseyhub.auth.security.JwtTokenProvider;
import com.jerseyhub.common.exception.BusinessException;
import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.user.User;
import com.jerseyhub.user.UserRepository;
import com.jerseyhub.user.UserRole;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BusinessException("Email address is already registered", ErrorCode.INVALID_REQUEST.getCode());
        }

        String passwordHash = passwordEncoder.encode(request.password());

        // Grant ADMIN role if target admin email, otherwise default to CUSTOMER role
        UserRole initialRole = "04324205191008@uits.edu.bd".equalsIgnoreCase(normalizedEmail) ? UserRole.ADMIN : UserRole.CUSTOMER;
        User user = new User(request.name().trim(), normalizedEmail, passwordHash, initialRole);
        if (request.phone() != null) {
            user.setPhone(request.phone().trim());
        }
        user.setEnabled(true);
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);
        return UserResponse.from(savedUser);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BusinessException("Invalid email or password", ErrorCode.INVALID_CREDENTIALS.getCode()));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessException("Invalid email or password", ErrorCode.INVALID_CREDENTIALS.getCode());
        }

        if (!user.isEnabled()) {
            throw new BusinessException("Account has been disabled", ErrorCode.ACCOUNT_DISABLED.getCode());
        }

        String accessToken = tokenProvider.generateAccessToken(user);
        String rawRefreshToken = tokenProvider.generateRawRefreshToken();
        String tokenHash = tokenProvider.hashToken(rawRefreshToken);

        Instant expiresAt = Instant.now().plusMillis(tokenProvider.getRefreshTokenExpirationMs());
        RefreshToken refreshToken = new RefreshToken(user, tokenHash, expiresAt);
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.of(accessToken, rawRefreshToken, tokenProvider.getAccessTokenExpirationMs(), UserResponse.from(user));
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String tokenHash = tokenProvider.hashToken(request.refreshToken());

        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BusinessException("Invalid refresh token", ErrorCode.INVALID_REFRESH_TOKEN.getCode()));

        if (storedToken.isRevoked()) {
            throw new BusinessException("Refresh token has been revoked", ErrorCode.INVALID_REFRESH_TOKEN.getCode());
        }

        if (storedToken.getExpiresAt().isBefore(Instant.now())) {
            throw new BusinessException("Refresh token has expired", ErrorCode.REFRESH_TOKEN_EXPIRED.getCode());
        }

        User user = storedToken.getUser();
        if (!user.isEnabled()) {
            throw new BusinessException("Account has been disabled", ErrorCode.ACCOUNT_DISABLED.getCode());
        }

        // Revoke old refresh token (Token Rotation)
        storedToken.setRevoked(true);
        storedToken.setRevokedAt(Instant.now());
        refreshTokenRepository.save(storedToken);

        // Issue new token pair
        String newAccessToken = tokenProvider.generateAccessToken(user);
        String newRawRefreshToken = tokenProvider.generateRawRefreshToken();
        String newTokenHash = tokenProvider.hashToken(newRawRefreshToken);

        Instant newExpiresAt = Instant.now().plusMillis(tokenProvider.getRefreshTokenExpirationMs());
        RefreshToken newRefreshToken = new RefreshToken(user, newTokenHash, newExpiresAt);
        refreshTokenRepository.save(newRefreshToken);

        return AuthResponse.of(newAccessToken, newRawRefreshToken, tokenProvider.getAccessTokenExpirationMs(), UserResponse.from(user));
    }

    @Transactional
    public void logout(String rawRefreshToken, UUID userId) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            String tokenHash = tokenProvider.hashToken(rawRefreshToken);
            refreshTokenRepository.findByTokenHash(tokenHash)
                    .ifPresent(token -> {
                        token.setRevoked(true);
                        token.setRevokedAt(Instant.now());
                        refreshTokenRepository.save(token);
                    });
        }
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found"));
        return UserResponse.from(user);
    }

    private String normalizeEmail(String email) {
        return email != null ? email.trim().toLowerCase(Locale.ROOT) : "";
    }
}
