# JerseyHub Backend — Production Deployment & Hardening Guide

This document describes the environment configuration, build procedure, runtime parameters, database migration behavior, and security guidelines for deploying the **JerseyHub Backend** (`com.jerseyhub:backend`) in a production environment.

---

## 1. Prerequisites
- **Java Runtime**: OpenJDK 21 or Java 23 target environment.
- **Database**: PostgreSQL 16 server.
- **Port**: 8080 (or specified via `PORT` environment variable).

---

## 2. Environment Variables Configuration

Copy `src/main/resources/application-example.yml` as a reference. Ensure the following environment variables are set before starting the application:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `prod` |
| `PORT` | HTTP server port | `8080` |
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC connection URL | `jdbc:postgresql://postgres.example.com:5432/jerseyhub_prod` |
| `SPRING_DATASOURCE_USERNAME` | PostgreSQL database user | `jerseyhub_user` |
| `SPRING_DATASOURCE_PASSWORD` | PostgreSQL database password | `[SECURE_DB_PASSWORD]` |
| `DB_POOL_MAX` | HikariCP maximum connection pool size | `20` |
| `DB_POOL_MIN_IDLE` | HikariCP minimum idle connections | `5` |
| `JWT_SECRET` | 256-bit (64 hex char) secret for signing JWTs | `[SECURE_JWT_SECRET]` |
| `JWT_ACCESS_TOKEN_EXPIRATION` | Access token lifespan in milliseconds | `900000` (15 mins) |
| `JWT_REFRESH_TOKEN_EXPIRATION` | Refresh token lifespan in milliseconds | `604800000` (7 days) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed origins | `https://jerseyhub.com,https://www.jerseyhub.com` |
| `SSLCOMMERZ_STORE_ID` | Production SSLCommerz Store ID | `jerseyhub_prod_store` |
| `SSLCOMMERZ_STORE_PASSWORD` | Production SSLCommerz Store Password | `[SECURE_SSLCOMMERZ_PASSWORD]` |
| `SSLCOMMERZ_IS_SANDBOX` | Toggle live SSLCommerz gateway | `false` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary storage account name | `jerseyhub_prod` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `1234567890` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `[SECURE_CLOUDINARY_SECRET]` |
| `SWAGGER_ENABLED` | Toggle OpenAPI docs in production | `false` |

---

## 3. Database Schema & Flyway Migration Behavior
- **Schema Source of Truth**: Flyway SQL scripts under `classpath:db/migration` (`V1__init.sql` through `V13__add_coupon_per_user_limit_and_coupon_usages.sql`).
- **DDL Validation**: Production profile enforces `spring.jpa.hibernate.ddl-auto: validate` so Hibernate validates table structures without modifying schema dynamically.
- **Automated Migration**: Flyway runs on application startup and applies pending migrations automatically.

---

## 4. Production Packaging & Build Commands

### Build Executable JAR
```bash
cd M:\Jersyhub\backend
.\mvnw.cmd clean package
```

This compiles the module, executes unit and integration tests, and generates the standalone executable JAR:
`target/backend-0.0.1-SNAPSHOT.jar`

---

## 5. Production Execution Command

```bash
export SPRING_PROFILES_ACTIVE=prod
export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/jerseyhub"
export SPRING_DATASOURCE_USERNAME="postgres"
export SPRING_DATASOURCE_PASSWORD="[SECURE_PASSWORD]"
export JWT_SECRET="[SECURE_64_HEX_CHAR_KEY]"
export CORS_ALLOWED_ORIGINS="https://jerseyhub.com"

java -jar target/backend-0.0.1-SNAPSHOT.jar
```

---

## 6. Security Hardening Summary
1. **Stateless JWT Security**: BCrypt adaptive password hashing (`strength = 10`), 15-minute access token lifespan, stateless session policy.
2. **HTTP Security Headers**: Frame protection (`X-Frame-Options: SAMEORIGIN`), Content-Type sniffing prevention (`nosniff`), Referrer Policy (`STRICT_ORIGIN_WHEN_CROSS_ORIGIN`).
3. **CORS Isolation**: Explicit allowed origin mapping configured via `CORS_ALLOWED_ORIGINS`.
4. **Pessimistic Concurrency Safety**: Row-level locking on inventory stock (`findAllByIdWithLock`) and coupon redemptions (`findByCodeWithLock`) prevents race conditions.
5. **No Secret Leakage**: Passwords, JWT secrets, and tokens are excluded from logs and generic error responses.
