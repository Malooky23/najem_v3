create function _create_customer_entity(p_customer_type customer_type, p_display_name character varying, p_country text, p_notes text DEFAULT NULL::text) returns uuid
    language plpgsql
as
$$
    DECLARE
    v_customer_id UUID;
    BEGIN
    -- Insert into customers table
    INSERT INTO customers (customer_type, country, notes, display_name)
    VALUES (p_customer_type, p_country, p_notes, p_display_name)
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
    $$;

alter function _create_customer_entity(customer_type, varchar, text, text) owner to malek;


----------

create function create_customer(p_customer_type customer_type, p_display_name character varying, p_country text, p_notes text DEFAULT NULL::text, p_business_name text DEFAULT NULL::text, p_is_tax_registered boolean DEFAULT NULL::boolean, p_tax_number text DEFAULT NULL::text, p_firstname text DEFAULT NULL::text, p_middlename text DEFAULT NULL::text, p_lastname text DEFAULT NULL::text, p_personalid text DEFAULT NULL::text, p_address jsonb DEFAULT NULL::jsonb, p_contacts jsonb DEFAULT NULL::jsonb) returns jsonb
    language plpgsql
as
$$
    DECLARE
    v_customer_id UUID;
    BEGIN
    BEGIN
        -- Call helper function to create customer entity
        v_customer_id := _create_customer_entity(p_customer_type, p_country, p_notes, p_display_name);

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
    $$;

alter function create_customer(customer_type, varchar, text, text, text, boolean, text, text, text, text, text, jsonb, jsonb) owner to malek;

---------------------

