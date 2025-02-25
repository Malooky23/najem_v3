-- V1
-- CREATE OR REPLACE FUNCTION update_inventory_on_order_completion()
-- RETURNS TRIGGER AS $$
-- DECLARE
--     order_movement_type movement_type;
--     item_record RECORD;
--     location_id_to_use UUID; -- Variable to store the location ID
-- BEGIN
--     -- Check if the order status was changed to 'COMPLETED' and movement is 'OUT'
--     IF NEW.status = 'COMPLETED' AND NEW.status <> OLD.status AND NEW.movement = 'OUT' THEN

--         -- Get the order movement type
--         order_movement_type := NEW.movement;

--         -- Determine the location to deduct stock from.
--         --  **IMPORTANT:  Currently, your `orders` table doesn't explicitly store the location from which items are fulfilled.**
--         --  **You need to decide how to determine the `locationId` for inventory deduction.**
--         --  **Options:**
--         --  1.  Assume a default location for all orders.** (Simplest for now - we'll use this for the example, but NOT recommended for real-world scenarios).
--         --  2.  Add a `locationId` column to the `orders` table (linking to `locations`). **(Recommended)**
--         --  3.  Derive location from the order items or customer information. **(More complex, depends on your business logic)**

--         -- **For this example, assuming a DEFAULT LOCATION (Option 1 - NOT RECOMMENDED for production).**
--         -- **Replace 'your_default_location_uuid' with the actual UUID of your default location in the `locations` table.**
--         location_id_to_use := 'your_default_location_uuid';  -- *** REPLACE THIS WITH YOUR ACTUAL DEFAULT LOCATION UUID ***


--         -- Loop through each item in the order_items table for this order
--         FOR item_record IN SELECT order_items.item_id, order_items.quantity
--                            FROM order_items
--                            WHERE order_items.order_id = NEW.order_id
--         LOOP
--             -- Check if sufficient stock is available (Prevent Negative Inventory)
--             IF (SELECT current_quantity FROM item_stock WHERE item_id = item_record.item_id AND location_id = location_id_to_use) >= item_record.quantity THEN
--                 -- Update item_stock (deduct quantity)
--                 UPDATE item_stock
--                 SET current_quantity = current_quantity - item_record.quantity,
--                     last_updated = NOW()
--                 WHERE item_id = item_record.item_id AND location_id = location_id_to_use;

--                 -- Insert a record into stock_movements (record the 'OUT' movement)
--                 INSERT INTO stock_movements (item_id, location_id, movement_type, quantity, reference_type, reference_id, created_by, notes)
--                 VALUES (item_record.item_id, location_id_to_use, order_movement_type, item_record.quantity, 'ORDER', NEW.order_id, NEW.createdBy, 'Order Completed - Inventory Deduction'); -- Consider more descriptive notes

--             ELSE
--                 -- RAISE EXCEPTION if insufficient stock - **Important for data integrity**
--                 RAISE EXCEPTION 'Insufficient stock for item % in location % for order %', item_record.item_id, location_id_to_use, NEW.order_id;
--                 -- Alternatively, you could handle this differently (e.g., log a warning, change order status to 'BACKORDERED' etc.) based on your business requirements.
--             END IF;

--         END LOOP;
--     END IF;

--     RETURN NEW; -- Important: Triggers must return either NEW or OLD record. Returning NEW is typical for AFTER UPDATE triggers.
-- END;
-- $$ LANGUAGE plpgsql;


-- CREATE TRIGGER order_completion_inventory_trigger
-- AFTER UPDATE OF status ON orders
-- FOR EACH ROW
-- EXECUTE FUNCTION update_inventory_on_order_completion();


-- V2
CREATE OR REPLACE FUNCTION record_order_stock_movement()
RETURNS TRIGGER AS $$
DECLARE
    item_record RECORD;
    location_id_to_use UUID;
BEGIN
    -- Check if the order status was changed to 'COMPLETED' and movement is 'OUT'
    IF NEW.status = 'COMPLETED' AND NEW.status <> OLD.status AND NEW.movement = 'OUT' THEN

        -- Loop through each item in the order_items table for this order
        FOR item_record IN SELECT order_items.item_id, order_items.quantity, order_items.item_location_id
                           FROM order_items
                           WHERE order_items.order_id = NEW.order_id
        LOOP
            -- Insert a record into stock_movements (record the 'OUT' movement) - **ONLY INSERT**
            INSERT INTO stock_movements (item_id, location_id, movement_type, quantity, reference_type, reference_id, notes)
            VALUES (item_record.item_id, item_record.item_location_id, 'OUT', item_record.quantity, 'ORDER_COMPLETION', NEW.order_id, 'Order Completed - Inventory Deduction');
        END LOOP;
    END IF;

    IF NEW.status = 'COMPLETED' AND NEW.status <> OLD.status AND NEW.movement = 'IN' THEN

        -- Loop through each item in the order_items table for this order
        FOR item_record IN SELECT order_items.item_id, order_items.quantity, order_items.item_location_id
                           FROM order_items
                           WHERE order_items.order_id = NEW.order_id
        LOOP
            -- Insert a record into stock_movements (record the 'IN' movement) - **ONLY INSERT**
            INSERT INTO stock_movements (item_id, location_id, movement_type, quantity, reference_type, reference_id, notes)
            VALUES (item_record.item_id, item_record.item_location_id, 'IN', item_record.quantity, 'ORDER_COMPLETION', NEW.order_id, 'Order Completed - Inventory Addition');
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER order_completion_inventory_trigger
AFTER UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION record_order_stock_movement();

