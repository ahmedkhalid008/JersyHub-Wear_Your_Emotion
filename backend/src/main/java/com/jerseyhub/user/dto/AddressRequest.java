package com.jerseyhub.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddressRequest(
    @NotBlank(message = "Recipient name is required")
    @Size(max = 100, message = "Recipient name cannot exceed 100 characters")
    String recipientName,

    @NotBlank(message = "Phone number is required")
    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    String phone,

    @NotBlank(message = "Division is required")
    @Size(max = 50, message = "Division cannot exceed 50 characters")
    String division,

    @NotBlank(message = "District is required")
    @Size(max = 50, message = "District cannot exceed 50 characters")
    String district,

    @NotBlank(message = "Area is required")
    @Size(max = 50, message = "Area cannot exceed 50 characters")
    String area,

    @NotBlank(message = "Address line is required")
    @Size(max = 255, message = "Address line cannot exceed 255 characters")
    String addressLine,

    @Size(max = 20, message = "Postal code cannot exceed 20 characters")
    String postalCode,

    Boolean isDefault
) {}
