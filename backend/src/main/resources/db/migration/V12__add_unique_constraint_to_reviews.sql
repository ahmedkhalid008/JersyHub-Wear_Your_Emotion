-- Enforce one review per user per product
CREATE UNIQUE INDEX uq_reviews_product_user ON reviews(product_id, user_id);
