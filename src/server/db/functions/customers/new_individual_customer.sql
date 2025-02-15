CREATE OR REPLACE FUNCTION test_new_individual_customer(
    p_firstName TEXT,
    p_middleName TEXT,
    p_lastName TEXT,
    p_personalID TEXT,
    p_country TEXT,
    p_address JSONB,
    p_contacts JSONB  
) RETURNS JSONB AS $$
DECLARE 
  v_customer_id UUID;
  v_address_id UUID;
  v_contact JSONB;
  v_contact_id UUID;
BEGIN
    BEGIN

    -- Insert into customers table
    INSERT INTO customers (customer_type, country)
    VALUES ('INDIVIDUAL', p_country)
    RETURNING customer_id INTO v_customer_id;

    -- Insert into individual_customers table
    INSERT INTO individual_customers 
      (individual_customer_id, first_name, middle_name, last_name, personal_id)
    VALUES 
      (v_customer_id, p_firstName, p_middleName, p_lastName, p_personalID);

    -- Insert address if provided
    IF p_address IS NOT NULL THEN
      INSERT INTO address_details (address_1, address_2, city, country, postal_code, address_type)
      VALUES (
        p_address->>'address1',
        p_address->>'address2',
        p_address->>'city',
        p_address->>'country',
        p_address->>'postalCode',
        p_address->>'addressType'
      )
      RETURNING address_id INTO v_address_id;

      -- Link address to customer
      INSERT INTO entity_addresses 
        (entity_id, entity_type, address_id)
      VALUES 
        (v_customer_id, 'CUSTOMER', v_address_id); 
    END IF;

    -- Insert contacts if provided
    IF p_contacts IS NOT NULL AND jsonb_typeof(p_contacts) = 'array' THEN
      FOR v_contact IN SELECT * FROM jsonb_array_elements(p_contacts)
      LOOP
        -- Insert contact details
        INSERT INTO contact_details 
          (contact_type, contact_data, is_primary)
        VALUES 
          (
            (v_contact->>'contact_type')::contact_type,
            v_contact->>'contact_data',
            COALESCE((v_contact->>'is_primary')::BOOLEAN, false)
          )
        RETURNING contact_details_id INTO v_contact_id;

        -- Link contact to customer
        INSERT INTO entity_contact_details 
          (entity_id, entity_type, contact_details_id)
        VALUES 
          (v_customer_id, 'CUSTOMER', v_contact_id);  
      END LOOP;
    END IF;

    -- Return success
    RETURN json_build_object('success', true, 'customer_id', v_customer_id);
    
  EXCEPTION
    WHEN others THEN
      -- Return error details
      RETURN json_build_object(
        'success', false,
        'error_code', SQLSTATE,
        'error_message', SQLERRM
      );
  END;
END;
$$ LANGUAGE plpgsql;
