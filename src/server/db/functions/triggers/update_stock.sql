CREATE OR REPLACE FUNCTION update_item_stock_on_movement()
RETURNS TRIGGER AS $$
DECLARE
    current_stock_quantity INTEGER;
BEGIN
    -- Determine current stock quantity (or 0 if no stock record yet)
    SELECT current_quantity INTO current_stock_quantity
    FROM item_stock
    WHERE item_id = NEW.item_id AND location_id = NEW.location_id;

    IF NOT FOUND THEN
        current_stock_quantity := 0;
    END IF;

    -- Update item_stock based on movement_type
    IF NEW.movement_type = 'IN' THEN
        UPDATE item_stock
        SET current_quantity = current_quantity + NEW.quantity,
            last_movement_id = NEW.movement_id,
            last_updated = NOW()
        WHERE item_id = NEW.item_id AND location_id = NEW.location_id;
        
        INSERT INTO item_stock (item_id, location_id, current_quantity, last_movement_id, last_updated)
        SELECT NEW.item_id, NEW.location_id, NEW.quantity, NEW.movement_id, NOW()
        WHERE NOT EXISTS (SELECT 1 FROM item_stock WHERE item_id = NEW.item_id AND location_id = NEW.location_id);

    ELSIF NEW.movement_type = 'OUT' THEN
        -- Check for sufficient stock BEFORE deducting
        IF current_stock_quantity >= NEW.quantity THEN
            UPDATE item_stock
            SET current_quantity = current_stock_quantity - NEW.quantity,
                last_movement_id = NEW.movement_id,
                last_updated = NOW()
            WHERE item_id = NEW.item_id AND location_id = NEW.location_id;
        ELSE
            RAISE EXCEPTION 'Insufficient stock for item % at location % for movement %', NEW.item_id, NEW.location_id, NEW.movement_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER stock_movement_item_stock_trigger
AFTER INSERT ON stock_movements
FOR EACH ROW
EXECUTE FUNCTION update_item_stock_on_movement();