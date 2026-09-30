# JerseyHub Architecture Specification Document

## 1. Executive Summary

JerseyHub is designed as a production-grade e-commerce platform for football/sports jerseys using a **Modular Monolith** architecture. This document details the architectural decisions, domain module boundaries, technical constraints, security posture, database infrastructure, auditing mechanisms, authentication flows, and product catalog management established across **Phase 0 through Phase 4**.

---

## 2. Architectural Paradigm: Modular Monolith

### Why Modular Monolith over Microservices?
1. **Low Operational Overhead**: Avoids complex distributed transactions, saga orchestration, cross-network latencies, and service mesh management.
2. **Strict Domain Encapsulation**: Modules communicate via cleanly defined Java interface contracts or internal domain events rather than direct database table coupling.
3. **Transactional Integrity**: Critical checkout, payment, and inventory operations utilize local ACID database transactions.
4. **Future Scalability**: If a domain module (e.g., payment or inventory) experiences extreme traffic in the future, its clear package boundaries allow it to be easily extracted into a standalone microservice.

---

## 3. Package & Module Blueprint

The Spring Boot backend (`com.jerseyhub`) is partitioned into isolated domain packages:

```
com.jerseyhub
├── JerseyhubApplication.java
├── auth/            # Authentication, JWT tokens, refresh token rotation, SecurityContext
│   ├── controller/  # AuthController (/api/v1/auth/register, /login, /refresh, /me, /logout)
│   ├── dto/         # RegisterRequest, LoginRequest, RefreshTokenRequest, AuthResponse, UserResponse
│   ├── security/    # JwtTokenProvider, JwtAuthenticationFilter, CustomUserDetailsService, UserPrincipal
│   ├── service/     # AuthService
│   └── RefreshToken.java & RefreshTokenRepository.java
├── user/            # Customer profile, shipping addresses, user settings
├── category/        # Category hierarchy management, active tree browsing
│   ├── controller/  # CategoryPublicController & CategoryAdminController
│   ├── dto/         # CategoryCreateRequest, CategoryUpdateRequest, CategoryResponse
│   └── service/     # CategoryService
├── product/         # Products, jersey attributes, variants, image metadata, search/filtering
│   ├── controller/  # ProductPublicController, ProductAdminController, ProductVariantAdminController, ProductImageAdminController
│   ├── dto/         # ProductCreateRequest, ProductDetailResponse, ProductSummaryResponse, Variant DTOs, Image DTOs
│   ├── service/     # ProductService, ProductVariantService, ProductImageService
│   └── ProductSpecification.java & ProductSortUtils.java
├── inventory/       # Stock tracking, transactional adjustments, transaction history log
│   ├── controller/  # InventoryAdminController
│   ├── dto/         # InventoryAdjustmentRequest, InventoryTransactionResponse
│   └── service/     # InventoryService
├── cart/            # Customer shopping cart management & cart persistence
├── order/           # Order placement, order items, status workflow, invoices
├── payment/         # SSLCommerz gateway integration, payment verification IPN
├── review/          # Ratings, customer reviews, moderation
├── wishlist/        # Customer saved favorite jerseys
├── coupon/          # Discount codes, promotional rules, validation logic
├── admin/           # Administrative management APIs
└── common/          # Cross-cutting infrastructure:
    ├── config/      # SecurityConfig, CorsConfig, OpenApiConfig, JpaAuditingConfig
    ├── entity/      # BaseEntity (@MappedSuperclass with UUID & UTC auditing)
    ├── exception/   # GlobalExceptionHandler, ErrorCode, Custom Exceptions
    ├── response/    # ApiResponse record, ErrorResponse record, PageResponse record
    └── controller/  # HealthController (/api/v1/health)
```

---

## 4. API Design Standards & JSON Envelopes

### REST Conventions
* Endpoint prefix for customer APIs: `/api/v1/...`
* Endpoint prefix for admin APIs: `/api/v1/admin/...`

### Success Response Envelope
All successful HTTP responses (`200 OK`, `201 Created`) return a standardized JSON structure:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... },
  "timestamp": "2026-08-08T13:50:00Z"
}
```

### Paginated Response Envelope (`PageResponse<T>`)
List endpoints requiring pagination return a standardized page model inside the `data` wrapper:
```json
{
  "success": true,
  "message": "List retrieved successfully",
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5,
    "first": true,
    "last": false
  },
  "timestamp": "2026-08-08T13:50:00Z"
}
```

### Error Response Envelope
All HTTP errors (`400`, `401`, `403`, `404`, `500`) return a secure, standardized error payload without revealing internal stack traces:
```json
{
  "success": false,
  "message": "Human readable error description",
  "errorCode": "ERR_RESOURCE_NOT_FOUND",
  "timestamp": "2026-08-08T13:50:00Z",
  "errors": ["Optional list of field validation errors"]
}
```

---

## 5. Persistence & Database Conventions

### 1. Identifier Strategy (UUID)
* All persistent domain entities use `java.util.UUID` as primary keys (`@GeneratedValue(strategy = GenerationType.UUID)`).

### 2. Auditing Strategy & UTC Timestamps
* Enabled via Spring Data JPA `@EnableJpaAuditing` and custom UTC `DateTimeProvider`.
* Base mapped superclass `BaseEntity` provides automatically managed `createdAt` (`Instant`, non-updatable) and `updatedAt` (`Instant`) fields.
* All server-side timestamps are strictly stored and retrieved in **UTC** (`java.time.Instant`).

### 3. Flyway Migration Strategy
* Relational database engine: **PostgreSQL 16**.
* DDL auto-generation disabled (`spring.jpa.hibernate.ddl-auto=validate`).
* Schema changes managed via Flyway migration scripts (`src/main/resources/db/migration/`).

---

## 6. Product Catalog, Inventory & Search Architecture

### 1. Product Search, Filtering & Whitelist Sorting
* Dynamic search and multi-attribute filtering built with PostgreSQL Spring Data JPA `Specification<Product>`.
* Multi-field search checks product `name`, `team`, `brand`, and `league` via case-insensitive `ILIKE` patterns.
* Whitelist sorting maps user keys (`priceAsc`, `priceDesc`, `newest`, `nameAsc`, `nameDesc`) to validated database columns to prevent SQL/JPA property injection attacks.

### 2. Inventory Adjustment & Audit Log
* Stock adjustments invoke `@Transactional InventoryService.adjustStock(...)`.
* Prevents stock quantity from becoming negative (`stockQuantity < 0`).
* Logs an `InventoryTransaction` record tracking quantity changes, transaction type (`RESTOCK`, `SALE`, `RETURN`, `ADJUSTMENT`, `DAMAGE`), and notes.

---

## 7. Security Architecture & Authentication

### 1. Stateless Security & Role Boundaries
* CSRF disabled for stateless REST API, session management set to `SessionCreationPolicy.STATELESS`.
* JWT Access Tokens (15 minutes) + Refresh Tokens (7 days) with SHA-256 token hashing and rotation.
* Role-based authorization enforces `ROLE_ADMIN` on all `/api/v1/admin/**` endpoints. Public GET catalog endpoints are accessible to anonymous users.

---

## 8. Testing Strategy

1. **Unit Testing**:
   - **Backend**: JUnit 5, Mockito, and Spring Security Test. Run via `./mvnw clean test`.
   - **Frontend**: Vitest and React Testing Library. Run via `npm test`.
2. **Integration Testing (Testcontainers)**:
   - Automated integration tests spin up an ephemeral PostgreSQL 16 container via Testcontainers (`@Testcontainers`, `@ServiceConnection`).
