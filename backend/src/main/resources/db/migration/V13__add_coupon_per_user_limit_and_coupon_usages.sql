-- Add per_user_limit to coupons table and coupon_code to orders table
ALTER TABLE coupons ADD COLUMN per_user_limit INT DEFAULT 1;

ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50);

-- Create coupon_usages tracking table
CREATE TABLE coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    discount_amount NUMERIC(10, 2) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coupon_usages_coupon_user ON coupon_usages(coupon_id, user_id);
CREATE INDEX idx_coupon_usages_order ON coupon_usages(order_id);
