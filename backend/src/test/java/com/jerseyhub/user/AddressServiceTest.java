package com.jerseyhub.user;

import com.jerseyhub.common.exception.ResourceNotFoundException;
import com.jerseyhub.user.dto.AddressRequest;
import com.jerseyhub.user.dto.AddressResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AddressServiceTest {

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AddressService addressService;

    private UUID userId;
    private User sampleUser;
    private Address sampleAddress;
    private UUID addressId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        sampleUser = new User();
        sampleUser.setId(userId);
        sampleUser.setName("John Doe");

        addressId = UUID.randomUUID();
        sampleAddress = new Address();
        sampleAddress.setId(addressId);
        sampleAddress.setUser(sampleUser);
        sampleAddress.setRecipientName("John Doe");
        sampleAddress.setPhone("01700000000");
        sampleAddress.setDivision("Dhaka");
        sampleAddress.setDistrict("Dhaka");
        sampleAddress.setArea("Dhanmondi");
        sampleAddress.setAddressLine("House 12, Road 5");
        sampleAddress.setPostalCode("1205");
        sampleAddress.setDefault(true);
    }

    @Test
    @DisplayName("Should create first address as default automatically")
    void createAddress_FirstAddress_IsDefault() {
        AddressRequest request = new AddressRequest(
                "John Doe", "01700000000", "Dhaka", "Dhaka", "Dhanmondi", "House 12, Road 5", "1205", false
        );

        given(userRepository.findById(userId)).willReturn(Optional.of(sampleUser));
        given(addressRepository.findByUserId(userId)).willReturn(Collections.emptyList());
        given(addressRepository.save(any(Address.class))).willAnswer(invocation -> {
            Address saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        AddressResponse response = addressService.createAddress(userId, request);

        assertThat(response).isNotNull();
        assertThat(response.recipientName()).isEqualTo("John Doe");
        assertThat(response.isDefault()).isTrue();
    }

    @Test
    @DisplayName("Should list user's addresses")
    void getAddresses_Success() {
        given(addressRepository.findByUserId(userId)).willReturn(List.of(sampleAddress));

        List<AddressResponse> responses = addressService.getAddresses(userId);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).id()).isEqualTo(addressId);
    }

    @Test
    @DisplayName("Should get specific address by ID")
    void getAddress_Success() {
        given(addressRepository.findByUserIdAndId(userId, addressId)).willReturn(Optional.of(sampleAddress));

        AddressResponse response = addressService.getAddress(userId, addressId);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(addressId);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when address is not found or belongs to another user (IDOR protection)")
    void getAddress_NotFound_Or_IDOR() {
        UUID randomId = UUID.randomUUID();
        given(addressRepository.findByUserIdAndId(userId, randomId)).willReturn(Optional.empty());

        assertThatThrownBy(() -> addressService.getAddress(userId, randomId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Address not found");
    }

    @Test
    @DisplayName("Should update address details and handle default switching")
    void updateAddress_Success() {
        AddressRequest request = new AddressRequest(
                "Jane Doe", "01800000000", "Dhaka", "Dhaka", "Gulshan", "House 99, Road 11", "1212", true
        );

        given(addressRepository.findByUserIdAndId(userId, addressId)).willReturn(Optional.of(sampleAddress));
        given(addressRepository.save(any(Address.class))).willAnswer(invocation -> invocation.getArgument(0));

        AddressResponse response = addressService.updateAddress(userId, addressId, request);

        verify(addressRepository).unsetOtherDefaultsByUserId(userId, addressId);
        assertThat(response.recipientName()).isEqualTo("Jane Doe");
        assertThat(response.isDefault()).isTrue();
    }

    @Test
    @DisplayName("Should set specific address as default")
    void setDefaultAddress_Success() {
        sampleAddress.setDefault(false);
        given(addressRepository.findByUserIdAndId(userId, addressId)).willReturn(Optional.of(sampleAddress));
        given(addressRepository.save(any(Address.class))).willAnswer(invocation -> invocation.getArgument(0));

        AddressResponse response = addressService.setDefaultAddress(userId, addressId);

        verify(addressRepository).unsetOtherDefaultsByUserId(userId, addressId);
        assertThat(response.isDefault()).isTrue();
    }

    @Test
    @DisplayName("Should delete address successfully")
    void deleteAddress_Success() {
        sampleAddress.setDefault(false);
        given(addressRepository.findByUserIdAndId(userId, addressId)).willReturn(Optional.of(sampleAddress));

        addressService.deleteAddress(userId, addressId);

        verify(addressRepository).delete(sampleAddress);
    }

    @Test
    @DisplayName("Should promote another remaining address to default when default address is deleted")
    void deleteAddress_DefaultAddress_PromotesRemaining() {
        sampleAddress.setDefault(true);
        Address remainingAddress = new Address();
        remainingAddress.setId(UUID.randomUUID());
        remainingAddress.setUser(sampleUser);
        remainingAddress.setDefault(false);

        given(addressRepository.findByUserIdAndId(userId, addressId)).willReturn(Optional.of(sampleAddress));
        given(addressRepository.findByUserId(userId)).willReturn(List.of(remainingAddress));

        addressService.deleteAddress(userId, addressId);

        verify(addressRepository).delete(sampleAddress);
        assertThat(remainingAddress.isDefault()).isTrue();
        verify(addressRepository).save(remainingAddress);
    }
}
