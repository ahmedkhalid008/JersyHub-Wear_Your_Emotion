package com.jerseyhub.admin.dto;

import com.jerseyhub.user.User;
import com.jerseyhub.user.UserRole;

import java.time.Instant;
import java.util.UUID;

public record AdminUserResponse(
        UUID id,
        String name,
        String email,
        String phone,
        UserRole role,
        boolean enabled,
        boolean emailVerified,
        Instant createdAt,
        Instant updatedAt
) {
    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.isEnabled(),
                user.isEmailVerified(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
