CREATE INDEX idx_stock_movements_customer_date ON stock_movements_view(customer_id, created_at);
CREATE INDEX idx_stock_movements_search ON stock_movements_view(item_name, customer_display_name);

