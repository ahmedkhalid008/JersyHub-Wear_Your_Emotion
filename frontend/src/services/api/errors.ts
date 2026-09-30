import { ErrorResponse } from '../../types/api';

export class ApiError extends Error {
  public readonly status: number;
  public readonly errorCode?: string;
  public readonly timestamp?: string;
  public readonly errors?: string[];

  constructor(status: number, message: string, errorCode?: string, timestamp?: string, errors?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = errorCode;
    this.timestamp = timestamp;
    this.errors = errors;
  }

  public static fromErrorResponse(status: number, errorData?: Partial<ErrorResponse>): ApiError {
    const defaultMessage = ApiError.getDefaultMessageForStatus(status);
    const message = errorData?.message || defaultMessage;
    return new ApiError(
      status,
      message,
      errorData?.errorCode,
      errorData?.timestamp,
      errorData?.errors
    );
  }

  public static networkError(originalError?: Error): ApiError {
    return new ApiError(
      0,
      originalError?.message || 'Network error. Please check your internet connection or server status.',
      'NETWORK_ERROR'
    );
  }

  public static getDefaultMessageForStatus(status: number): string {
    switch (status) {
      case 400:
        return 'Bad request. Please verify your input parameters.';
      case 401:
        return 'Unauthorized access. Please log in to continue.';
      case 403:
        return 'Forbidden. You do not have permission to perform this action.';
      case 404:
        return 'Requested resource was not found.';
      case 409:
        return 'Conflict error. Resource state conflict occurred.';
      case 422:
        return 'Validation failed. Please check the entered data.';
      case 500:
        return 'An internal server error occurred. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}
