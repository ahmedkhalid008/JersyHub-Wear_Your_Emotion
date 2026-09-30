# JERSEYHUB — E-Commerce Platform for Sports Jerseys

[![Java 21](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot 3.4.2](https://img.shields.io/badge/Spring%20Boot-3.4.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Vite + React](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript%20%2B%20Vite-blue.svg)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg)](https://www.postgresql.org/)
[![Flyway](https://img.shields.io/badge/Migrations-Flyway-red.svg)](https://flywaydb.org/)

**JerseyHub** is a production-grade e-commerce web platform specialized in selling football and sports jerseys. Built using a **Modular Monolith** architecture, the platform guarantees high security, transactional consistency, clear domain separation, and maintainability.

---

## 🏛 Architecture Overview

JerseyHub follows a domain-oriented **Modular Monolith** architecture pattern. The system is split into distinct, decoupled domain modules within a single deployment unit, avoiding microservices complexity while maintaining strict domain encapsulation.

```
jerseyhub/
├── backend/                  # Java 21 & Spring Boot 3.4.2 REST API
│   ├── src/main/java/com/jerseyhub/
│   │   ├── auth/            # Authentication & JWT Management
│   │   ├── user/            # Customer Profiles & Addresses
│   │   ├── product/         # Products & Jersey Variants Catalog
│   │   ├── category/        # Taxonomy & Category Hierarchy
│   │   ├── inventory/       # Stock & Inventory Operations
│   │   ├── cart/            # Shopping Cart & Line Items
│   │   ├── order/           # Order Processing & Fulfillment
│   │   ├── payment/         # SSLCommerz Payment Gateway Integration
│   │   ├── review/          # Ratings & Customer Reviews
│   │   ├── wishlist/        # Customer Wishlists
│   │   ├── coupon/          # Promotional Discounts & Coupons
│   │   ├── admin/           # Administrative Management APIs
│   │   └── common/          # Cross-cutting Response, Security, Exception Handlers
│   ├── src/main/resources/  # application.yml & Flyway DDL Migrations
│   └── pom.xml              # Maven dependencies & build configuration
├── frontend/                 # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/      # UI component library (shadcn/ui style)
│   │   ├── pages/           # Application views (Home, Health, etc.)
│   │   ├── layouts/         # Page layout shells
│   │   ├── hooks/           # TanStack Query custom hooks
│   │   ├── services/        # REST API fetch clients
│   │   ├── stores/          # Zustand global state stores
│   │   ├── types/           # Shared TypeScript interfaces
│   │   ├── utils/           # Helper functions
│   │   ├── routes/          # Client-side routing definitions
│   │   └── lib/             # Utility styling helpers
│   └── package.json
├── docs/                     # Architecture & Setup Documentation
├── docker-compose.yml        # Local PostgreSQL container service
├── .env.example              # Environment variables template
├── .gitignore                # Repository ignore rules (tracks Maven wrapper)
└── README.md                 # Project README
```

---

## 🛠 Technology Stack

### Backend
* **Java 21** (JDK target)
* **Spring Boot 3.4.2**
* **Spring Web** & **Spring Security** (Stateless JWT authentication)
* **Spring Data JPA** & **Hibernate** (`hibernate.ddl-auto=validate`)
* **Flyway 10.x** (Database version control)
* **PostgreSQL 16**
* **SpringDoc OpenAPI 2.8.5** (Swagger UI documentation)
* **JUnit 5**, **Mockito**, & **Spring Boot Test**

### Frontend
* **React 19** & **TypeScript**
* **Vite 6** (Build tool & development server)
* **Tailwind CSS v4** (Styling system)
* **React Router DOM v7** (Client-side routing)
* **TanStack Query v5** (Server state management)
* **Zustand v5** (Client state management)
* **Vitest** & **React Testing Library** (Unit testing framework)

---

## 🚀 Quick Start Guide

### Prerequisites
* **Java 21 JDK**
* **Node.js v20+** & **npm v10+**
* **Docker** & **Docker Compose** (for PostgreSQL)

### 1. Database Infrastructure Setup
Copy `.env.example` to `.env` and start PostgreSQL via Docker Compose:
```bash
cp .env.example .env
docker compose up -d postgres
```

### 2. Backend Startup
Run the Spring Boot application using the committed Maven Wrapper:
```bash
cd backend
./mvnw clean test           # Run backend tests
./mvnw spring-boot:run     # Start backend server on http://localhost:8080
```

* **Swagger UI API Documentation**: `http://localhost:8080/swagger-ui.html`
* **Health Check API Endpoint**: `http://localhost:8080/api/v1/health`

### 3. Frontend Startup
Install Node packages and run Vite development server:
```bash
cd frontend
npm install
npm test                    # Run frontend unit tests with Vitest
npm run dev                 # Start Vite dev server on http://localhost:5173
```

---

## 🔒 API & Response Conventions

All REST API endpoints adhere strictly to standard URL structures and JSON envelopes:

### Endpoint Prefixes
* **Public / Customer Endpoints**: `/api/v1/...`
* **Administrative Endpoints**: `/api/v1/admin/...`

### Success Response Format (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "message": "JerseyHub backend operational",
  "data": {
    "status": "UP",
    "application": "JerseyHub Backend",
    "version": "1.0.0"
  },
  "timestamp": "2026-08-08T13:45:00Z"
}
```

### Error Response Format (`400`, `401`, `403`, `404`, `500`)
```json
{
  "success": false,
  "message": "Resource not found",
  "errorCode": "ERR_RESOURCE_NOT_FOUND",
  "timestamp": "2026-08-08T13:45:00Z",
  "errors": null
}
```

---

## 📜 Phase 0 Verification Status

* [x] **Java 21 Target & Spring Boot 3.4.2** initialized and tested.
* [x] **Maven Wrapper** configured and committed to repo.
* [x] **Standardized REST Response Envelopes & Global Exception Handler** implemented.
* [x] **Flyway Migration Directory** baseline setup (`V1__init.sql`).
* [x] **OpenAPI / Swagger UI** enabled at `/swagger-ui.html`.
* [x] **React + TypeScript + Vite + Tailwind CSS v4** frontend configured with React Router, TanStack Query, and Zustand.
* [x] **Docker Compose** PostgreSQL 16 service configured with health check.
* [x] **JUnit 5 & Vitest unit tests** green and verified.
