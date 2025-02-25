-- CREATE OR REPLACE FUNCTION record_order_stock_movement()
-- RETURNS TRIGGER AS $$
-- DECLARE
--     item_record RECORD;
--     location_id_to_use UUID;
-- BEGIN
--     -- Check if the order status was changed to 'COMPLETED' and movement is 'OUT'
--     IF NEW.status = 'COMPLETED' AND NEW.status <> OLD.status AND NEW.movement = 'OUT' THEN
--         NEW.fulfilled_at = NOW();

--         -- Loop through each item in the order_items table for this order
--         FOR item_record IN SELECT order_items.item_id, order_items.quantity, order_items.item_location_id
--                            FROM order_items
--                            WHERE order_items.order_id = NEW.order_id
--         LOOP
--             -- Insert a record into stock_movements (record the 'OUT' movement) - **ONLY INSERT**
--             INSERT INTO stock_movements (item_id, location_id, movement_type, quantity, reference_type, reference_id, notes)
--             VALUES (item_record.item_id, item_record.item_location_id, 'OUT', item_record.quantity, 'ORDER_COMPLETION', NEW.order_id, 'Order Completed - Inventory Deduction');
--         END LOOP;
--     END IF;

--     IF NEW.status = 'COMPLETED' AND NEW.status <> OLD.status AND NEW.movement = 'IN' THEN
--         NEW.fulfilled_at = NOW();

--         -- Loop through each item in the order_items table for this order
--         FOR item_record IN SELECT order_items.item_id, order_items.quantity, order_items.item_location_id
--                            FROM order_items
--                            WHERE order_items.order_id = NEW.order_id
--         LOOP
--             -- Insert a record into stock_movements (record the 'IN' movement) - **ONLY INSERT**
--             INSERT INTO stock_movements (item_id, location_id, movement_type, quantity, reference_type, reference_id, notes)
--             VALUES (item_record.item_id, item_record.item_location_id, 'IN', item_record.quantity, 'ORDER_COMPLETION', NEW.order_id, 'Order Completed - Inventory Addition');
--         END LOOP;
--     END IF;

--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE OR REPLACE TRIGGER order_completion_inventory_trigger
-- AFTER UPDATE OF status ON orders
-- FOR EACH ROW
-- EXECUTE FUNCTION record_order_stock_movement();

CREATE OR REPLACE FUNCTION record_order_stock_movement()
RETURNS TRIGGER AS $$
DECLARE
    item_record RECORD;
    movement_type movement_type;
    is_reversal BOOLEAN;
    tx_number INTEGER;
BEGIN
    -- Get the next transaction number for this order
    SELECT COALESCE(COUNT(*), 0) + 1 INTO tx_number
    FROM stock_movements
    WHERE reference_id = NEW.order_id;

    -- Determine if this is a completion or reversal
    IF NEW.status = 'COMPLETED' AND NEW.status <> OLD.status THEN
        NEW.fulfilled_at = NOW();
        movement_type := NEW.movement;
        is_reversal := FALSE;
    ELSIF OLD.status = 'COMPLETED' AND NEW.status <> 'COMPLETED' THEN
        movement_type := CASE WHEN NEW.movement = 'IN' THEN 'OUT' ELSE 'IN' END;
        is_reversal := TRUE;
    ELSE
        RETURN NEW;
    END IF;

    -- Process all items in a single loop
    FOR item_record IN SELECT order_items.item_id, order_items.quantity, order_items.item_location_id
                      FROM order_items
                      WHERE order_items.order_id = NEW.order_id
    LOOP
        INSERT INTO stock_movements (
            item_id, 
            location_id, 
            movement_type, 
            quantity, 
            reference_type, 
            reference_id, 
            notes
        )
        VALUES (
            item_record.item_id,
            item_record.item_location_id,
            movement_type,
            item_record.quantity,
            CASE 
                WHEN is_reversal THEN 'ORDER_REVERSAL'
                ELSE 'ORDER_COMPLETION'
            END,
            NEW.order_id,
            CASE 
                WHEN is_reversal THEN
                    CASE movement_type
                        WHEN 'OUT' THEN format('[TX#%s][REVERSAL] Order Uncompleted - Reversing Previous IN', tx_number)
                        ELSE format('[TX#%s][REVERSAL] Order Uncompleted - Reversing Previous OUT', tx_number)
                    END
                ELSE
                    CASE movement_type
                        WHEN 'OUT' THEN format('[TX#%s] Order Completed - Inventory Deduction', tx_number)
                        ELSE format('[TX#%s] Order Completed - Inventory Addition', tx_number)
                    END
            END
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER order_completion_inventory_trigger
BEFORE UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION record_order_stock_movement();