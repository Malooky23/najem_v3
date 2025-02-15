CREATE OR REPLACE FUNCTION track_item_deletion()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO deleted_items (item_id) VALUES (OLD.item_id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER item_deletion_trigger
AFTER DELETE ON items
FOR EACH ROW EXECUTE FUNCTION track_item_deletion();