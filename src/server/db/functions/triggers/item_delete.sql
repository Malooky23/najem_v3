-- CREATE OR REPLACE FUNCTION track_item_deletion()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO deleted_items (item_id) VALUES (OLD.item_id);
--   RETURN OLD;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER item_deletion_trigger
-- AFTER DELETE ON items
-- FOR EACH ROW EXECUTE FUNCTION track_item_deletion();


-- Create trigger function for soft delete
CREATE OR REPLACE FUNCTION handle_item_soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Instead of actually deleting, update is_deleted flag
    UPDATE items
    SET 
        is_deleted = TRUE,
        updated_at = NOW()
    WHERE item_id = OLD.item_id;
    
    -- Prevent the actual deletion
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE OR REPLACE TRIGGER before_item_delete
    BEFORE DELETE ON items
    FOR EACH ROW
    EXECUTE FUNCTION handle_item_soft_delete();