CREATE OR REPLACE FUNCTION _create_customer_entity(
    p_customer_type customer_type,
    p_country TEXT,
    p_notes TEXT DEFAULT NULL
    ) RETURNS UUID AS $$
    DECLARE
    v_customer_id UUID;
    BEGIN
    -- Insert into customers table
    INSERT INTO customers (customer_type, country, notes)
    VALUES (p_customer_type, p_country, p_notes)
    RETURNING customer_id INTO v_customer_id;
    RETURN v_customer_id;
    EXCEPTION
    WHEN others THEN
        -- Re-raise exception for the calling function to handle
        RAISE EXCEPTION '%', json_build_object(
        'success', false,
        'error_code', SQLSTATE,
        'error_message', SQLERRM
        )::TEXT;
    END;
    $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION _create_address_details(
    p_entity_id UUID,
    p_entity_type TEXT,
    p_address JSONB
    ) RETURNS VOID AS $$
    DECLARE
    v_address_id UUID;
    BEGIN
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

        -- Link address to entity
        INSERT INTO entity_addresses
        (entity_id, entity_type, address_id)
        VALUES
        (p_entity_id, p_entity_type, v_address_id);
    END IF;
    END;
    $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION _create_contact_details(
    p_entity_id UUID,
    p_entity_type TEXT,
    p_contacts JSONB
    ) RETURNS VOID AS $$
    DECLARE
    contact JSONB;
    contact_id UUID;
    BEGIN
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

        -- Link contact to entity
        INSERT INTO entity_contact_details
            (entity_id, entity_type, contact_details_id)
        VALUES
            (p_entity_id, p_entity_type, contact_id);
        END LOOP;
    END IF;
    END;
    $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_customer(
    p_customer_type customer_type,  -- 'BUSINESS' or 'INDIVIDUAL'
    p_country TEXT,
    p_notes TEXT DEFAULT NULL,
    p_business_name TEXT DEFAULT NULL,
    p_is_tax_registered BOOLEAN DEFAULT NULL,
    p_tax_number TEXT DEFAULT NULL,
    p_firstName TEXT DEFAULT NULL,
    p_middleName TEXT DEFAULT NULL,
    p_lastName TEXT DEFAULT NULL,
    p_personalID TEXT DEFAULT NULL,
    p_address JSONB DEFAULT NULL,
    p_contacts JSONB DEFAULT NULL
    ) RETURNS JSONB AS $$
    DECLARE
    v_customer_id UUID;
    BEGIN
    BEGIN
        -- Call helper function to create customer entity
        v_customer_id := _create_customer_entity(p_customer_type, p_country, p_notes);

        -- Handle type-specific customer details
        CASE p_customer_type
        WHEN 'BUSINESS' THEN
            INSERT INTO business_customers
            (business_customer_id, business_name, is_tax_registered, tax_number)
            VALUES
            (v_customer_id, p_business_name, p_is_tax_registered, p_tax_number);
        WHEN 'INDIVIDUAL' THEN
            INSERT INTO individual_customers
            (individual_customer_id, first_name, middle_name, last_name, personal_id)
            VALUES
            (v_customer_id, p_firstName, p_middleName, p_lastName, p_personalID);
        ELSE
            RAISE EXCEPTION 'Invalid customer type: %', p_customer_type;
        END CASE;

        -- Call helper functions for address and contacts
        PERFORM _create_address_details(v_customer_id, 'CUSTOMER', p_address);
        PERFORM _create_contact_details(v_customer_id, 'CUSTOMER', p_contacts);

        -- Return success
        RETURN json_build_object('success', true, 'customer_id', v_customer_id);

    EXCEPTION WHEN OTHERS THEN
        -- Exception handling is now simplified as helper functions re-raise JSON errors
        RETURN json_build_object(
        'success', false,
        'error_code', SQLSTATE,
        'error_message', SQLERRM
        );
    END;
    END;
    $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION new_business_customer(
    p_country TEXT,
    p_business_name TEXT,
    p_is_tax_registered BOOLEAN,
    p_tax_number TEXT,
    p_address JSONB,
    p_contacts JSONB,
    p_notes TEXT DEFAULT NULL
    ) RETURNS JSONB AS $$
    BEGIN
    RETURN create_customer(
        p_customer_type := 'BUSINESS',
        p_country := p_country,
        p_notes := p_notes,
        p_business_name := p_business_name,
        p_is_tax_registered := p_is_tax_registered,
        p_tax_number := p_tax_number,
        p_address := p_address,
        p_contacts := p_contacts
    );
    END;
    $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION new_individual_customer(
        p_firstName TEXT,
        p_middleName TEXT,
        p_lastName TEXT,
        p_personalID TEXT,
        p_country TEXT,
        p_address JSONB,
        p_contacts JSONB,
        p_notes TEXT DEFAULT NULL
    ) RETURNS JSONB AS $$
    BEGIN
    RETURN create_customer(
        p_customer_type := 'INDIVIDUAL',
        p_country := p_country,
        p_notes := p_notes,
        p_firstName := p_firstName,
        p_middleName := p_middleName,
        p_lastName := p_lastName,
        p_personalID := p_personalID,
        p_address := p_address,
        p_contacts := p_contacts
    );
    END;
    $$ LANGUAGE plpgsql;


\df _create_customer_entity    
\df _create_address_details    
\df _create_contact_details    
\df create_customer    
\df new_business_customer    
\df new_individual_customer    