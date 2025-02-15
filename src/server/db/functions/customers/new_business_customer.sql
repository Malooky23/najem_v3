CREATE OR REPLACE FUNCTION new_business_customer(
  p_country TEXT,
  p_business_name TEXT,
  p_is_tax_registered BOOLEAN,
  p_tax_number TEXT,
  p_address JSONB,
  p_contacts JSONB  -- Changed to JSONB (not array)
) RETURNS JSONB AS $$
DECLARE
  v_customer_id UUID;
  v_address_id UUID;
  contact JSONB;
  contact_id UUID;
BEGIN
  BEGIN
    -- Insert into customers table
    INSERT INTO customers (customer_type, country)
    VALUES ('BUSINESS', p_country)
    RETURNING customer_id INTO v_customer_id;

    -- Insert into business_customers table
    INSERT INTO business_customers 
      (business_customer_id, business_name, is_tax_registered, tax_number)
    VALUES 
      (v_customer_id, p_business_name, p_is_tax_registered, p_tax_number);

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
      FOR contact IN SELECT * FROM jsonb_array_elements(p_contacts)
      LOOP
        -- Insert contact details
        INSERT INTO contact_details 
          (contact_type, contact_data, is_primary)
        VALUES 
          (
            (contact->>'contact_type')::contact_type,
            contact->>'contact_data',
            COALESCE((contact->>'is_primary')::BOOLEAN, false)
          )
        RETURNING contact_details_id INTO contact_id;

        -- Link contact to customer
        INSERT INTO entity_contact_details 
          (entity_id, entity_type, contact_details_id)
        VALUES 
          (v_customer_id, 'CUSTOMER', contact_id);  -- Fixed variable name
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