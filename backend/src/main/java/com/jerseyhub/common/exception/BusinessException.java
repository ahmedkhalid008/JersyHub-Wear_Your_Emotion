package com.jerseyhub.common.exception;

public class BusinessException extends RuntimeException {
    private final String errorCode;

    public BusinessException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public BusinessException(String message) {
        super(message);
        this.errorCode = ErrorCode.INVALID_REQUEST.getCode();
    }

    public String getErrorCode() {
        return errorCode;
    }
}
