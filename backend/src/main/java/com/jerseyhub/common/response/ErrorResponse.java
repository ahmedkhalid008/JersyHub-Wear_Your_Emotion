package com.jerseyhub.common.response;

import java.time.Instant;
import java.util.List;

public record ErrorResponse(
    boolean success,
    String message,
    String errorCode,
    Instant timestamp,
    List<String> errors
) {
    public static ErrorResponse of(String message, String errorCode) {
        return new ErrorResponse(false, message, errorCode, Instant.now(), null);
    }

    public static ErrorResponse of(String message, String errorCode, List<String> errors) {
        return new ErrorResponse(false, message, errorCode, Instant.now(), errors);
    }
}
