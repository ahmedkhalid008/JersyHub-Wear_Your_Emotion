# JerseyHub Product Catalog, Categories & Inventory Specification

## 1. Overview

This document specifies the technical architecture, domain models, category hierarchy rules, variant stock strategies, image metadata management, search/filter capabilities, and REST API contracts for the **JerseyHub** product domain.

---

## 2. Category Hierarchy & Rules

### Structure
Categories are organized as a hierarchical tree with self-referencing `parent_id`.
* Root categories have `parent_id = NULL`.
* Child categories link to their parent `parent_id`.

### Integrity Constraints
1. **Slug Uniqueness & Normalization**: Category slugs are lowercase, URL-safe, and unique across the application.
2. **Self-Parenting Prevention**: A category cannot be set as its own parent (`parentId != category.id`).
3. **Circular Hierarchy Prevention**: Any update to a category parent validates that the proposed parent is not a descendant of the category being updated.
4. **Soft Deactivation**: Deactivating a category hides it from the public category tree without deleting its child categories or linked products.

---

## 3. Product Model & Jersey Attributes

The `Product` model captures sports/football jersey catalog data:
* **Jersey Attributes**:
  * `brand`: Manufacturer (e.g. Adidas, Nike, Puma).
  * `team`: Football club or national team (e.g. Real Madrid, Barcelona, Argentina).
  * `league`: Competition league (e.g. La Liga, Premier League, UEFA Champions League).
  * `country`: Country of team/league (e.g. Spain, England, International).
  * `season`: Kit season year (e.g. `2025/26`).
  * `jerseyType`: `HOME`, `AWAY`, `THIRD`, `TRAINING`, `SPECIAL_EDITION`.
  * `authenticity`: `AUTHENTIC` (Player Version) vs. `REPLICA` (Fan Version).
  * `material`: Material composition (e.g. 100% Recycled Polyester).
  * `basePrice`: Base currency price (`NUMERIC(10, 2)` / `BigDecimal`).
  * `featured`: Highlight flag for homepage/hero placement.
  * `active`: Soft status flag hiding inactive items from public search.

---

## 4. Product Variants & Inventory Strategy

### Variant Structure
`ProductVariant` represents purchasable SKU units tied to specific jersey sizes (`XS`, `S`, `M`, `L`, `XL`, `XXL`).
* **Uniqueness Constraints**:
  * Globally unique SKU (`sku`).
  * Unique `(product_id, size)` combination per product.

### Inventory Transaction Audit Log
Stock quantities cannot be edited arbitrarily without an audit entry.
1. Stock adjustments invoke `InventoryService.adjustStock(...)`.
2. Checks that `newStock = currentStock + quantityChange >= 0` (prevents negative stock).
3. Updates `ProductVariant.stockQuantity`.
4. Saves an `InventoryTransaction` record with `quantityChange`, `transactionType` (`RESTOCK`, `SALE`, `RETURN`, `ADJUSTMENT`, `DAMAGE`), and audit notes.

### Stock Availability Status
Public APIs expose a derived stock status without revealing raw inventory transactions:
* `IN_STOCK`: Available stock quantity >= 10.
* `LOW_STOCK`: Available stock quantity between 1 and 9.
* `OUT_OF_STOCK`: Available stock quantity = 0.

---

## 5. Image Architecture

* Product images store Cloudinary image metadata (`image_url`, `public_id`, `alt_text`, `display_order`, `is_primary`).
* Binary image blobs are **never** stored in PostgreSQL.
* Only one primary image (`is_primary = true`) is designated per product.

---

## 6. Search, Filter & Whitelist Sorting Architecture

### PostgreSQL Criteria Specifications
Product catalog queries use dynamic Spring Data JPA `Specification<Product>`:
* **Search**: Case-insensitive substring matching (`ILIKE %search%`) across `name`, `team`, `brand`, and `league`.
* **Filters**: Category slug, brand, team, league, season, jersey type, authenticity, featured flag, and min/max price range.
* **Whitelist Sorting**: Maps user parameters to validated database fields to prevent SQL/JPA property injection:
  * `priceAsc` -> `basePrice ASC`
  * `priceDesc` -> `basePrice DESC`
  * `nameAsc` -> `name ASC`
  * `nameDesc` -> `name DESC`
  * `newest` -> `createdAt DESC` (default)
* **Bounded Pagination**: All public and admin list endpoints require pagination via `PageResponse<T>`. Maximum allowed page size is capped at 100.

---

## 7. API Summary

### Public Endpoints
* `GET /api/v1/categories` — Get active category hierarchy tree
* `GET /api/v1/categories/{id}` — Get active category by ID
* `GET /api/v1/categories/slug/{slug}` — Get active category by slug
* `GET /api/v1/products` — Browse, search, filter active product catalog
* `GET /api/v1/products/{id}` — Get active product details by ID
* `GET /api/v1/products/slug/{slug}` — Get active product details by slug

### Admin Endpoints (`ROLE_ADMIN`)
* `POST /api/v1/admin/categories` — Create category
* `PUT /api/v1/admin/categories/{id}` — Update category
* `PATCH /api/v1/admin/categories/{id}/status` — Activate/deactivate category
* `GET /api/v1/admin/categories` — List all categories
* `GET /api/v1/admin/products` — List all products
* `POST /api/v1/admin/products` — Create product
* `PUT /api/v1/admin/products/{id}` — Update product
* `PATCH /api/v1/admin/products/{id}/status` — Activate/deactivate product
* `PUT /api/v1/admin/products/{id}/categories` — Assign categories to product
* `POST /api/v1/admin/products/{productId}/variants` — Create product variant
* `PUT /api/v1/admin/products/{productId}/variants/{variantId}` — Update variant
* `PATCH /api/v1/admin/products/{productId}/variants/{variantId}/status` — Activate/deactivate variant
* `POST /api/v1/admin/products/{productId}/images` — Add product image metadata
* `PUT /api/v1/admin/products/{productId}/images/{imageId}` — Update image metadata
* `DELETE /api/v1/admin/products/{productId}/images/{imageId}` — Delete image metadata
* `PATCH /api/v1/admin/products/{productId}/images/{imageId}/primary` — Set primary image
* `PATCH /api/v1/admin/products/{productId}/images/reorder` — Reorder display order
* `POST /api/v1/admin/inventory/adjust` — Adjust variant stock quantity
* `GET /api/v1/admin/inventory/{productVariantId}/transactions` — Get inventory transaction audit log
