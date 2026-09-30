# JerseyHub Authentication & Security Specification

## 1. Overview

JerseyHub implements a stateless, token-based authentication and authorization infrastructure using Spring Security 6, BCrypt password hashing, short-lived JWT access tokens, and persisted refresh tokens with automatic token rotation.

---

## 2. Authentication Flow Diagrams

### Registration Flow
```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Controller as AuthController
    participant Service as AuthService
    participant Encoder as BCryptPasswordEncoder
    participant DB as PostgreSQL DB

    Client->>Controller: POST /api/v1/auth/register (name, email, password, phone)
    Controller->>Service: register(RegisterRequest)
    Service->>Service: Normalize email (trim & lowercase)
    Service->>DB: Check if email exists
    DB-->>Service: false
    Service->>Encoder: encode(password)
    Encoder-->>Service: BCrypt Hash
    Service->>DB: Save User (role=CUSTOMER, enabled=true, emailVerified=false)
    DB-->>Service: Saved User Entity
    Service-->>Controller: UserResponse
    Controller-->>Client: 201 Created (ApiResponse<UserResponse>)
```

### Login & Token Issuance Flow
```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Controller as AuthController
    participant Service as AuthService
    participant JWT as JwtTokenProvider
    participant DB as PostgreSQL DB

    Client->>Controller: POST /api/v1/auth/login (email, password)
    Controller->>Service: login(LoginRequest)
    Service->>Service: Normalize email
    Service->>DB: Find User by email
    DB-->>Service: User Entity
    Service->>Service: Verify BCrypt password & enabled status
    Service->>JWT: generateAccessToken(user)
    JWT-->>Service: JWT Access Token (15 mins)
    Service->>JWT: generateRawRefreshToken() & hashToken()
    JWT-->>Service: Raw Refresh Token & SHA-256 Hash
    Service->>DB: Save RefreshToken (hash, expires_at=7 days, revoked=false)
    DB-->>Service: Saved RefreshToken
    Service-->>Controller: AuthResponse (accessToken, refreshToken, user)
    Controller-->>Client: 200 OK (ApiResponse<AuthResponse>)
```

### Refresh Token Rotation Flow
```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Controller as AuthController
    participant Service as AuthService
    participant JWT as JwtTokenProvider
    participant DB as PostgreSQL DB

    Client->>Controller: POST /api/v1/auth/refresh (refreshToken)
    Controller->>Service: refreshToken(RefreshTokenRequest)
    Service->>JWT: hashToken(refreshToken)
    JWT-->>Service: SHA-256 Hash
    Service->>DB: Find RefreshToken by hash
    DB-->>Service: Stored RefreshToken
    Service->>Service: Validate not revoked, not expired, user enabled
    Service->>Service: Revoke old refresh token (revoked=true)
    Service->>DB: Save updated old RefreshToken
    Service->>JWT: Generate new Access Token & new Refresh Token
    Service->>DB: Save new RefreshToken (hash, expires_at)
    Service-->>Controller: AuthResponse (new accessToken, new refreshToken)
    Controller-->>Client: 200 OK (ApiResponse<AuthResponse>)
```

---

## 3. JWT Claims Structure

Access tokens are signed using HS256 HMAC key derived from `JWT_SECRET`.

### Claims Payload
```json
{
  "sub": "b3e94a80-7c2d-4e9b-9c12-8f67e4112345",
  "userId": "b3e94a80-7c2d-4e9b-9c12-8f67e4112345",
  "email": "john.doe@example.com",
  "role": "CUSTOMER",
  "iat": 1770559200,
  "exp": 1770560100
}
```

* Sensitive information (passwords, hashes, address details) is strictly omitted from claims.

---

## 4. Endpoints Summary

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/register` | `POST` | Public | Registers a new CUSTOMER account |
| `/api/v1/auth/login` | `POST` | Public | Authenticates credentials and returns token pair |
| `/api/v1/auth/refresh` | `POST` | Public | Rotates refresh token and returns new token pair |
| `/api/v1/auth/me` | `GET` | Protected | Returns current authenticated user profile |
| `/api/v1/auth/logout` | `POST` | Protected | Revokes active refresh token |

---

## 5. Role-Based Access Control (RBAC)

* `ROLE_CUSTOMER`: Granted to all registered users.
* `ROLE_ADMIN`: Granted to administrative users. Admin accounts are managed through controlled administrative processes, not public registration.
