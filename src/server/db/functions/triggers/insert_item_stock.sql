CREATE OR REPLACE FUNCTION insert_into_item_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a new row into item_stock with the item_id of the newly inserted item
    -- and a fixed location_id (4e176e92-e833-44f5-aea9-0537f980fb4b)
    INSERT INTO item_stock (item_id, location_id)
    VALUES (NEW.item_id, '4e176e92-e833-44f5-aea9-0537f980fb4b');

    -- Return the NEW row to allow the trigger to continue
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER after_item_insert
AFTER INSERT ON item
FOR EACH ROW
EXECUTE FUNCTION insert_into_item_stock();