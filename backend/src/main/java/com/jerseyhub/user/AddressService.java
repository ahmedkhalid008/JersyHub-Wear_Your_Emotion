package com.jerseyhub.user;

import com.jerseyhub.common.exception.ErrorCode;
import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.user.dto.AddressRequest;
import com.jerseyhub.user.dto.AddressResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> getAddresses(UUID userId) {
        return addressRepository.findByUserId(userId)
                .stream()
                .map(AddressResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AddressResponse getAddress(UUID userId, UUID addressId) {
        Address address = addressRepository.findByUserIdAndId(userId, addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found", ErrorCode.RESOURCE_NOT_FOUND.getCode()));
        return AddressResponse.from(address);
    }

    public AddressResponse createAddress(UUID userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found", ErrorCode.RESOURCE_NOT_FOUND.getCode()));

        List<Address> existingAddresses = addressRepository.findByUserId(userId);
        boolean shouldBeDefault = existingAddresses.isEmpty() || Boolean.TRUE.equals(request.isDefault());

        if (shouldBeDefault && !existingAddresses.isEmpty()) {
            addressRepository.unsetDefaultsByUserId(userId);
        }

        Address address = new Address();
        address.setUser(user);
        address.setRecipientName(request.recipientName());
        address.setPhone(request.phone());
        address.setDivision(request.division());
        address.setDistrict(request.district());
        address.setArea(request.area());
        address.setAddressLine(request.addressLine());
        address.setPostalCode(request.postalCode());
        address.setDefault(shouldBeDefault);

        Address savedAddress = addressRepository.save(address);
        return AddressResponse.from(savedAddress);
    }

    public AddressResponse updateAddress(UUID userId, UUID addressId, AddressRequest request) {
        Address address = addressRepository.findByUserIdAndId(userId, addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found", ErrorCode.RESOURCE_NOT_FOUND.getCode()));

        boolean requestedDefault = Boolean.TRUE.equals(request.isDefault());
        if (requestedDefault) {
            addressRepository.unsetOtherDefaultsByUserId(userId, addressId);
            address.setDefault(true);
        } else if (request.isDefault() != null) {
            address.setDefault(false);
        }

        address.setRecipientName(request.recipientName());
        address.setPhone(request.phone());
        address.setDivision(request.division());
        address.setDistrict(request.district());
        address.setArea(request.area());
        address.setAddressLine(request.addressLine());
        address.setPostalCode(request.postalCode());

        Address savedAddress = addressRepository.save(address);
        return AddressResponse.from(savedAddress);
    }

    public void deleteAddress(UUID userId, UUID addressId) {
        Address address = addressRepository.findByUserIdAndId(userId, addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found", ErrorCode.RESOURCE_NOT_FOUND.getCode()));

        boolean wasDefault = address.isDefault();
        addressRepository.delete(address);

        if (wasDefault) {
            List<Address> remaining = addressRepository.findByUserId(userId);
            if (!remaining.isEmpty()) {
                Address first = remaining.get(0);
                first.setDefault(true);
                addressRepository.save(first);
            }
        }
    }

    public AddressResponse setDefaultAddress(UUID userId, UUID addressId) {
        Address address = addressRepository.findByUserIdAndId(userId, addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found", ErrorCode.RESOURCE_NOT_FOUND.getCode()));

        addressRepository.unsetOtherDefaultsByUserId(userId, addressId);
        address.setDefault(true);
        Address savedAddress = addressRepository.save(address);
        return AddressResponse.from(savedAddress);
    }
}
