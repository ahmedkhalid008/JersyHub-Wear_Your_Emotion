-- Inventory Transactions Audit Trail Schema

CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity_change INT NOT NULL,
    transaction_type VARCHAR(30) NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_tx_variant_id ON inventory_transactions(product_variant_id);
