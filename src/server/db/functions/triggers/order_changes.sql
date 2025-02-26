CREATE OR REPLACE FUNCTION record_order_changes()
RETURNS TRIGGER AS $$
DECLARE
    changes jsonb := '{}';
    prev_values jsonb := '{}';
    new_values jsonb := '{}';
    change_count integer;
    change_type order_history_type;
BEGIN
    -- Collect all changes
    IF NEW.status <> OLD.status THEN
        prev_values = prev_values || jsonb_build_object('status', OLD.status);
        new_values = new_values || jsonb_build_object('status', NEW.status);
        changes = changes || jsonb_build_object('STATUS_CHANGE', true);
    END IF;

    IF NEW.movement <> OLD.movement THEN
        prev_values = prev_values || jsonb_build_object('movement', OLD.movement);
        new_values = new_values || jsonb_build_object('movement', NEW.movement);
        changes = changes || jsonb_build_object('MOVEMENT_CHANGE', true);
    END IF;

    IF NEW.delivery_method <> OLD.delivery_method THEN
        prev_values = prev_values || jsonb_build_object('delivery_method', OLD.delivery_method);
        new_values = new_values || jsonb_build_object('delivery_method', NEW.delivery_method);
        changes = changes || jsonb_build_object('DELIVERY_METHOD_CHANGE', true);
    END IF;

    IF NEW.packing_type <> OLD.packing_type THEN
        prev_values = prev_values || jsonb_build_object('packing_type', OLD.packing_type);
        new_values = new_values || jsonb_build_object('packing_type', NEW.packing_type);
        changes = changes || jsonb_build_object('PACKING_TYPE_CHANGE', true);
    END IF;

    IF NEW.notes IS DISTINCT FROM OLD.notes THEN
        prev_values = prev_values || jsonb_build_object('notes', OLD.notes);
        new_values = new_values || jsonb_build_object('notes', NEW.notes);
        changes = changes || jsonb_build_object('NOTES_CHANGE', true);
    END IF;

    IF NEW.address_id IS DISTINCT FROM OLD.address_id THEN
        prev_values = prev_values || jsonb_build_object('address_id', OLD.address_id);
        new_values = new_values || jsonb_build_object('address_id', NEW.address_id);
        changes = changes || jsonb_build_object('ADDRESS_CHANGE', true);
    END IF;

    -- Get the number of changes
    SELECT count(*) INTO change_count 
    FROM jsonb_object_keys(changes);

    -- If there are any changes, create a history record
    IF change_count > 0 THEN
        -- For single changes, use the specific change type
        -- For multiple changes, use MULTIPLE_CHANGES
        IF change_count = 1 THEN
            change_type := (SELECT key::order_history_type 
                          FROM jsonb_object_keys(changes) AS key 
                          LIMIT 1);
        ELSE
            change_type := 'MULTIPLE_CHANGES';
        END IF;

        INSERT INTO order_history (
            order_id,
            change_type,
            previous_values,
            new_values,
            changed_by,
            change_note
        ) VALUES (
            NEW.order_id,
            change_type,
            prev_values,
            new_values,
            CURRENT_USER,
            CASE 
                WHEN change_count = 1 THEN
                    CASE change_type
                        WHEN 'STATUS_CHANGE' THEN 
                            format('Status changed from %s to %s', 
                                   prev_values->>'status', 
                                   new_values->>'status')
                        WHEN 'MOVEMENT_CHANGE' THEN 
                            format('Movement changed from %s to %s', 
                                   prev_values->>'movement', 
                                   new_values->>'movement')
                        WHEN 'DELIVERY_METHOD_CHANGE' THEN 
                            format('Delivery method changed from %s to %s', 
                                   prev_values->>'delivery_method', 
                                   new_values->>'delivery_method')
                        ELSE format('%s updated', change_type::text)
                    END
                ELSE
                    format(
                        'Multiple changes: %s', 
                        (SELECT string_agg(key, ', ') 
                         FROM jsonb_object_keys(changes) AS key)
                    )
            END
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_history_trigger
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION record_order_changes();

---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION record_order_items_changes()
RETURNS TRIGGER AS $$
DECLARE
    order_id uuid;
BEGIN
    -- Get the order_id (same for both OLD and NEW)
    order_id := COALESCE(OLD.order_id, NEW.order_id);
    
    INSERT INTO order_history (
        order_id,
        change_type,
        previous_values,
        new_values,
        changed_by,
        change_note
    ) VALUES (
        order_id,
        'ITEMS_CHANGE',
        CASE 
            WHEN TG_OP = 'DELETE' THEN jsonb_build_object(
                'item_id', OLD.item_id,
                'quantity', OLD.quantity,
                'location_id', OLD.item_location_id
            )
            ELSE NULL 
        END,
        CASE 
            WHEN TG_OP = 'INSERT' THEN jsonb_build_object(
                'item_id', NEW.item_id,
                'quantity', NEW.quantity,
                'location_id', NEW.item_location_id
            )
            ELSE NULL 
        END,
        CURRENT_USER,
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'Item added to order'
            WHEN TG_OP = 'DELETE' THEN 'Item removed from order'
            ELSE 'Item modified in order'
        END
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_items_history_trigger
AFTER INSERT OR DELETE ON order_items
FOR EACH ROW
EXECUTE FUNCTION record_order_items_changes();
