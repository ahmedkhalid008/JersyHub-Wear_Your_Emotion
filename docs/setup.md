# JerseyHub Local Setup & Execution Guide

This document provides complete instructions to set up, build, test, and run **JerseyHub** locally.

---

## Prerequisites

Ensure you have the following installed on your developer machine:

1. **Java JDK 21**
2. **Node.js (v20+) & npm (v10+)**
3. **Docker Desktop & Docker Compose** (for PostgreSQL database & Testcontainers integration tests)
4. **Git**

---

## 1. Environment Configuration

Copy `.env.example` to `.env` in the repository root directory:

```bash
cp .env.example .env
```

The application supports both standard `SPRING_DATASOURCE_*` and component environment variables:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `DB_HOST` / `SPRING_DATASOURCE_URL` | `localhost` | PostgreSQL host address |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `jerseyhub` | PostgreSQL database name |
| `DB_USERNAME` | `postgres` | Database username |
| `DB_PASSWORD` | `postgres` | Database password |
| `PORT` | `8080` | Spring Boot server port |
| `SPRING_PROFILES_ACTIVE` | `dev` | Active Spring profile |
| `JWT_SECRET` | *(256-bit hex)* | JWT signing secret key |

---

## 2. Start PostgreSQL Container

Start the PostgreSQL 16 database service using Docker Compose:

```bash
docker compose up -d postgres
```

Verify the container status:
```bash
docker compose ps
```

---

## 3. Backend Setup & Verification

Navigate to the `backend/` directory:

```bash
cd backend
```

### Build & Run Unit & Integration Tests
Execute the backend test suite (includes Testcontainers PostgreSQL integration test):
```bash
# Windows
.\mvnw.cmd clean test

# Linux/macOS
./mvnw clean test
```

### Start Spring Boot Server
Start the application server:
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux/macOS
./mvnw spring-boot:run
```

* **Swagger UI API Documentation**: `http://localhost:8080/swagger-ui.html`
* **Health Check API Endpoint**: `http://localhost:8080/api/v1/health`

---

## 4. Frontend Setup & Verification

Navigate to the `frontend/` directory:

```bash
cd frontend
```

### Install Dependencies
```bash
npm install
```

### Run Vitest Unit Tests
```bash
npm test
```

### Build Production Bundle
```bash
npm run build
```

### Start Vite Development Server
```bash
npm run dev
```

* Access the web application at: `http://localhost:5173`
