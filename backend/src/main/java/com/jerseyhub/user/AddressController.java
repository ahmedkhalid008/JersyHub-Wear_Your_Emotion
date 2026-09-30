package com.jerseyhub.user;

import com.jerseyhub.auth.security.UserPrincipal;
import com.jerseyhub.common.response.ApiResponse;
import com.jerseyhub.user.dto.AddressRequest;
import com.jerseyhub.user.dto.AddressResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/addresses")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Address", description = "User Address Management APIs")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @PostMapping
    @Operation(summary = "Create a new user address")
    public ResponseEntity<ApiResponse<AddressResponse>> createAddress(
            @Valid @RequestBody AddressRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        AddressResponse response = addressService.createAddress(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Address created successfully", response));
    }

    @GetMapping
    @Operation(summary = "List all addresses for current user")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddresses(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        List<AddressResponse> response = addressService.getAddresses(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Addresses retrieved successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific address by ID")
    public ResponseEntity<ApiResponse<AddressResponse>> getAddress(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        AddressResponse response = addressService.getAddress(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Address retrieved successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing address")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @PathVariable UUID id,
            @Valid @RequestBody AddressRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        AddressResponse response = addressService.updateAddress(currentUser.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an address")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        addressService.deleteAddress(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully"));
    }

    @PatchMapping("/{id}/default")
    @Operation(summary = "Set an address as default")
    public ResponseEntity<ApiResponse<AddressResponse>> setDefaultAddress(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        AddressResponse response = addressService.setDefaultAddress(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Default address updated successfully", response));
    }
}
