package com.jerseyhub.auth.dto;

import com.jerseyhub.user.User;
import com.jerseyhub.user.UserRole;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
    UUID id,
    String name,
    String email,
    String phone,
    UserRole role,
    boolean enabled,
    boolean emailVerified,
    Instant createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole(),
            user.isEnabled(),
            user.isEmailVerified(),
            user.getCreatedAt()
        );
    }
}
