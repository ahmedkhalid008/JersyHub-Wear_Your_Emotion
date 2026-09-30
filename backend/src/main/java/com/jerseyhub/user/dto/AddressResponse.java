package com.jerseyhub.user.dto;

import com.jerseyhub.user.Address;

import java.time.Instant;
import java.util.UUID;

public record AddressResponse(
    UUID id,
    String recipientName,
    String phone,
    String division,
    String district,
    String area,
    String addressLine,
    String postalCode,
    boolean isDefault,
    Instant createdAt,
    Instant updatedAt
) {
    public static AddressResponse from(Address address) {
        return new AddressResponse(
            address.getId(),
            address.getRecipientName(),
            address.getPhone(),
            address.getDivision(),
            address.getDistrict(),
            address.getArea(),
            address.getAddressLine(),
            address.getPostalCode(),
            address.isDefault(),
            address.getCreatedAt(),
            address.getUpdatedAt()
        );
    }
}
