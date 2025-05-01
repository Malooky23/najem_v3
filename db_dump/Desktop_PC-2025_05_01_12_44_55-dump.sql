--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO postgres;

--
-- Name: neon_auth; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA neon_auth;


ALTER SCHEMA neon_auth OWNER TO neondb_owner;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: contact_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.contact_type AS ENUM (
    'email',
    'phone',
    'mobile',
    'landline',
    'other'
);


ALTER TYPE public.contact_type OWNER TO neondb_owner;

--
-- Name: customer_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.customer_type AS ENUM (
    'INDIVIDUAL',
    'BUSINESS'
);


ALTER TYPE public.customer_type OWNER TO neondb_owner;

--
-- Name: delivery_method; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.delivery_method AS ENUM (
    'NONE',
    'PICKUP',
    'DELIVERY'
);


ALTER TYPE public.delivery_method OWNER TO neondb_owner;

--
-- Name: entity_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.entity_type AS ENUM (
    'CUSTOMER',
    'USER'
);


ALTER TYPE public.entity_type OWNER TO neondb_owner;

--
-- Name: expense_category_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.expense_category_type AS ENUM (
    'LABOUR',
    'FORKLIFT',
    'PACKING'
);


ALTER TYPE public.expense_category_type OWNER TO postgres;

--
-- Name: item_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.item_type AS ENUM (
    'SACK',
    'PALLET',
    'CARTON',
    'OTHER',
    'BOX',
    'EQUIPMENT',
    'CAR'
);


ALTER TYPE public.item_type OWNER TO postgres;

--
-- Name: movement_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.movement_type AS ENUM (
    'IN',
    'OUT'
);


ALTER TYPE public.movement_type OWNER TO neondb_owner;

--
-- Name: order_expense_status_types; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_expense_status_types AS ENUM (
    'PENDING',
    'DONE',
    'CANCELLED'
);


ALTER TYPE public.order_expense_status_types OWNER TO postgres;

--
-- Name: order_history_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_history_type AS ENUM (
    'STATUS_CHANGE',
    'MOVEMENT_CHANGE',
    'ITEMS_CHANGE',
    'ADDRESS_CHANGE',
    'DELIVERY_METHOD_CHANGE',
    'CUSTOMER_CHANGE',
    'PACKING_TYPE_CHANGE',
    'NOTES_CHANGE'
);


ALTER TYPE public.order_history_type OWNER TO postgres;

--
-- Name: order_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.order_status AS ENUM (
    'DRAFT',
    'PENDING',
    'PROCESSING',
    'READY',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public.order_status OWNER TO neondb_owner;

--
-- Name: order_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_type AS ENUM (
    'CUSTOMER_ORDER',
    'SHIPMENT_ORDER',
    'WAREHOUSE_ORDER'
);


ALTER TYPE public.order_type OWNER TO postgres;

--
-- Name: packing_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.packing_type AS ENUM (
    'SACK',
    'PALLET',
    'CARTON',
    'OTHER',
    'NONE'
);


ALTER TYPE public.packing_type OWNER TO neondb_owner;

--
-- Name: user_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.user_type AS ENUM (
    'EMPLOYEE',
    'CUSTOMER',
    'DEMO'
);


ALTER TYPE public.user_type OWNER TO neondb_owner;

--
-- Name: zoho_tax_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.zoho_tax_type AS ENUM (
    '5293485000000114027',
    '5293485000000114033'
);


ALTER TYPE public.zoho_tax_type OWNER TO postgres;

--
-- Name: _create_address_details(uuid, text, jsonb); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public._create_address_details(p_entity_id uuid, p_entity_type text, p_address jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
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
    $$;


ALTER FUNCTION public._create_address_details(p_entity_id uuid, p_entity_type text, p_address jsonb) OWNER TO neondb_owner;

--
-- Name: _create_contact_details(uuid, text, jsonb); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public._create_contact_details(p_entity_id uuid, p_entity_type text, p_contacts jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
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
    $$;


ALTER FUNCTION public._create_contact_details(p_entity_id uuid, p_entity_type text, p_contacts jsonb) OWNER TO neondb_owner;

--
-- Name: _create_customer_entity(public.customer_type, text, text); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public._create_customer_entity(p_customer_type public.customer_type, p_country text, p_notes text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
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
    $$;


ALTER FUNCTION public._create_customer_entity(p_customer_type public.customer_type, p_country text, p_notes text) OWNER TO neondb_owner;

--
-- Name: authenticate_user(text, text, inet, text); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.authenticate_user(p_email text, p_password text, p_ip_address inet, p_user_agent text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  user_record users%ROWTYPE;
  attempt_id integer;
  password_valid BOOLEAN;
BEGIN
  -- Start by logging the login attempt
  INSERT INTO login_attempts (
    user_id, 
    ip_address, 
    user_agent, 
    success
  ) VALUES (
    (SELECT user_id FROM users WHERE email = LOWER(p_email)),
    p_ip_address,
    p_user_agent,
    false
  ) RETURNING login_attempt_id INTO attempt_id;

  -- Find active user with matching email
  SELECT * INTO user_record 
  FROM users 
  WHERE email = LOWER(p_email) 
    AND is_active = true;

  -- If user not found, return generic error
  IF NOT FOUND THEN
    RETURN json_build_object(
      'status', 'error',
      'code', 'invalid_credentials',
      'message', 'Invalid email or password'
    );
  END IF;

  -- Verify password using pgcrypto
  IF crypt(p_password, user_record.password_hash) = user_record.password_hash THEN
    password_valid := true;
  ELSE
    password_valid := false;
  END IF;

  -- Update login attempt with result
  UPDATE login_attempts 
  SET success = password_valid
  WHERE login_attempt_id = attempt_id;

  -- Return error if password invalid
  IF NOT password_valid THEN
    RETURN json_build_object(
      'status', 'error',
      'code', 'invalid_credentials',
      'message', 'Invalid email or password'
    );
  END IF;

  -- Update user's last login and increment login count
  UPDATE users 
  SET last_login = NOW(),
      login_count = login_count + 1
  WHERE user_id = user_record.user_id;

  -- Return successful response with user data
  RETURN json_build_object(
    'status', 'success',
    'user', json_build_object(
      'user_id', user_record.user_id,
      'email', user_record.email,
      'first_name', user_record.first_name,
      'last_name', user_record.last_name,
      'is_admin', user_record.is_admin,
      'user_type', user_record.user_type,
       'customer_id', user_record.customer_id
    )
  );
EXCEPTION
  WHEN others THEN
    -- Log unexpected errors
    UPDATE login_attempts 
    SET error_message = SQLERRM
    WHERE login_attempt_id = attempt_id;
    
    RETURN json_build_object(
      'status', 'error',
      'code', 'server_error',
      'message', 'Internal server error'
    );
END;
$$;


ALTER FUNCTION public.authenticate_user(p_email text, p_password text, p_ip_address inet, p_user_agent text) OWNER TO neondb_owner;

--
-- Name: create_customer(public.customer_type, text, text, text, boolean, text, text, text, text, text, jsonb, jsonb); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.create_customer(p_customer_type public.customer_type, p_country text, p_notes text DEFAULT NULL::text, p_business_name text DEFAULT NULL::text, p_is_tax_registered boolean DEFAULT NULL::boolean, p_tax_number text DEFAULT NULL::text, p_firstname text DEFAULT NULL::text, p_middlename text DEFAULT NULL::text, p_lastname text DEFAULT NULL::text, p_personalid text DEFAULT NULL::text, p_address jsonb DEFAULT NULL::jsonb, p_contacts jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
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
    $$;


ALTER FUNCTION public.create_customer(p_customer_type public.customer_type, p_country text, p_notes text, p_business_name text, p_is_tax_registered boolean, p_tax_number text, p_firstname text, p_middlename text, p_lastname text, p_personalid text, p_address jsonb, p_contacts jsonb) OWNER TO neondb_owner;

--
-- Name: handle_item_soft_delete(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.handle_item_soft_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.handle_item_soft_delete() OWNER TO neondb_owner;

--
-- Name: insert_into_item_stock(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.insert_into_item_stock() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Insert a new row into item_stock with the item_id of the newly inserted item
    -- and a fixed location_id (4e176e92-e833-44f5-aea9-0537f980fb4b)
    INSERT INTO item_stock (item_id, location_id)
    VALUES (NEW.item_id, '4e176e92-e833-44f5-aea9-0537f980fb4b');

    -- Return the NEW row to allow the trigger to continue
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.insert_into_item_stock() OWNER TO neondb_owner;

--
-- Name: new_business_customer(text, text, boolean, text, jsonb, jsonb, text); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.new_business_customer(p_country text, p_business_name text, p_is_tax_registered boolean, p_tax_number text, p_address jsonb, p_contacts jsonb, p_notes text DEFAULT NULL::text) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
BEGIN
RETURN create_customer(
        p_customer_type := 'BUSINESS',
        p_country := p_country,
        p_notes := p_notes,
        p_business_name := p_business_name,
        p_is_tax_registered := p_is_tax_registered,
        p_tax_number := p_tax_number,
        p_address := p_address,
        p_contacts := p_contacts);
END;
$$;


ALTER FUNCTION public.new_business_customer(p_country text, p_business_name text, p_is_tax_registered boolean, p_tax_number text, p_address jsonb, p_contacts jsonb, p_notes text) OWNER TO neondb_owner;

--
-- Name: new_individual_customer(text, text, text, text, text, jsonb, jsonb, text); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.new_individual_customer(p_firstname text, p_middlename text, p_lastname text, p_personalid text, p_country text, p_address jsonb, p_contacts jsonb, p_notes text DEFAULT NULL::text) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
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
    $$;


ALTER FUNCTION public.new_individual_customer(p_firstname text, p_middlename text, p_lastname text, p_personalid text, p_country text, p_address jsonb, p_contacts jsonb, p_notes text) OWNER TO neondb_owner;

--
-- Name: new_user(text, text, character varying, character varying, public.user_type, boolean); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.new_user(p_email text, p_password text, p_first_name character varying, p_last_name character varying, p_user_type public.user_type, p_is_admin boolean DEFAULT false) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    DECLARE
        v_user_id UUID;
        v_user_type user_type;
        password_salt TEXT;
        password_hash TEXT;
    BEGIN
        BEGIN
        -- Check if email already exists
        IF EXISTS (SELECT 1 FROM users WHERE email = LOWER(p_email)) THEN
            RAISE EXCEPTION 'Email already exists';
        END IF;

        -- Generate salt and hash password
        password_salt := gen_salt('bf');
        password_hash := crypt(p_password, password_salt);

        -- Insert new user
        INSERT INTO users (
            email,
            password_hash,
            first_name,
            last_name,
            user_type,
            is_admin
        ) VALUES (
            LOWER(p_email),
            password_hash,
            INITCAP(p_first_name),  --IF ADDING TRIGGER THEN NO NEED
            INITCAP(p_last_name),   --IF ADDING TRIGGER THEN NO NEED
            p_user_type::user_type, 
            p_is_admin::BOOLEAN     -- Need to add type boolean?
        )
        RETURNING user_id INTO v_user_id;

        RETURN json_build_object('success', true, 'user_id', v_user_id);

    EXCEPTION
        WHEN unique_violation THEN
            -- RAISE EXCEPTION 'Email address already exists';
            RETURN json_build_object(
                'success', false,
                'error_code', SQLSTATE,
                'error_message', 'Email address already exists'
            );
        WHEN others THEN
            RETURN json_build_object(
                'success', false,
                'error_code', SQLSTATE,
                'error_message', SQLERRM
            );
    END;
END;
$$;


ALTER FUNCTION public.new_user(p_email text, p_password text, p_first_name character varying, p_last_name character varying, p_user_type public.user_type, p_is_admin boolean) OWNER TO neondb_owner;

--
-- Name: record_order_stock_movement(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.record_order_stock_movement() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    item_record RECORD;
    movement_type movement_type;
    is_reversal BOOLEAN;
    tx_number INTEGER;
    original_movement_type movement_type; -- To store the original movement type retrieved from stock_movements
    original_stock_movement RECORD;
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
        is_reversal := TRUE;
        -- Retrieve the ORIGINAL movement type from stock_movements for this order
        SELECT stock_movements.movement_type INTO original_movement_type -- Qualify movement_type here
        FROM stock_movements
        WHERE reference_id = NEW.order_id
          AND reference_type = 'ORDER_COMPLETION'
        LIMIT 1; -- Assuming all original movements for an order completion are of the same type

        IF NOT FOUND THEN
            -- Handle case where original stock movements are not found (unlikely, but for robustness)
            RAISE EXCEPTION 'Original stock movements for order ID % not found during reversal!', NEW.order_id;
        END IF;

        -- Determine reversal movement type based on ORIGINAL movement type
        movement_type := CASE WHEN original_movement_type = 'IN' THEN 'OUT' ELSE 'IN' END;
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
                    format('[TX#%s][REVERSAL] Order Uncompleted - Reversing Previous %s', tx_number, original_movement_type)
                ELSE
                    format('[TX#%s] Order Completed - %s Inventory', tx_number,
                           CASE WHEN movement_type = 'OUT' THEN 'Deduction' ELSE 'Addition' END)
            END
        );
    END LOOP;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.record_order_stock_movement() OWNER TO neondb_owner;

--
-- Name: refresh_view(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.refresh_view() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY stock_movements_view;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.refresh_view() OWNER TO neondb_owner;

--
-- Name: update_item_stock_on_movement(); Type: FUNCTION; Schema: public; Owner: neondb_owner
--

CREATE FUNCTION public.update_item_stock_on_movement() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    current_stock_quantity INTEGER;
    item_name TEXT;
    location_name TEXT;

BEGIN
    -- Determine current stock quantity (or 0 if no stock record yet)
    SELECT current_quantity INTO current_stock_quantity
    FROM item_stock
    WHERE item_id = NEW.item_id AND location_id = NEW.location_id;

    IF NOT FOUND THEN
        current_stock_quantity := 0;
    END IF;

    -- Update item_stock based on movement_type
    IF NEW.movement_type = 'IN' THEN
        UPDATE item_stock
        SET current_quantity = current_quantity + NEW.quantity,
            last_movement_id = NEW.movement_id,
            last_updated = NOW()
        WHERE item_id = NEW.item_id AND location_id = NEW.location_id;
        
        INSERT INTO item_stock (item_id, location_id, current_quantity, last_movement_id, last_updated)
        SELECT NEW.item_id, NEW.location_id, NEW.quantity, NEW.movement_id, NOW()
        WHERE NOT EXISTS (SELECT 1 FROM item_stock WHERE item_id = NEW.item_id AND location_id = NEW.location_id);

    ELSIF NEW.movement_type = 'OUT' THEN
        -- Check for sufficient stock BEFORE deducting
        IF current_stock_quantity >= NEW.quantity THEN
            UPDATE item_stock
            SET current_quantity = current_stock_quantity - NEW.quantity,
                last_movement_id = NEW.movement_id,
                last_updated = NOW()
            WHERE item_id = NEW.item_id AND location_id = NEW.location_id;
        ELSE
            RAISE EXCEPTION 'Insufficient stock for item % at location %', item_name, location_name;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_item_stock_on_movement() OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: postgres
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: postgres
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: postgres
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: users_sync; Type: TABLE; Schema: neon_auth; Owner: neondb_owner
--

CREATE TABLE neon_auth.users_sync (
    raw_json jsonb NOT NULL,
    id text GENERATED ALWAYS AS ((raw_json ->> 'id'::text)) STORED NOT NULL,
    name text GENERATED ALWAYS AS ((raw_json ->> 'display_name'::text)) STORED,
    email text GENERATED ALWAYS AS ((raw_json ->> 'primary_email'::text)) STORED,
    created_at timestamp with time zone GENERATED ALWAYS AS (to_timestamp((trunc((((raw_json ->> 'signed_up_at_millis'::text))::bigint)::double precision) / (1000)::double precision))) STORED,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE neon_auth.users_sync OWNER TO neondb_owner;

--
-- Name: address_details; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.address_details (
    address_id uuid DEFAULT gen_random_uuid() NOT NULL,
    address_1 text,
    address_2 text,
    city text,
    country text,
    postal_code character varying(20),
    address_type text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);


ALTER TABLE public.address_details OWNER TO neondb_owner;

--
-- Name: business_customers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.business_customers (
    business_customer_id uuid NOT NULL,
    business_name text NOT NULL,
    is_tax_registered boolean DEFAULT false NOT NULL,
    tax_number text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);


ALTER TABLE public.business_customers OWNER TO neondb_owner;

--
-- Name: contact_details; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.contact_details (
    contact_details_id uuid DEFAULT gen_random_uuid() NOT NULL,
    contact_type public.contact_type NOT NULL,
    contact_data text NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);


ALTER TABLE public.contact_details OWNER TO neondb_owner;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customers (
    customer_id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_number integer NOT NULL,
    customer_type public.customer_type NOT NULL,
    notes text,
    country text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    display_name character varying(100) NOT NULL,
    zoho_customer_id text
);


ALTER TABLE public.customers OWNER TO neondb_owner;

--
-- Name: customers_customer_number_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.customers_customer_number_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_customer_number_seq OWNER TO neondb_owner;

--
-- Name: customers_customer_number_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.customers_customer_number_seq OWNED BY public.customers.customer_number;


--
-- Name: deleted_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.deleted_items (
    item_id uuid NOT NULL,
    deleted_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.deleted_items OWNER TO neondb_owner;

--
-- Name: expense_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expense_items (
    expense_item_id uuid DEFAULT gen_random_uuid() NOT NULL,
    expense_name text NOT NULL,
    default_expense_price numeric NOT NULL,
    expense_category public.expense_category_type,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    zoho_item_id text,
    "zohoTaxId" public.zoho_tax_type DEFAULT '5293485000000114027'::public.zoho_tax_type
);


ALTER TABLE public.expense_items OWNER TO postgres;

--
-- Name: order_expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_expenses (
    order_expense_id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    expense_item_id uuid NOT NULL,
    expense_item_quantity integer NOT NULL,
    notes text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    status public.order_expense_status_types DEFAULT 'PENDING'::public.order_expense_status_types,
    expense_item_price numeric DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE public.order_expenses OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.orders (
    order_id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_number integer NOT NULL,
    customer_id uuid NOT NULL,
    order_type public.order_type NOT NULL,
    movement public.movement_type NOT NULL,
    packing_type public.packing_type DEFAULT 'NONE'::public.packing_type NOT NULL,
    delivery_method public.delivery_method DEFAULT 'NONE'::public.delivery_method NOT NULL,
    status public.order_status DEFAULT 'PENDING'::public.order_status NOT NULL,
    address_id uuid,
    fulfilled_at timestamp with time zone,
    notes text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    is_deleted boolean DEFAULT false,
    order_mark character varying(30),
    zoho_invoice_id text,
    zoho_invoice_number text
);


ALTER TABLE public.orders OWNER TO neondb_owner;

--
-- Name: enriched_order_expense_view; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.enriched_order_expense_view AS
 SELECT order_expenses.order_expense_id,
    order_expenses.order_id,
    orders.order_number,
    orders.customer_id,
    customers.display_name,
    order_expenses.status,
    order_expenses.expense_item_id,
    expense_items.expense_name,
    order_expenses.expense_item_quantity,
    order_expenses.expense_item_price,
    expense_items.expense_category,
    order_expenses.notes,
    order_expenses.created_by,
    order_expenses.created_at,
    order_expenses.updated_at
   FROM (((public.order_expenses
     JOIN public.expense_items ON ((order_expenses.expense_item_id = expense_items.expense_item_id)))
     JOIN public.orders ON ((order_expenses.order_id = orders.order_id)))
     JOIN public.customers ON ((orders.customer_id = customers.customer_id)));


ALTER VIEW public.enriched_order_expense_view OWNER TO postgres;

--
-- Name: entity_addresses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.entity_addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_id uuid NOT NULL,
    entity_type text NOT NULL,
    address_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.entity_addresses OWNER TO neondb_owner;

--
-- Name: entity_contact_details; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.entity_contact_details (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_id uuid NOT NULL,
    entity_type text NOT NULL,
    contact_details_id uuid NOT NULL,
    contact_type text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.entity_contact_details OWNER TO neondb_owner;

--
-- Name: individual_customers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.individual_customers (
    individual_customer_id uuid NOT NULL,
    first_name text NOT NULL,
    middle_name text,
    last_name text NOT NULL,
    personal_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);


ALTER TABLE public.individual_customers OWNER TO neondb_owner;

--
-- Name: item_stock; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.item_stock (
    item_id uuid NOT NULL,
    location_id uuid NOT NULL,
    current_quantity integer DEFAULT 0 NOT NULL,
    last_updated timestamp with time zone DEFAULT now() NOT NULL,
    last_movement_id uuid,
    last_reconciliation_at timestamp with time zone,
    last_reconciliation_by uuid,
    CONSTRAINT quantity_check CHECK ((current_quantity >= 0))
);


ALTER TABLE public.item_stock OWNER TO neondb_owner;

--
-- Name: items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.items (
    item_id uuid DEFAULT gen_random_uuid() NOT NULL,
    item_number integer NOT NULL,
    item_name text NOT NULL,
    item_brand text,
    item_model text,
    item_barcode text,
    item_country_of_origin text,
    dimensions json,
    weight_grams integer,
    customer_id uuid NOT NULL,
    notes text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    is_deleted boolean DEFAULT false,
    item_type public.item_type DEFAULT 'OTHER'::public.item_type NOT NULL
);


ALTER TABLE public.items OWNER TO neondb_owner;

--
-- Name: items_item_number_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.items_item_number_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.items_item_number_seq OWNER TO neondb_owner;

--
-- Name: items_item_number_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.items_item_number_seq OWNED BY public.items.item_number;


--
-- Name: locations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.locations (
    location_id uuid DEFAULT gen_random_uuid() NOT NULL,
    location_name text NOT NULL,
    location_code text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);


ALTER TABLE public.locations OWNER TO neondb_owner;

--
-- Name: login_attempts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.login_attempts (
    login_attempt_id integer NOT NULL,
    user_id uuid,
    success boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    ip_address inet,
    user_agent text,
    error_message text
);


ALTER TABLE public.login_attempts OWNER TO neondb_owner;

--
-- Name: login_attempts_login_attempt_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.login_attempts_login_attempt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.login_attempts_login_attempt_id_seq OWNER TO neondb_owner;

--
-- Name: login_attempts_login_attempt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.login_attempts_login_attempt_id_seq OWNED BY public.login_attempts.login_attempt_id;


--
-- Name: order_expense_details_mv; Type: MATERIALIZED VIEW; Schema: public; Owner: postgres
--

CREATE MATERIALIZED VIEW public.order_expense_details_mv AS
 SELECT order_expenses.order_expense_id,
    order_expenses.order_id,
    order_expenses.expense_item_id,
    order_expenses.expense_item_quantity,
    expense_items.expense_name,
    expense_items.default_expense_price AS expense_price,
    expense_items.expense_category,
    ((order_expenses.expense_item_quantity)::numeric * expense_items.default_expense_price) AS total_expense_price
   FROM (public.order_expenses
     JOIN public.expense_items ON ((order_expenses.expense_item_id = expense_items.expense_item_id)))
  WITH NO DATA;


ALTER MATERIALIZED VIEW public.order_expense_details_mv OWNER TO postgres;

--
-- Name: order_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_history (
    history_id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    change_type public.order_history_type NOT NULL,
    previous_values json NOT NULL,
    new_values json NOT NULL,
    changed_by uuid NOT NULL,
    changed_at timestamp with time zone DEFAULT now() NOT NULL,
    change_note text
);


ALTER TABLE public.order_history OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.order_items (
    order_items_id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    item_id uuid NOT NULL,
    item_location_id uuid,
    quantity integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.order_items OWNER TO neondb_owner;

--
-- Name: orders_order_number_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.orders_order_number_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_order_number_seq OWNER TO neondb_owner;

--
-- Name: orders_order_number_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.orders_order_number_seq OWNED BY public.orders.order_number;


--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.stock_movements (
    movement_id uuid DEFAULT gen_random_uuid() NOT NULL,
    item_id uuid NOT NULL,
    location_id uuid NOT NULL,
    movement_type public.movement_type NOT NULL,
    quantity integer NOT NULL,
    reference_type text,
    reference_id uuid,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    movement_number integer NOT NULL
);


ALTER TABLE public.stock_movements OWNER TO neondb_owner;

--
-- Name: stock_movements_movemment_number_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.stock_movements_movemment_number_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_movements_movemment_number_seq OWNER TO neondb_owner;

--
-- Name: stock_movements_movemment_number_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.stock_movements_movemment_number_seq OWNED BY public.stock_movements.movement_number;


--
-- Name: stock_movements_view; Type: MATERIALIZED VIEW; Schema: public; Owner: neondb_owner
--

CREATE MATERIALIZED VIEW public.stock_movements_view AS
 WITH movementbalances AS (
         SELECT sm.movement_id,
            sm.movement_number,
            sm.item_id,
            sm.location_id,
            sm.movement_type,
            sm.quantity,
            sm.reference_type,
            sm.reference_id,
            sm.notes,
            sm.created_by,
            sm.created_at,
            sum(
                CASE
                    WHEN (sm.movement_type = 'IN'::public.movement_type) THEN sm.quantity
                    ELSE (- sm.quantity)
                END) OVER (PARTITION BY sm.item_id, sm.location_id ORDER BY sm.created_at ROWS UNBOUNDED PRECEDING) AS stock_level_after
           FROM public.stock_movements sm
        )
 SELECT mb.movement_id,
    mb.movement_number,
    mb.item_id,
    mb.location_id,
    mb.movement_type,
    mb.quantity,
    mb.reference_type,
    mb.reference_id,
    mb.notes,
    mb.created_by,
    mb.created_at,
    i.item_name,
    i.customer_id,
    c.display_name AS customer_display_name,
    mb.stock_level_after
   FROM ((movementbalances mb
     JOIN public.items i ON ((mb.item_id = i.item_id)))
     JOIN public.customers c ON ((i.customer_id = c.customer_id)))
  WITH NO DATA;


ALTER MATERIALIZED VIEW public.stock_movements_view OWNER TO neondb_owner;

--
-- Name: stock_reconciliation; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.stock_reconciliation (
    reconciliation_id uuid DEFAULT gen_random_uuid() NOT NULL,
    item_id uuid NOT NULL,
    location_id uuid NOT NULL,
    expected_quantity integer NOT NULL,
    actual_quantity integer NOT NULL,
    discrepancy integer NOT NULL,
    notes text,
    reconciliation_date timestamp with time zone DEFAULT now() NOT NULL,
    performed_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.stock_reconciliation OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    user_type public.user_type DEFAULT 'CUSTOMER'::public.user_type NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_login timestamp with time zone,
    customer_id uuid,
    login_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: customers customer_number; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers ALTER COLUMN customer_number SET DEFAULT nextval('public.customers_customer_number_seq'::regclass);


--
-- Name: items item_number; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.items ALTER COLUMN item_number SET DEFAULT nextval('public.items_item_number_seq'::regclass);


--
-- Name: login_attempts login_attempt_id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.login_attempts ALTER COLUMN login_attempt_id SET DEFAULT nextval('public.login_attempts_login_attempt_id_seq'::regclass);


--
-- Name: orders order_number; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders ALTER COLUMN order_number SET DEFAULT nextval('public.orders_order_number_seq'::regclass);


--
-- Name: stock_movements movement_number; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_movements ALTER COLUMN movement_number SET DEFAULT nextval('public.stock_movements_movemment_number_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: postgres
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
\.


--
-- Data for Name: users_sync; Type: TABLE DATA; Schema: neon_auth; Owner: neondb_owner
--

COPY neon_auth.users_sync (raw_json, updated_at, deleted_at) FROM stdin;
{"id": "b5031de0-71f8-461d-84e8-3cbfa12d6e43", "display_name": "Malek Darwish", "has_password": false, "primary_email": "malooky23@gmail.com", "selected_team": null, "auth_with_email": false, "client_metadata": null, "oauth_providers": [{"id": "google", "email": "malooky23@gmail.com", "account_id": "104365602616229505170"}], "server_metadata": null, "otp_auth_enabled": false, "selected_team_id": null, "profile_image_url": "https://lh3.googleusercontent.com/a/ACg8ocKgyorB9XMStOkofAT5QEHEft3VH841Y-p9xbsUlI9Ve6tOInTpqQ=s96-c", "requires_totp_mfa": false, "signed_up_at_millis": 1740596287920, "passkey_auth_enabled": false, "last_active_at_millis": 1740596287920, "primary_email_verified": true, "client_read_only_metadata": null, "primary_email_auth_enabled": true}	\N	\N
{"id": "f6c54d1b-8a54-4db6-8344-908e5e26dff5", "display_name": null, "has_password": true, "primary_email": "a@a.com", "selected_team": null, "auth_with_email": true, "client_metadata": null, "oauth_providers": [], "server_metadata": null, "otp_auth_enabled": false, "selected_team_id": null, "profile_image_url": null, "requires_totp_mfa": false, "signed_up_at_millis": 1740596340089, "passkey_auth_enabled": false, "last_active_at_millis": 1740596340089, "primary_email_verified": false, "client_read_only_metadata": null, "primary_email_auth_enabled": true}	\N	\N
\.


--
-- Data for Name: address_details; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.address_details (address_id, address_1, address_2, city, country, postal_code, address_type, created_at, updated_at) FROM stdin;
59f476bd-0f18-49eb-ad51-194382914b7c	9132 Veith Park	Apt 1181	Shuanghe	\N		\N	2025-02-06 11:59:02.298+01	\N
36f0adf1-7946-48c9-879b-2af5c3ee2570	7773 Ridgeway Drive	Suite 43	Alupay	\N	3201	\N	2025-02-06 11:59:02.359+01	\N
8d0a73b1-789d-4368-9e08-4b6357370a5f	635 Northridge Street	PO Box 7222	Tumbagaan	\N	1114	\N	2025-02-06 11:59:02.396+01	\N
c351c785-d47d-4e5c-a25e-72fe66d2be66	2 Mandrake Point	Room 653	Osiek	\N	87-340	\N	2025-02-06 11:59:02.439+01	\N
104adeb7-2a04-4994-9b26-533b000d7b45	6 Dorton Place	Apt 1490	San Isidro	\N	8421	\N	2025-02-06 11:59:02.477+01	\N
209f602a-e32d-495d-a5d7-304b5098e895	75520 Fordem Center	Apt 1209	Claye-Souilly	\N	77414 CEDEX	\N	2025-02-06 11:59:02.511+01	\N
df160bb6-620e-45d5-af32-58c87b956de3	630 Blue Bill Park Point	19th Floor	Tomsk	\N	634069	\N	2025-02-06 11:59:02.545+01	\N
c30abf20-9574-4777-aa35-25975121f794	94 Harbort Junction	PO Box 56318	Calizo	\N	5610	\N	2025-02-06 11:59:02.577+01	\N
24054ea7-fb20-4b8b-87da-b2e40127ce5a	6 Welch Pass	Room 97	Kanash	\N	429337	\N	2025-02-06 11:59:02.609+01	\N
45420f90-19cc-43cd-b98a-3bda1cad4c13	4452 Loeprich Trail	Apt 451	Upton	\N	DN21	\N	2025-02-06 11:59:02.639+01	\N
4fe832b3-b0f4-4bb3-9163-65bbc860f10c	\N	\N	\N	\N	\N	\N	2025-02-15 14:38:57.946657+01	\N
e9ef9e93-7bb3-40c3-9031-4df9bf4fba94	China 1	China 2	Hong Kong	CHN	100909	\N	2025-02-15 14:49:08.562228+01	\N
01353a9e-1465-42dc-94cb-3f75b7c1809b	665	657	567	ATA	567	\N	2025-02-15 14:58:10.772316+01	\N
02953828-14f2-4a5c-86f4-d0e49d659788	\N	\N	\N	\N	\N	\N	2025-02-15 15:10:06.76711+01	\N
7d301c95-0d2f-4557-a4c2-12851ee397a2	\N	\N	\N	\N	\N	\N	2025-02-15 15:44:20.070221+01	\N
df330b6d-680c-48be-b433-56687c65dac8	Superman Cave	A Mountain	Cryptonite	AGO	121Z	Customer Address	2025-03-03 19:02:13.405122+01	\N
60a57a23-8ed6-42ea-83d8-a33b5f0b15b7	\N	\N	\N	\N	\N	Customer Address	2025-03-05 13:30:55.16958+01	\N
758c5f57-2250-47c4-9a5f-3232b0d40317	Olofsgatan 21		Göteborg	SWE	41320	Customer Address	2025-03-13 22:45:05.992198+01	\N
\.


--
-- Data for Name: business_customers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.business_customers (business_customer_id, business_name, is_tax_registered, tax_number, created_at, updated_at) FROM stdin;
5c2532e6-4c28-4b25-92b6-3f07852d83cc	Strong Lab AB	f	\N	2025-02-06 11:59:02.298+01	\N
6e4b9c2c-46de-4dae-a6b9-5475f67c1164	Royal Resources CORP	f	\N	2025-02-06 11:59:02.359+01	\N
0b50d290-b92c-485c-b74c-29ca449d8a7b	Eco Hardware AB	f	\N	2025-02-06 11:59:02.396+01	\N
699321c5-d728-4cda-8f2c-15bd4f888f95	Efficient Management GT	t	602940448016518	2025-02-06 11:59:02.439+01	\N
f99a5319-bc57-4d60-aeea-5fdf636875b3	Epic Ventures AB	t	188944254448735	2025-02-06 11:59:02.477+01	\N
4ef451a0-38f7-41fa-b534-63d851d0db57	Pure Nations CORP	f	\N	2025-02-06 11:59:02.511+01	\N
f742a74c-36ee-41dc-994a-7e32974ff36f	Infinite Studios CORP	f	\N	2025-02-06 11:59:02.545+01	\N
46830460-2405-4087-b6c3-491bc19fa32d	Sunny Networks CORP	f	\N	2025-02-06 11:59:02.577+01	\N
8cb066e3-0f31-4d60-bb41-79c28c9f3b03	Hyper Culture LIMITED CORP	f	\N	2025-02-06 11:59:02.609+01	\N
ad3d2cc6-f9f9-48ca-a6b8-90c4b22c6cfb	Alpha Automation GT	f	\N	2025-02-06 11:59:02.639+01	\N
d327c596-8770-45e4-aa4a-407641e2a449	232123123	f	\N	2025-02-15 14:38:57.946657+01	\N
16ce2a91-62f1-4169-b249-9dc75d002a52	Big China Factory LLC TR	t	9989891	2025-02-15 14:49:08.562228+01	\N
32e0886f-5c03-47e0-9112-a6624ea9837a	rtyrty	t	6777868	2025-02-15 14:58:10.772316+01	\N
ca4d2392-c364-43ee-82e8-75b479cb279e	Ice Pops AB	f	\N	2025-02-15 15:10:06.76711+01	\N
9acf39a7-8689-4502-9114-efbe39abc306	safdssfdgfda	f	\N	2025-02-15 15:44:20.070221+01	\N
26701cd8-cab1-4de8-a2c7-48e27378e4bf	Joe's Brewery LLC	f	\N	2025-03-13 22:48:43.76605+01	\N
24a9b37c-0188-4e7d-a5b0-8d74209e4a3e	Lumberjack	f	\N	2025-03-14 01:30:22.961526+01	\N
d2fd6f90-b55b-4a33-bf7d-ee956333d75c	Jnj	f	\N	2025-03-26 20:22:44.970586+01	\N
\.


--
-- Data for Name: contact_details; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.contact_details (contact_details_id, contact_type, contact_data, is_primary, created_at, updated_at) FROM stdin;
3d5cc3cf-0355-4e97-ab2e-8475dcd020b8	email	mmcinally0@discuz.net	f	2025-02-06 11:59:02.298+01	2025-02-13 23:28:47.096+01
adffa376-7e9c-4238-9ad1-f283a35f4ef6	mobile	4207716999	f	2025-02-06 11:59:02.298+01	2025-02-13 23:28:47.096+01
66dfd445-7e20-4b04-8f8c-781ba67bbe45	email	jbabber1@globo.com	f	2025-02-06 11:59:02.359+01	2025-02-13 23:28:47.096+01
91b0e1e2-73bd-4364-a793-80245a87cd13	mobile	8094833331	f	2025-02-06 11:59:02.359+01	2025-02-13 23:28:47.096+01
39feb4df-e2eb-4309-9659-5a186d91333f	email	mmaccosty2@google.co.jp	f	2025-02-06 11:59:02.396+01	2025-02-13 23:28:47.096+01
cdee3a2c-129e-42fe-b8d2-8e93b431136f	mobile	8464041311	f	2025-02-06 11:59:02.396+01	2025-02-13 23:28:47.096+01
f5c236a9-a453-4e2c-9fd8-0860acc2621a	email	ppretious3@google.ca	f	2025-02-06 11:59:02.439+01	2025-02-13 23:28:47.096+01
3a6273e4-f388-4b23-9a20-fdd22a303666	mobile	4705022377	f	2025-02-06 11:59:02.439+01	2025-02-13 23:28:47.096+01
a45a4321-bec5-48ad-8866-64309c941edc	email	capril4@engadget.com	f	2025-02-06 11:59:02.477+01	2025-02-13 23:28:47.096+01
c15d73e3-ec81-4928-906c-d3c258be3b9b	mobile	6754469064	f	2025-02-06 11:59:02.477+01	2025-02-13 23:28:47.096+01
07e2bd67-d263-4385-b266-9c27786d07ae	email	wgewer5@washington.edu	f	2025-02-06 11:59:02.511+01	2025-02-13 23:28:47.096+01
99a4a1ea-0961-4ea7-99d1-dc74583d385f	mobile	9025593417	f	2025-02-06 11:59:02.511+01	2025-02-13 23:28:47.096+01
bf9f65d3-0a64-4a46-a62e-1fdf1ac99ff1	email	dfallowes6@blinklist.com	f	2025-02-06 11:59:02.545+01	2025-02-13 23:28:47.096+01
be467251-b440-4324-85d3-32aaa63a69a5	mobile	8837627818	f	2025-02-06 11:59:02.545+01	2025-02-13 23:28:47.096+01
7e1963d6-4c79-4217-93e1-bfeead3cae18	email	dprobert7@sourceforge.net	f	2025-02-06 11:59:02.577+01	2025-02-13 23:28:47.096+01
1a5d95d6-0b70-4d0d-9573-64112c804183	mobile	3794460300	f	2025-02-06 11:59:02.577+01	2025-02-13 23:28:47.096+01
58dfa2e3-c769-443e-959c-10136344442d	email	gbarnfield8@ed.gov	f	2025-02-06 11:59:02.609+01	2025-02-13 23:28:47.096+01
19b7c30e-5f09-4c12-9c1e-8382a4dcef72	mobile	1838030497	f	2025-02-06 11:59:02.609+01	2025-02-13 23:28:47.096+01
ebdc2b84-c3c9-4550-874c-5dba17718ffd	email	csindle9@webeden.co.uk	f	2025-02-06 11:59:02.639+01	2025-02-13 23:28:47.096+01
9e0586ff-71eb-45f8-8e51-5158134360e9	mobile	6942788564	f	2025-02-06 11:59:02.639+01	2025-02-13 23:28:47.096+01
ca09ce00-4e13-4acf-af80-8fd790461b7e	email	asdas@masdsasail.com	t	2025-02-15 14:38:57.946657+01	\N
94d7581d-db70-4034-b7e2-805a18278171	phone	+889700878	t	2025-02-15 14:49:08.562228+01	\N
e67fd289-3db2-42e1-b7df-e9814d3f81da	email	factory@big.cn	f	2025-02-15 14:49:08.562228+01	\N
6acf83bc-5c04-4ff8-a31e-5891ee8982f2	phone	676767676768888	t	2025-02-15 14:58:10.772316+01	\N
3feeb89f-c375-4005-ae9b-cbb164073b47	email	ice@pop.se	t	2025-02-15 15:10:06.76711+01	\N
72d5380b-9014-4ab9-9ca5-5fbfc553ada4	email	asdas@masdsasail.com	t	2025-02-15 15:44:20.070221+01	\N
e392bc3e-537d-4030-940a-2d01ab22f3a0	email	super@man.com	t	2025-03-03 19:02:13.405122+01	\N
4e0777e7-83e6-4dc0-9031-3021608f635d	email	email@superman.com	f	2025-03-03 19:02:13.405122+01	\N
a327287f-d112-4fa3-baf7-507119a6ec17	email	malooky23@gmail.com	t	2025-03-04 14:53:25.905216+01	\N
6d5a2d39-ba7c-4fc1-9c57-1fe43d3ecfdd	email	cargo@man.com	t	2025-03-05 13:30:55.16958+01	\N
d2c752ca-f0b1-4592-ab45-cdb2eb162465	email	Fredrik@mail.com	t	2025-03-13 22:45:05.992198+01	\N
823f204d-8264-4abf-978b-832a91f6d354	phone	9909998	t	2025-03-13 22:48:43.76605+01	\N
634a0077-61d7-4d7e-918c-3893b094d9a5	email	I@l.com	t	2025-03-14 01:30:22.961526+01	\N
3fe2ecc0-2052-425d-b2bb-4eadc0376c89	email	Email@hotmail.com	t	2025-03-26 20:22:44.970586+01	\N
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customers (customer_id, customer_number, customer_type, notes, country, created_at, updated_at, display_name, zoho_customer_id) FROM stdin;
0b50d290-b92c-485c-b74c-29ca449d8a7b	3	BUSINESS	\N	Philippines	2025-02-06 11:59:02.396+01	\N	Customer3	ZOHO_CUS_ID
21b12a6d-aa7b-4fea-a672-89b1bd67b280	18	INDIVIDUAL	\N	SE	2025-03-04 14:53:25.905216+01	\N	Test User	ZOHO_CUS_ID
46830460-2405-4087-b6c3-491bc19fa32d	8	BUSINESS	\N	Philippines	2025-02-06 11:59:02.577+01	\N	Customer8	ZOHO_CUS_ID
32e0886f-5c03-47e0-9112-a6624ea9837a	13	BUSINESS	rtyr	American Samoa	2025-02-15 14:58:10.772316+01	\N	Customer13	ZOHO_CUS_ID
16ce2a91-62f1-4169-b249-9dc75d002a52	12	BUSINESS	Please do not be slow with this customer! They are number 1.\nNo credit.	China	2025-02-15 14:49:08.562228+01	\N	Customer12	ZOHO_CUS_ID
24a9b37c-0188-4e7d-a5b0-8d74209e4a3e	24	BUSINESS	\N	Antarctica	2025-03-14 01:30:22.961526+01	\N	Lumberjack	ZOHO_CUS_ID
26701cd8-cab1-4de8-a2c7-48e27378e4bf	21	BUSINESS	\N	Czech Republic	2025-03-13 22:48:43.76605+01	\N	Joe's Brewery	ZOHO_CUS_ID
4ef451a0-38f7-41fa-b534-63d851d0db57	6	BUSINESS	\N	France	2025-02-06 11:59:02.511+01	\N	NilsEriksonTerminal	ZOHO_CUS_ID
5c2532e6-4c28-4b25-92b6-3f07852d83cc	1	BUSINESS	\N	China	2025-02-06 11:59:02.298+01	\N	Customer1	ZOHO_CUS_ID
699321c5-d728-4cda-8f2c-15bd4f888f95	4	BUSINESS	\N	Poland	2025-02-06 11:59:02.439+01	\N	Customer4	ZOHO_CUS_ID
6e4b9c2c-46de-4dae-a6b9-5475f67c1164	2	BUSINESS	\N	Philippines	2025-02-06 11:59:02.359+01	\N	Customer2	ZOHO_CUS_ID
47fa94e9-cc56-4f82-99df-a025f2603fb1	17	INDIVIDUAL	Secret Customer.	Angola	2025-03-03 19:02:13.405122+01	\N	SUPERMAN	ZOHO_CUS_ID
9acf39a7-8689-4502-9114-efbe39abc306	15	BUSINESS	\N	Albania	2025-02-15 15:44:20.070221+01	\N	Customer15	ZOHO_CUS_ID
ad3d2cc6-f9f9-48ca-a6b8-90c4b22c6cfb	10	BUSINESS	\N	United Kingdom	2025-02-06 11:59:02.639+01	\N	Customer10	ZOHO_CUS_ID
c0de8d84-e03d-4c4b-8731-49e0c0f016b5	19	INDIVIDUAL	\N	United Arab Emirates	2025-03-05 13:30:55.16958+01	\N	CargoMan	ZOHO_CUS_ID
ca4d2392-c364-43ee-82e8-75b479cb279e	14	BUSINESS	\N	Sweden	2025-02-15 15:10:06.76711+01	\N	Customer14	ZOHO_CUS_ID
8cb066e3-0f31-4d60-bb41-79c28c9f3b03	9	BUSINESS	\N	Russia	2025-02-06 11:59:02.609+01	\N	Customer9	ZOHO_CUS_ID
d327c596-8770-45e4-aa4a-407641e2a449	11	BUSINESS	123123123xvsdsdfsd\nsdfsdfsdfsdf\nsdfsdfsdf	Afghanistan	2025-02-15 14:38:57.946657+01	\N	Customer11	ZOHO_CUS_ID
f742a74c-36ee-41dc-994a-7e32974ff36f	7	BUSINESS	\N	Russia	2025-02-06 11:59:02.545+01	\N	Customer7	ZOHO_CUS_ID
f79bd8a3-f272-41cc-aaf2-e1aee9900022	20	INDIVIDUAL	\N	Sweden	2025-03-13 22:45:05.992198+01	\N	FredrikOlson	ZOHO_CUS_ID
f99a5319-bc57-4d60-aeea-5fdf636875b3	5	BUSINESS	\N	Philippines	2025-02-06 11:59:02.477+01	\N	Customer5	ZOHO_CUS_ID
d2fd6f90-b55b-4a33-bf7d-ee956333d75c	28	BUSINESS	\N	Anguilla	2025-03-26 20:22:44.970586+01	\N	Uj	ZOHO_CUS_ID
\.


--
-- Data for Name: deleted_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.deleted_items (item_id, deleted_at) FROM stdin;
\.


--
-- Data for Name: entity_addresses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.entity_addresses (id, entity_id, entity_type, address_id, created_at) FROM stdin;
1d0007a1-0124-419c-a319-57615ef021e3	5c2532e6-4c28-4b25-92b6-3f07852d83cc	CUSTOMER	59f476bd-0f18-49eb-ad51-194382914b7c	2025-02-06 11:59:02.298+01
73b4de60-48bc-45f0-995b-a7c63cd64080	6e4b9c2c-46de-4dae-a6b9-5475f67c1164	CUSTOMER	36f0adf1-7946-48c9-879b-2af5c3ee2570	2025-02-06 11:59:02.359+01
d139bd91-6f73-4633-a0b3-cd71e4e881e8	0b50d290-b92c-485c-b74c-29ca449d8a7b	CUSTOMER	8d0a73b1-789d-4368-9e08-4b6357370a5f	2025-02-06 11:59:02.396+01
51b6f497-abb2-47de-b1fe-6c348cde561d	699321c5-d728-4cda-8f2c-15bd4f888f95	CUSTOMER	c351c785-d47d-4e5c-a25e-72fe66d2be66	2025-02-06 11:59:02.439+01
6cced1f5-b071-4fe7-9126-1049c52b8d3b	f99a5319-bc57-4d60-aeea-5fdf636875b3	CUSTOMER	104adeb7-2a04-4994-9b26-533b000d7b45	2025-02-06 11:59:02.477+01
e8c4f0f0-cc36-4766-a129-1666cea4edae	4ef451a0-38f7-41fa-b534-63d851d0db57	CUSTOMER	209f602a-e32d-495d-a5d7-304b5098e895	2025-02-06 11:59:02.511+01
5c040138-e88c-4be4-b61e-002aec220d7c	f742a74c-36ee-41dc-994a-7e32974ff36f	CUSTOMER	df160bb6-620e-45d5-af32-58c87b956de3	2025-02-06 11:59:02.545+01
b56b9e2e-d5bb-4505-9a5b-bc3484130a06	46830460-2405-4087-b6c3-491bc19fa32d	CUSTOMER	c30abf20-9574-4777-aa35-25975121f794	2025-02-06 11:59:02.577+01
eb4df78a-7af8-407e-aa54-3a629c4fbed3	8cb066e3-0f31-4d60-bb41-79c28c9f3b03	CUSTOMER	24054ea7-fb20-4b8b-87da-b2e40127ce5a	2025-02-06 11:59:02.609+01
980950c5-5210-4761-b4af-6633383ef1b8	ad3d2cc6-f9f9-48ca-a6b8-90c4b22c6cfb	CUSTOMER	45420f90-19cc-43cd-b98a-3bda1cad4c13	2025-02-06 11:59:02.639+01
15f17b3d-1cf2-4a39-b3e5-6f341a875d84	d327c596-8770-45e4-aa4a-407641e2a449	CUSTOMER	4fe832b3-b0f4-4bb3-9163-65bbc860f10c	2025-02-15 14:38:57.946657+01
72c93946-b72e-46fd-a647-69f8569c833f	16ce2a91-62f1-4169-b249-9dc75d002a52	CUSTOMER	e9ef9e93-7bb3-40c3-9031-4df9bf4fba94	2025-02-15 14:49:08.562228+01
6194f4de-1576-435f-9069-f6983b23cb86	32e0886f-5c03-47e0-9112-a6624ea9837a	CUSTOMER	01353a9e-1465-42dc-94cb-3f75b7c1809b	2025-02-15 14:58:10.772316+01
5038f1f0-ffdf-47f1-bd14-96802d3a67f8	ca4d2392-c364-43ee-82e8-75b479cb279e	CUSTOMER	02953828-14f2-4a5c-86f4-d0e49d659788	2025-02-15 15:10:06.76711+01
08ac8e0a-a4db-4774-be7e-7afda79e4953	9acf39a7-8689-4502-9114-efbe39abc306	CUSTOMER	7d301c95-0d2f-4557-a4c2-12851ee397a2	2025-02-15 15:44:20.070221+01
329f8fc8-e94b-46d8-bd73-8f4218586a0f	47fa94e9-cc56-4f82-99df-a025f2603fb1	CUSTOMER	df330b6d-680c-48be-b433-56687c65dac8	2025-03-03 19:02:13.405122+01
7b4e5665-6061-49bf-96d6-6f3ffcde5bd9	c0de8d84-e03d-4c4b-8731-49e0c0f016b5	CUSTOMER	60a57a23-8ed6-42ea-83d8-a33b5f0b15b7	2025-03-05 13:30:55.16958+01
574fc96e-8770-49d9-91ea-ce0e3553e76e	f79bd8a3-f272-41cc-aaf2-e1aee9900022	CUSTOMER	758c5f57-2250-47c4-9a5f-3232b0d40317	2025-03-13 22:45:05.992198+01
\.


--
-- Data for Name: entity_contact_details; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.entity_contact_details (id, entity_id, entity_type, contact_details_id, contact_type, created_at) FROM stdin;
b0c9fb61-3051-4b0b-9fce-97e974a99814	5c2532e6-4c28-4b25-92b6-3f07852d83cc	CUSTOMER	3d5cc3cf-0355-4e97-ab2e-8475dcd020b8	\N	2025-02-06 11:59:02.298+01
cc4267f2-57c5-4bc2-9dd2-ba364cbf3587	5c2532e6-4c28-4b25-92b6-3f07852d83cc	CUSTOMER	adffa376-7e9c-4238-9ad1-f283a35f4ef6	\N	2025-02-06 11:59:02.298+01
768e3625-14fe-4545-8fd3-9e7299d99cfb	6e4b9c2c-46de-4dae-a6b9-5475f67c1164	CUSTOMER	66dfd445-7e20-4b04-8f8c-781ba67bbe45	\N	2025-02-06 11:59:02.359+01
736f7cc1-2d8b-4c70-a58b-4f26384e8576	6e4b9c2c-46de-4dae-a6b9-5475f67c1164	CUSTOMER	91b0e1e2-73bd-4364-a793-80245a87cd13	\N	2025-02-06 11:59:02.359+01
d73947a5-eb6a-4724-a375-09755a9f88cb	0b50d290-b92c-485c-b74c-29ca449d8a7b	CUSTOMER	39feb4df-e2eb-4309-9659-5a186d91333f	\N	2025-02-06 11:59:02.396+01
b71f3cc8-448a-4c9e-bb22-abb9b0280adf	0b50d290-b92c-485c-b74c-29ca449d8a7b	CUSTOMER	cdee3a2c-129e-42fe-b8d2-8e93b431136f	\N	2025-02-06 11:59:02.396+01
22eb560f-aab0-4321-b30e-8cb03f03dd15	699321c5-d728-4cda-8f2c-15bd4f888f95	CUSTOMER	f5c236a9-a453-4e2c-9fd8-0860acc2621a	\N	2025-02-06 11:59:02.439+01
0e014a65-39a8-4909-9418-194a3c318d0d	699321c5-d728-4cda-8f2c-15bd4f888f95	CUSTOMER	3a6273e4-f388-4b23-9a20-fdd22a303666	\N	2025-02-06 11:59:02.439+01
58c35f22-97ee-41e2-b5fd-26827896cdfe	f99a5319-bc57-4d60-aeea-5fdf636875b3	CUSTOMER	a45a4321-bec5-48ad-8866-64309c941edc	\N	2025-02-06 11:59:02.477+01
c7e1af33-6d77-4b9b-89d5-fd7c7484f099	f99a5319-bc57-4d60-aeea-5fdf636875b3	CUSTOMER	c15d73e3-ec81-4928-906c-d3c258be3b9b	\N	2025-02-06 11:59:02.477+01
6e202752-46d5-406e-9c2c-8d8453594b0e	4ef451a0-38f7-41fa-b534-63d851d0db57	CUSTOMER	07e2bd67-d263-4385-b266-9c27786d07ae	\N	2025-02-06 11:59:02.511+01
1123b549-288b-42e8-9042-65bcc97be810	4ef451a0-38f7-41fa-b534-63d851d0db57	CUSTOMER	99a4a1ea-0961-4ea7-99d1-dc74583d385f	\N	2025-02-06 11:59:02.511+01
a4cd4b35-33c1-4350-93d3-ac4c7448197d	f742a74c-36ee-41dc-994a-7e32974ff36f	CUSTOMER	bf9f65d3-0a64-4a46-a62e-1fdf1ac99ff1	\N	2025-02-06 11:59:02.545+01
5f3823f0-9308-473a-9bb5-3d04cc0b5f2b	f742a74c-36ee-41dc-994a-7e32974ff36f	CUSTOMER	be467251-b440-4324-85d3-32aaa63a69a5	\N	2025-02-06 11:59:02.545+01
4b3c3b67-4cce-4c10-8ca4-fcc8e8fd8200	46830460-2405-4087-b6c3-491bc19fa32d	CUSTOMER	7e1963d6-4c79-4217-93e1-bfeead3cae18	\N	2025-02-06 11:59:02.577+01
18a2d238-54d2-44cb-8d20-b2374766d545	46830460-2405-4087-b6c3-491bc19fa32d	CUSTOMER	1a5d95d6-0b70-4d0d-9573-64112c804183	\N	2025-02-06 11:59:02.577+01
d74f9223-13bc-4b6e-83eb-939713e84f19	8cb066e3-0f31-4d60-bb41-79c28c9f3b03	CUSTOMER	58dfa2e3-c769-443e-959c-10136344442d	\N	2025-02-06 11:59:02.609+01
80a1c8ac-b087-46bf-bd52-64096845c5ee	8cb066e3-0f31-4d60-bb41-79c28c9f3b03	CUSTOMER	19b7c30e-5f09-4c12-9c1e-8382a4dcef72	\N	2025-02-06 11:59:02.609+01
088908c5-95e8-4869-8d17-39e6caa0872b	ad3d2cc6-f9f9-48ca-a6b8-90c4b22c6cfb	CUSTOMER	ebdc2b84-c3c9-4550-874c-5dba17718ffd	\N	2025-02-06 11:59:02.639+01
213f80db-bbe7-49ff-9822-adb575c87724	ad3d2cc6-f9f9-48ca-a6b8-90c4b22c6cfb	CUSTOMER	9e0586ff-71eb-45f8-8e51-5158134360e9	\N	2025-02-06 11:59:02.639+01
2139e701-f052-4dcf-bfb3-34ad2bda0791	d327c596-8770-45e4-aa4a-407641e2a449	CUSTOMER	ca09ce00-4e13-4acf-af80-8fd790461b7e	\N	2025-02-15 14:38:57.946657+01
15d4e7c7-5379-405f-8419-f45a409b1897	16ce2a91-62f1-4169-b249-9dc75d002a52	CUSTOMER	94d7581d-db70-4034-b7e2-805a18278171	\N	2025-02-15 14:49:08.562228+01
85ee27da-2b52-47da-99f3-9080ac601885	16ce2a91-62f1-4169-b249-9dc75d002a52	CUSTOMER	e67fd289-3db2-42e1-b7df-e9814d3f81da	\N	2025-02-15 14:49:08.562228+01
4ff7385b-4e56-42b3-be47-9f2144c88efc	32e0886f-5c03-47e0-9112-a6624ea9837a	CUSTOMER	6acf83bc-5c04-4ff8-a31e-5891ee8982f2	\N	2025-02-15 14:58:10.772316+01
6c8c6302-ea2f-4af6-994c-67184dfda7d2	ca4d2392-c364-43ee-82e8-75b479cb279e	CUSTOMER	3feeb89f-c375-4005-ae9b-cbb164073b47	\N	2025-02-15 15:10:06.76711+01
88cb45a8-3c4d-4bc3-bd2a-4f6420ee1629	9acf39a7-8689-4502-9114-efbe39abc306	CUSTOMER	72d5380b-9014-4ab9-9ca5-5fbfc553ada4	\N	2025-02-15 15:44:20.070221+01
eaef9d01-3015-4157-a585-ce0b10218786	47fa94e9-cc56-4f82-99df-a025f2603fb1	CUSTOMER	e392bc3e-537d-4030-940a-2d01ab22f3a0	email	2025-03-03 19:02:13.405122+01
cd02c7c5-f1c9-4620-a8df-15f54b2019a4	47fa94e9-cc56-4f82-99df-a025f2603fb1	CUSTOMER	4e0777e7-83e6-4dc0-9031-3021608f635d	email	2025-03-03 19:02:13.405122+01
3afb9645-68f3-4297-987f-989dbab34166	21b12a6d-aa7b-4fea-a672-89b1bd67b280	CUSTOMER	a327287f-d112-4fa3-baf7-507119a6ec17	email	2025-03-04 14:53:25.905216+01
fff9bff1-dee9-47e1-ba33-c0b8676a48f1	c0de8d84-e03d-4c4b-8731-49e0c0f016b5	CUSTOMER	6d5a2d39-ba7c-4fc1-9c57-1fe43d3ecfdd	email	2025-03-05 13:30:55.16958+01
50e4b3a2-066c-4e66-845f-0e7bcbea67e1	f79bd8a3-f272-41cc-aaf2-e1aee9900022	CUSTOMER	d2c752ca-f0b1-4592-ab45-cdb2eb162465	email	2025-03-13 22:45:05.992198+01
5a6d8d10-3f15-489b-87fd-28eaf932eda6	26701cd8-cab1-4de8-a2c7-48e27378e4bf	CUSTOMER	823f204d-8264-4abf-978b-832a91f6d354	phone	2025-03-13 22:48:43.76605+01
a6fa3750-381a-427e-85de-b0a2ad51977d	24a9b37c-0188-4e7d-a5b0-8d74209e4a3e	CUSTOMER	634a0077-61d7-4d7e-918c-3893b094d9a5	email	2025-03-14 01:30:22.961526+01
cd050cdd-df90-452c-8d1c-198d9d672313	d2fd6f90-b55b-4a33-bf7d-ee956333d75c	CUSTOMER	3fe2ecc0-2052-425d-b2bb-4eadc0376c89	email	2025-03-26 20:22:44.970586+01
\.


--
-- Data for Name: expense_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expense_items (expense_item_id, expense_name, default_expense_price, expense_category, notes, created_by, created_at, updated_at, zoho_item_id, "zohoTaxId") FROM stdin;
1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	Sack Small	5	PACKING	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 19:02:34.123518+02	\N	\N	5293485000000114027
480b45ef-9bcc-4311-9db9-47941a0600bb	Labour Full Day	100	LABOUR	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 19:02:34.123518+02	\N	\N	5293485000000114027
969f409b-c721-43a1-b0a3-40950b8434fe	Forklift Offloading	10	FORKLIFT	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 19:02:34.123518+02	\N	\N	5293485000000114027
35608ed0-5472-4fc5-ae7d-049d9d46453b	Sack Large	10	PACKING	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 19:02:34.123518+02	\N	\N	5293485000000114027
333b18b5-486a-41fa-9360-aa7b404e12d0	Forklift Loading	10	FORKLIFT	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-23 00:15:40.121894+02	\N	5293485000000589697	5293485000000114027
\.


--
-- Data for Name: individual_customers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.individual_customers (individual_customer_id, first_name, middle_name, last_name, personal_id, created_at, updated_at) FROM stdin;
47fa94e9-cc56-4f82-99df-a025f2603fb1	Super	\N	Man	1100011	2025-03-03 19:02:13.405122+01	\N
21b12a6d-aa7b-4fea-a672-89b1bd67b280	Test	\N	User	\N	2025-03-04 14:53:25.905216+01	\N
c0de8d84-e03d-4c4b-8731-49e0c0f016b5	Cargo	\N	Man		2025-03-05 13:30:55.16958+01	\N
f79bd8a3-f272-41cc-aaf2-e1aee9900022	Fredrik	\N	Olson	199292	2025-03-13 22:45:05.992198+01	\N
\.


--
-- Data for Name: item_stock; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.item_stock (item_id, location_id, current_quantity, last_updated, last_movement_id, last_reconciliation_at, last_reconciliation_by) FROM stdin;
974798bd-5e8e-4edb-9536-56218186f156	4e176e92-e833-44f5-aea9-0537f980fb4b	0	2025-02-26 01:39:40.000935+01	\N	\N	\N
c71dff36-8d15-42e6-bdb9-9dc895a1508f	4e176e92-e833-44f5-aea9-0537f980fb4b	0	2025-02-26 01:39:40.67013+01	\N	\N	\N
d68d70c0-41a4-425f-97ee-98f3e51b279f	4e176e92-e833-44f5-aea9-0537f980fb4b	0	2025-02-26 01:39:41.2123+01	\N	\N	\N
fc451ae0-5753-4414-886d-b13e2e19a429	4e176e92-e833-44f5-aea9-0537f980fb4b	0	2025-02-26 01:39:41.755716+01	\N	\N	\N
9bf99bd4-6bac-4c45-8e4e-e1ce7c0192dd	4e176e92-e833-44f5-aea9-0537f980fb4b	0	2025-03-23 12:48:21.74446+01	\N	\N	\N
e5048e03-378c-4b54-b5e5-c6198ce728c6	4e176e92-e833-44f5-aea9-0537f980fb4b	0	2025-02-26 21:01:23.027151+01	73e8ddfd-61b8-4400-b307-38ad2b029884	\N	\N
0a408a8c-7219-4589-ae5e-2b1c3c8848d0	4e176e92-e833-44f5-aea9-0537f980fb4b	345	2025-03-11 14:55:06.352+01	33fee64a-2337-4691-b64c-062b9f9c41b2	\N	\N
d1600c44-73cc-4630-a978-d59c36097954	4e176e92-e833-44f5-aea9-0537f980fb4b	0	2025-03-11 21:42:05.05349+01	6a032cc4-c2fd-42e4-9953-cf6e00e37940	\N	\N
36c7a838-779c-4aef-a934-5b847242906e	4e176e92-e833-44f5-aea9-0537f980fb4b	110	2025-03-11 23:04:40.239524+01	3aa0a26e-b714-4928-a640-420e61874b64	\N	\N
86f64e5d-0d86-4549-b3a1-41b01af4ce31	4e176e92-e833-44f5-aea9-0537f980fb4b	100	2025-03-02 16:55:00.258819+01	64afa0ce-d7b7-4881-ab10-785f535d509e	\N	\N
36de253f-52b6-4f3c-bece-a415c010636a	4e176e92-e833-44f5-aea9-0537f980fb4b	700	2025-03-04 19:06:31.349602+01	008122af-6129-4f04-8c27-330e19f6f615	\N	\N
d38771e5-024b-44c8-93e4-95b44bb52a04	4e176e92-e833-44f5-aea9-0537f980fb4b	7	2025-03-05 13:10:37.306137+01	21854905-1897-4b3e-bb2e-32d13700914d	\N	\N
98e8ab74-8b99-4b55-a85f-bb97699bc806	4e176e92-e833-44f5-aea9-0537f980fb4b	0	2025-03-13 10:51:37.384069+01	\N	\N	\N
92226cb9-df00-4212-9d36-30b3b94d1c19	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-03-05 20:25:58.197226+01	72ff5479-519e-4dab-903b-b852a068cd50	\N	\N
24ccbb68-b391-46cf-b76b-c524e93f5de9	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-07 19:07:37.396899+02	78632bb6-1d7d-4b9a-b532-1161b5db80b6	\N	\N
a90eb711-65d4-4e9a-9cdd-105e13e2869a	4e176e92-e833-44f5-aea9-0537f980fb4b	0	2025-04-09 18:15:42.316388+02	\N	\N	\N
8c9f2597-ebfa-40e3-b584-9f74bfba0d01	4e176e92-e833-44f5-aea9-0537f980fb4b	0	2025-04-09 19:00:41.049421+02	\N	\N	\N
23f898dc-26f3-478b-b294-c20f638a9706	4e176e92-e833-44f5-aea9-0537f980fb4b	799	2025-04-10 22:36:43.348162+02	ccba2779-e6bf-4c8b-9928-f3081d29a7ef	\N	\N
406843e4-8e07-46ff-a9db-2addcbe781ea	4e176e92-e833-44f5-aea9-0537f980fb4b	19	2025-04-10 23:37:30.279445+02	406694e9-769e-48f1-a129-999132066d0a	\N	\N
ce661bda-db85-48a9-be57-69a435014213	4e176e92-e833-44f5-aea9-0537f980fb4b	15	2025-04-10 23:37:30.279445+02	89214457-767e-43aa-8341-52d4c0c94364	\N	\N
41b8fd1a-0927-4fb9-8d89-ced69f87c2d3	4e176e92-e833-44f5-aea9-0537f980fb4b	14	2025-04-10 23:37:30.279445+02	9f37747f-9364-478c-a73b-a23f0d5f62d1	\N	\N
63678a82-5e9c-4290-82b7-4b7e901966b9	4e176e92-e833-44f5-aea9-0537f980fb4b	15	2025-04-10 23:37:30.279445+02	83dca4cf-db56-481c-9ecb-4df031a84dae	\N	\N
e9c8f943-7dae-4e3e-87eb-96e883d2a14b	4e176e92-e833-44f5-aea9-0537f980fb4b	3	2025-04-10 23:37:30.279445+02	763eae2c-c78a-445e-bc9c-2494a2cce233	\N	\N
7759dc13-bafa-42f3-97ed-c6ab38785952	4e176e92-e833-44f5-aea9-0537f980fb4b	9766111	2025-04-10 23:41:03.19803+02	11e3636b-8a9e-4705-8844-9dfda61b1590	\N	\N
0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	79	2025-04-11 00:10:11.034387+02	b7756936-8c7e-43b6-b17b-3e4adca1736e	\N	\N
7e5f826d-21b2-4d71-b2f8-cd6aaeda9a17	4e176e92-e833-44f5-aea9-0537f980fb4b	79	2025-04-11 00:31:03.59855+02	770c3f21-2f68-4ab4-b559-d2d8cecd69ae	\N	\N
e0c59fd2-7c23-4fe8-9f48-a5554c5a57cb	4e176e92-e833-44f5-aea9-0537f980fb4b	0	2025-04-11 15:07:35.511905+02	\N	\N	\N
6fa123ce-7601-411f-bde3-19ee0dd15374	4e176e92-e833-44f5-aea9-0537f980fb4b	2	2025-04-11 19:46:41.398797+02	63a34b1b-bb94-43bd-845f-a44fce241de9	\N	\N
29014a07-c465-420d-b28b-aa9c99d911d5	4e176e92-e833-44f5-aea9-0537f980fb4b	0	2025-04-12 10:05:05.343952+02	ac3ef53b-0b56-4c7e-8c5e-8cccc03cc32a	\N	\N
6b5df264-449c-456b-a9ab-a10cdfea6690	4e176e92-e833-44f5-aea9-0537f980fb4b	0	2025-04-12 20:18:43.414723+02	425fddcc-7443-4426-8a7d-55823f7d3be4	\N	\N
99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	601	2025-04-12 20:35:00.604527+02	f985f27b-96d0-4de3-9d30-13d7efdf7a97	\N	\N
ecbe279d-ac06-4eee-a87e-bbe9cbc57b89	4e176e92-e833-44f5-aea9-0537f980fb4b	0	2025-04-13 00:27:13.836741+02	\N	\N	\N
3792bb92-b18f-457b-b99f-f063d5e70dc4	4e176e92-e833-44f5-aea9-0537f980fb4b	0	2025-04-13 18:06:45.535631+02	\N	\N	\N
00fe3e65-2e6e-4e34-8213-bac42ad4d943	bcafce7b-055c-4fec-a339-6a2b192bda54	100	2025-04-16 17:28:10.173054+02	\N	\N	\N
00fe3e65-2e6e-4e34-8213-bac42ad4d943	4e176e92-e833-44f5-aea9-0537f980fb4b	0	2025-04-16 17:29:51.105196+02	218fde5a-6940-458a-bac0-3ea9019c5456	\N	\N
e36c5e32-4990-4b86-a7d1-143b9c1bf8ac	4e176e92-e833-44f5-aea9-0537f980fb4b	8	2025-04-16 20:41:10.305276+02	084e8cc2-b8c1-42a2-94fe-e59c28a94a92	\N	\N
89bc83f4-0420-48cf-b3e5-2013d7216da3	4e176e92-e833-44f5-aea9-0537f980fb4b	71	2025-04-16 20:41:31.966742+02	296c35f6-9ac7-4bda-8ea7-b81e6f72de9d	\N	\N
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.items (item_id, item_number, item_name, item_brand, item_model, item_barcode, item_country_of_origin, dimensions, weight_grams, customer_id, notes, created_by, created_at, updated_at, is_deleted, item_type) FROM stdin;
99d8b319-2d59-4ada-b1af-03bfbed67348	1	sun glasses	McKesson	Berkshire Hathaway	758183506	Trinidad and Tobago	{"width":175,"height":190,"length":697}	105592	8cb066e3-0f31-4d60-bb41-79c28c9f3b03	this is a purely random note for sure	d0213a35-d458-48df-aaaf-85716857d101	2025-02-15 11:07:24.647463+01	\N	f	CARTON
36c7a838-779c-4aef-a934-5b847242906e	2	chapter book	McKesson	AT&T	797157004	Tokelau	{"width":572,"height":523,"length":487}	100961	8cb066e3-0f31-4d60-bb41-79c28c9f3b03	this is a purely random note for sure	d0213a35-d458-48df-aaaf-85716857d101	2025-02-15 11:08:39.261367+01	\N	f	CARTON
92226cb9-df00-4212-9d36-30b3b94d1c19	3	packing peanuts	CVS Health	UnitedHealth Group	258624794	Zambia	{"width":632,"height":987,"length":585}	106539	46830460-2405-4087-b6c3-491bc19fa32d	this is a purely random note for sure	d0213a35-d458-48df-aaaf-85716857d101	2025-02-15 11:08:47.598657+01	\N	f	CARTON
974798bd-5e8e-4edb-9536-56218186f156	4	shirt	UnitedHealth Group	AT&T	437419070	Saint Lucia	{"width":576,"height":241,"length":442}	107105	0b50d290-b92c-485c-b74c-29ca449d8a7b	this is a purely random note for sure	d0213a35-d458-48df-aaaf-85716857d101	2025-02-15 11:08:50.362908+01	\N	f	CARTON
e5048e03-378c-4b54-b5e5-c6198ce728c6	5	mp3 player	AmerisourceBergen	Amazon.com	367753128	Kyrgyzstan	{"width":622,"height":200,"length":592}	101821	5c2532e6-4c28-4b25-92b6-3f07852d83cc	this is a purely random note for sure	d0213a35-d458-48df-aaaf-85716857d101	2025-02-15 11:08:51.953331+01	\N	f	CARTON
36de253f-52b6-4f3c-bece-a415c010636a	6	helmet	Berkshire Hathaway	CVS Health	109375659	Gibraltar	{"width":53,"height":174,"length":417}	107849	699321c5-d728-4cda-8f2c-15bd4f888f95	this is a purely random note for sure	d0213a35-d458-48df-aaaf-85716857d101	2025-02-15 11:08:54.123425+01	\N	f	CARTON
d68d70c0-41a4-425f-97ee-98f3e51b279f	7	tooth picks	AT&T	AT&T	924075232	Qatar	{"width":753,"height":644,"length":329}	103552	ad3d2cc6-f9f9-48ca-a6b8-90c4b22c6cfb	this is a purely random note for sure	d0213a35-d458-48df-aaaf-85716857d101	2025-02-15 11:08:56.151091+01	\N	f	CARTON
86f64e5d-0d86-4549-b3a1-41b01af4ce31	8	fake flowers	AmerisourceBergen	AT&T	223380573	Brunei Darussalam	{"width":490,"height":808,"length":326}	101754	4ef451a0-38f7-41fa-b534-63d851d0db57	this is a purely random note for sure	d0213a35-d458-48df-aaaf-85716857d101	2025-02-15 11:08:57.252354+01	\N	f	CARTON
d1600c44-73cc-4630-a978-d59c36097954	9	sidewalk	Apple	CVS Health	710465336	Marshall Islands (the)	{"width":199,"height":217,"length":888}	105593	0b50d290-b92c-485c-b74c-29ca449d8a7b	this is a purely random note for sure	d0213a35-d458-48df-aaaf-85716857d101	2025-02-15 11:08:57.891056+01	\N	f	CARTON
29014a07-c465-420d-b28b-aa9c99d911d5	10	clock	AT&T	AmerisourceBergen	912359689	Argentina	{"width":759,"height":1025,"length":992}	107797	699321c5-d728-4cda-8f2c-15bd4f888f95	this is a purely random note for sure	d0213a35-d458-48df-aaaf-85716857d101	2025-02-15 11:09:15.066629+01	\N	f	CARTON
c71dff36-8d15-42e6-bdb9-9dc895a1508f	11	Flipper	Zero Tech	Flipper 01 Pro	1009099921	China	{"width":10,"height":50,"length":40}	500	46830460-2405-4087-b6c3-491bc19fa32d	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-02-20 18:07:07.228412+01	\N	f	CARTON
fc451ae0-5753-4414-886d-b13e2e19a429	12	WATER GLASS CARBON FILTER	\N	\N	\N	\N	{"width":0,"height":0,"length":0}	0	5c2532e6-4c28-4b25-92b6-3f07852d83cc	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-02-20 18:09:30.353752+01	\N	f	CARTON
d38771e5-024b-44c8-93e4-95b44bb52a04	13	heaters	\N	\N	\N	\N	\N	0	f742a74c-36ee-41dc-994a-7e32974ff36f	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-02-26 19:37:05.115002+01	\N	f	CARTON
0a408a8c-7219-4589-ae5e-2b1c3c8848d0	14	fff	ff	ffff	234	fff	{"width":3,"height":3,"length":1}	231	9acf39a7-8689-4502-9114-efbe39abc306	fff	dba7ee11-ec92-4d95-9f5c-6d3b2af80f1a	2025-02-27 21:54:43.148303+01	\N	f	CARTON
0c4ce288-4c9f-467f-8b8d-c80149c7864a	15	Super Secret 	Superman	UNKNOWN	\N	China	{"width":1231,"height":11233,"length":9123}	0	47fa94e9-cc56-4f82-99df-a025f2603fb1	Secret item for superman!	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-03 19:04:08.511247+01	\N	f	CARTON
406843e4-8e07-46ff-a9db-2addcbe781ea	16	BOCO themed vests 	Patagonia	\N	\N	\N	\N	0	47fa94e9-cc56-4f82-99df-a025f2603fb1	\N	d2bc0533-2d03-4083-8188-e19cd504d256	2025-03-03 20:01:09.752406+01	\N	f	CARTON
ce661bda-db85-48a9-be57-69a435014213	17	Cloak	\N	\N	\N	\N	\N	0	47fa94e9-cc56-4f82-99df-a025f2603fb1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-04 14:51:10.564883+01	\N	f	CARTON
e36c5e32-4990-4b86-a7d1-143b9c1bf8ac	18	Cloak V2	\N	\N	\N	\N	\N	0	47fa94e9-cc56-4f82-99df-a025f2603fb1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-04 14:52:07.386066+01	\N	f	CARTON
63678a82-5e9c-4290-82b7-4b7e901966b9	19	Super Weapons	Superman	EXT-668	0019892025	UAE	{"width":1000,"height":1500,"length":2000}	109000	47fa94e9-cc56-4f82-99df-a025f2603fb1	Superman king	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-12 19:30:30.914366+01	\N	f	CARTON
41b8fd1a-0927-4fb9-8d89-ced69f87c2d3	20	Laser Shield	Supermaaaaan	XL LASER 	Peew	UAE	\N	99999	47fa94e9-cc56-4f82-99df-a025f2603fb1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-12 21:03:49.702541+01	\N	f	CARTON
e9c8f943-7dae-4e3e-87eb-96e883d2a14b	21	X6xyhhch 	Helooitsm3	34567	123456789	UAE	\N	10	47fa94e9-cc56-4f82-99df-a025f2603fb1	\N	2baac369-9752-4112-a0d8-2e6b3b25c9ff	2025-03-13 00:28:54.673116+01	\N	f	CARTON
7759dc13-bafa-42f3-97ed-c6ab38785952	22	Fu jbtxdtdxtyxyx	\N	\N	\N	UAE	\N	10000	9acf39a7-8689-4502-9114-efbe39abc306	\N	2baac369-9752-4112-a0d8-2e6b3b25c9ff	2025-03-13 00:29:44.218806+01	\N	f	CARTON
00fe3e65-2e6e-4e34-8213-bac42ad4d943	23	Ur moms plov	Umarova’s kitchen	1	E3st5VH	Sweden	{"width":50,"height":50,"length":50}	5000	47fa94e9-cc56-4f82-99df-a025f2603fb1	Ship to Ashley. Thank you. 	2e964450-0a4d-4c6c-9097-46856f5a98c5	2025-03-13 01:48:45.894019+01	\N	f	CARTON
98e8ab74-8b99-4b55-a85f-bb97699bc806	24	Vacuum Cleaners	Dyson	V12	119909098882	China	\N	\N	699321c5-d728-4cda-8f2c-15bd4f888f95	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-13 10:51:37.384069+01	\N	f	CARTON
23f898dc-26f3-478b-b294-c20f638a9706	25	Black Toyota Landcruiser	Toyota	Landcruiser GHX	VX9980239XZ	UAE	{"width":230,"height":200,"length":520}	2513000	26701cd8-cab1-4de8-a2c7-48e27378e4bf	Big Car	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-13 22:50:17.593851+01	\N	f	CARTON
7e5f826d-21b2-4d71-b2f8-cd6aaeda9a17	26	iPhone 6s	Apple	A1335	Gghggh	UAE	\N	\N	c0de8d84-e03d-4c4b-8731-49e0c0f016b5	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-14 18:18:49.086689+01	\N	f	CARTON
9bf99bd4-6bac-4c45-8e4e-e1ce7c0192dd	27	Latte	\N	\N	\N	UAE	\N	\N	f79bd8a3-f272-41cc-aaf2-e1aee9900022	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-23 12:48:21.74446+01	\N	f	CARTON
24ccbb68-b391-46cf-b76b-c524e93f5de9	28	CargoBox	\N	\N	\N	UAE	\N	\N	c0de8d84-e03d-4c4b-8731-49e0c0f016b5	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-03 15:06:43.403654+02	\N	f	CARTON
a90eb711-65d4-4e9a-9cdd-105e13e2869a	29	Green Tables	\N	\N	\N	UAE	{}	\N	26701cd8-cab1-4de8-a2c7-48e27378e4bf	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-09 18:15:42.316388+02	\N	f	CARTON
89bc83f4-0420-48cf-b3e5-2013d7216da3	30	Face masks	\N	\N	\N	UAE	{}	\N	47fa94e9-cc56-4f82-99df-a025f2603fb1	\N	d2bc0533-2d03-4083-8188-e19cd504d256	2025-04-09 18:17:51.551415+02	\N	f	CARTON
8c9f2597-ebfa-40e3-b584-9f74bfba0d01	31	qweqwewe	\N	\N	\N	UAE	{}	\N	26701cd8-cab1-4de8-a2c7-48e27378e4bf	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-09 19:00:41.049421+02	\N	f	CARTON
6b5df264-449c-456b-a9ab-a10cdfea6690	32	Face Masks	\N	\N	\N	UAE	{}	\N	24a9b37c-0188-4e7d-a5b0-8d74209e4a3e	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-09 19:01:00.917335+02	\N	f	CARTON
6fa123ce-7601-411f-bde3-19ee0dd15374	35	Toilet Paper	\N	\N	\N	UAE	{}	\N	f79bd8a3-f272-41cc-aaf2-e1aee9900022	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-09 19:02:45.433498+02	\N	f	CARTON
e0c59fd2-7c23-4fe8-9f48-a5554c5a57cb	36	Yellow Socks	Feet	Yellow Stripe	000909912310091	UAE	{"width":150,"height":110,"length":100}	120000	5c2532e6-4c28-4b25-92b6-3f07852d83cc	just socks	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 15:07:35.511905+02	\N	f	CAR
ecbe279d-ac06-4eee-a87e-bbe9cbc57b89	37	Green Flip Flops	Suzuku	\N	1231232	UAE	{}	\N	d2fd6f90-b55b-4a33-bf7d-ee956333d75c	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-13 00:27:13.836741+02	\N	f	CARTON
3792bb92-b18f-457b-b99f-f063d5e70dc4	38	Super Glasses	Superman	00908	6968	UAE	{"width":120,"height":130,"length":140}	5002	47fa94e9-cc56-4f82-99df-a025f2603fb1	Item this is for Superman. 	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-13 18:06:45.535631+02	\N	f	CARTON
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.locations (location_id, location_name, location_code, notes, created_at, updated_at) FROM stdin;
4e176e92-e833-44f5-aea9-0537f980fb4b	Warehouse 1	WH1	DEFAULT	2025-02-26 01:37:11.65892+01	\N
bcafce7b-055c-4fec-a339-6a2b192bda54	Test	TEST	\N	2025-04-16 17:26:52.440355+02	\N
\.


--
-- Data for Name: login_attempts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.login_attempts (login_attempt_id, user_id, success, created_at, ip_address, user_agent, error_message) FROM stdin;
2	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-02-15 11:27:26.41927+01	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36	\N
3	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-02-15 12:37:06.500544+01	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36	\N
4	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-02-16 15:38:25.572398+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36	\N
5	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-02-16 16:02:17.59955+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36	\N
6	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-02-16 16:16:27.387543+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36	\N
7	4bb68f57-fc14-4e49-96a4-f26c75418547	f	2025-02-16 16:20:53.914544+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36	\N
8	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-02-16 16:20:59.877623+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36	\N
9	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-02-16 19:44:27.43352+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36	\N
10	\N	f	2025-02-16 19:45:07.964273+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36	\N
11	\N	f	2025-02-16 19:45:12.062464+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36	\N
12	\N	f	2025-02-16 19:45:53.503216+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36	\N
13	\N	f	2025-02-17 01:18:16.592381+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1	\N
14	4dcc518f-2a4e-4c02-9eaf-0cdcfd878b91	t	2025-02-17 01:19:32.603816+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1	\N
15	4dcc518f-2a4e-4c02-9eaf-0cdcfd878b91	t	2025-02-17 01:21:25.97907+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1	\N
16	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-02-20 18:04:06.308001+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36	\N
17	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-02-20 18:04:18.98449+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36	\N
18	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-02-22 23:41:15.668501+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36	\N
19	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-02-25 12:46:15.955458+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36	\N
20	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-02-26 19:36:15.646645+01	2.50.3.49	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36	\N
21	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-02-27 16:58:59.033326+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
22	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-02-27 17:02:38.512915+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
23	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-02-27 18:15:19.004866+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
24	1ba6cda0-70c5-4398-a252-5f1211b8665f	t	2025-02-27 21:48:44.134272+01	85.230.136.113	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
25	\N	f	2025-02-27 21:50:34.84702+01	85.230.136.113	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
26	dba7ee11-ec92-4d95-9f5c-6d3b2af80f1a	t	2025-02-27 21:51:28.761297+01	85.230.136.113	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
27	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-02 11:07:08.276075+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
28	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-03 10:30:55.142469+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
29	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-03 10:31:13.312496+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
30	4bb68f57-fc14-4e49-96a4-f26c75418547	f	2025-03-03 12:57:40.292646+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1	\N
31	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-03 12:57:47.982901+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1	\N
32	d2bc0533-2d03-4083-8188-e19cd504d256	t	2025-03-03 19:55:59.722197+01	97.116.12.72	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Safari/605.1.15	\N
33	d2bc0533-2d03-4083-8188-e19cd504d256	t	2025-03-03 19:56:46.953718+01	97.116.12.72	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Safari/605.1.15	\N
34	d2bc0533-2d03-4083-8188-e19cd504d256	t	2025-03-03 19:58:56.311107+01	97.116.12.72	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Safari/605.1.15	\N
35	d2bc0533-2d03-4083-8188-e19cd504d256	t	2025-03-03 20:00:01.465277+01	97.116.12.72	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Safari/605.1.15	\N
36	d2bc0533-2d03-4083-8188-e19cd504d256	t	2025-03-03 20:18:03.733484+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
37	d2bc0533-2d03-4083-8188-e19cd504d256	t	2025-03-03 20:18:55.821983+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
38	d2bc0533-2d03-4083-8188-e19cd504d256	t	2025-03-03 20:24:31.829481+01	1.1.1.1	test	\N
39	d2bc0533-2d03-4083-8188-e19cd504d256	t	2025-03-03 20:28:46.131611+01	1.1.1.1	test	\N
40	d2bc0533-2d03-4083-8188-e19cd504d256	t	2025-03-03 20:29:04.556618+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
41	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-04 13:02:59.419821+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
42	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-04 13:08:02.908086+01	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
43	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-04 14:18:08.99562+01	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
44	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-04 14:37:29.864103+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
45	4bb68f57-fc14-4e49-96a4-f26c75418547	f	2025-03-04 14:43:35.856316+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
46	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-04 14:43:41.371227+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
47	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-04 14:51:39.528433+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
48	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-04 15:05:18.684492+01	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
49	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-04 19:05:47.536007+01	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
50	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-05 12:13:01.741383+01	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
51	4dcc518f-2a4e-4c02-9eaf-0cdcfd878b91	t	2025-03-05 12:13:22.518524+01	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
52	\N	f	2025-03-05 12:13:31.69669+01	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
53	\N	f	2025-03-05 12:13:36.998409+01	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
54	d2bc0533-2d03-4083-8188-e19cd504d256	t	2025-03-05 12:15:07.685063+01	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
55	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-05 12:26:24.250253+01	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
56	d2bc0533-2d03-4083-8188-e19cd504d256	t	2025-03-05 12:29:29.14867+01	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
57	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-05 12:39:40.729861+01	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
58	d2bc0533-2d03-4083-8188-e19cd504d256	t	2025-03-05 12:40:25.824148+01	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
59	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-05 13:05:19.764489+01	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
60	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-05 13:29:39.15114+01	2.50.3.49	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36	\N
61	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-05 17:22:00.048835+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
62	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-05 17:51:31.575628+01	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
63	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-06 14:49:25.731366+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
64	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-06 18:06:12.580153+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
65	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-06 18:06:29.081504+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
66	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-06 18:13:36.016742+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
67	\N	f	2025-03-06 18:34:28.30774+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
68	d2bc0533-2d03-4083-8188-e19cd504d256	f	2025-03-06 18:35:44.426465+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
69	d2bc0533-2d03-4083-8188-e19cd504d256	t	2025-03-06 18:35:53.042061+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
70	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-07 00:15:52.023567+01	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
71	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-07 00:41:18.602534+01	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
72	a3d39555-33b4-4fa8-bbe9-99226a3140df	f	2025-03-07 00:41:42.522662+01	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
73	d2bc0533-2d03-4083-8188-e19cd504d256	t	2025-03-07 00:42:00.258783+01	::ffff:127.0.0.1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0	\N
74	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-07 00:42:41.686583+01	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
75	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-07 19:41:23.244646+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
76	4bb68f57-fc14-4e49-96a4-f26c75418547	f	2025-03-08 11:58:55.034282+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
77	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-08 13:56:33.537093+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
78	d2bc0533-2d03-4083-8188-e19cd504d256	t	2025-03-09 13:36:08.475245+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
79	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-09 17:04:25.735101+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
80	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-09 17:05:07.703337+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
81	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-09 23:44:59.721907+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1	\N
82	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-10 23:31:26.675573+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
83	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-11 13:01:41.647453+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
84	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-11 23:02:16.045961+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1	\N
85	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-12 19:28:14.257885+01	::ffff:192.168.1.193	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1	\N
86	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-12 20:48:23.337612+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1	\N
87	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-12 20:50:35.294023+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1	\N
88	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-12 23:47:44.513951+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
89	2e5c4542-e8ed-49f6-8efe-c20b773e1f76	t	2025-03-12 23:47:59.439851+01	95.93.115.237	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36	\N
90	\N	f	2025-03-13 00:24:24.76585+01	80.215.7.130	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	\N
91	2baac369-9752-4112-a0d8-2e6b3b25c9ff	t	2025-03-13 00:25:05.172261+01	80.215.7.130	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	\N
92	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-13 00:55:40.243734+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
93	009cb738-ce02-4cc0-b6cf-03a014b79c44	f	2025-03-13 00:56:34.288074+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
94	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-13 00:56:41.69147+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
95	2e964450-0a4d-4c6c-9097-46856f5a98c5	t	2025-03-13 01:43:57.671043+01	73.94.97.167	Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1	\N
96	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-13 10:41:55.215821+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
97	67491cc7-d947-4373-8581-2ab05e69e1c3	t	2025-03-13 18:02:56.998818+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1	\N
98	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-13 22:30:01.961959+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1	\N
99	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-13 22:30:03.310335+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1	\N
100	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-13 22:41:29.8279+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
101	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-14 00:39:08.657768+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
102	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-14 00:55:36.86691+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1	\N
103	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-14 00:55:38.14799+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1	\N
104	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-14 01:26:39.334842+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1	\N
105	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-14 18:12:59.604069+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6.6 Mobile/15E148 Safari/604.1	\N
106	4bb68f57-fc14-4e49-96a4-f26c75418547	f	2025-03-14 18:15:39.126686+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6.6 Mobile/15E148 Safari/604.1	\N
107	4bb68f57-fc14-4e49-96a4-f26c75418547	f	2025-03-14 18:15:40.020648+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6.6 Mobile/15E148 Safari/604.1	\N
108	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-14 18:15:49.178376+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6.6 Mobile/15E148 Safari/604.1	\N
109	4bb68f57-fc14-4e49-96a4-f26c75418547	f	2025-03-15 11:45:04.727528+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1	\N
110	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-15 11:45:13.743208+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1	\N
111	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-18 11:41:12.571632+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1	\N
112	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-20 12:39:09.810605+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148	\N
113	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-20 12:45:52.73489+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1	\N
114	\N	f	2025-03-20 13:00:29.702438+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 17_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1	\N
115	009cb738-ce02-4cc0-b6cf-03a014b79c44	f	2025-03-20 13:00:57.583145+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
116	a3d39555-33b4-4fa8-bbe9-99226a3140df	t	2025-03-20 13:01:23.821327+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 17_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1	\N
117	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-20 15:52:13.194013+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
118	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-21 14:44:21.086024+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
119	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-23 12:47:56.921029+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
120	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-23 20:03:29.340641+01	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
121	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-26 20:17:35.798233+01	85.230.136.113	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
122	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-03-26 20:19:52.429285+01	85.230.136.113	Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1	\N
123	06e2695a-1dae-4a1c-8693-731a4114a3a2	t	2025-04-01 18:54:28.05615+02	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
124	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-01 19:15:04.092709+02	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
125	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-03 14:05:47.43207+02	85.230.136.113	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
126	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-05 20:55:06.160024+02	::ffff:192.168.1.214	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
127	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-07 19:06:03.393633+02	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36	\N
128	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-09 18:07:37.45915+02	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
129	d2bc0533-2d03-4083-8188-e19cd504d256	t	2025-04-09 18:17:27.188331+02	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
130	2b7aa0d9-2a47-458d-99ea-ccb1e2d5c463	t	2025-04-09 18:19:58.643302+02	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
131	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-12 13:25:42.307965+02	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
132	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-13 14:06:40.060352+02	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
133	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-13 18:04:27.383547+02	::ffff:192.168.1.128	Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1	\N
134	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-13 22:21:59.384078+02	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
135	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-15 16:14:38.79118+02	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
136	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-16 15:06:11.252383+02	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
137	\N	f	2025-04-16 19:21:25.785805+02	::ffff:192.168.1.214	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
138	a3d39555-33b4-4fa8-bbe9-99226a3140df	t	2025-04-16 19:21:31.305023+02	::ffff:192.168.1.214	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
139	a3d39555-33b4-4fa8-bbe9-99226a3140df	t	2025-04-16 19:32:03.749237+02	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
140	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-17 18:55:17.246646+02	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
141	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-17 19:08:12.649283+02	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
142	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-18 10:36:03.676539+02	::ffff:192.168.1.214	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
143	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-18 10:43:43.20478+02	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
144	a3d39555-33b4-4fa8-bbe9-99226a3140df	t	2025-04-18 19:08:26.863409+02	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
145	a3d39555-33b4-4fa8-bbe9-99226a3140df	t	2025-04-20 20:19:31.79197+02	::ffff:192.168.1.214	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
146	a3d39555-33b4-4fa8-bbe9-99226a3140df	t	2025-04-20 21:22:20.67758+02	::ffff:192.168.1.214	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
147	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-20 22:19:59.623227+02	::ffff:192.168.1.131	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
148	a3d39555-33b4-4fa8-bbe9-99226a3140df	t	2025-04-20 22:30:56.992425+02	::ffff:192.168.1.214	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
149	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-20 23:02:18.945784+02	::ffff:192.168.1.214	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
150	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-22 18:35:13.157703+02	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
151	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-25 13:31:30.914604+02	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
152	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-25 13:37:17.849777+02	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
153	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-25 13:39:24.087972+02	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
154	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-25 13:39:42.777571+02	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
155	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-25 14:37:03.752414+02	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
156	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-04-25 14:40:54.443903+02	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
157	4bb68f57-fc14-4e49-96a4-f26c75418547	t	2025-05-01 10:19:26.132424+02	::1	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36	\N
\.


--
-- Data for Name: order_expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_expenses (order_expense_id, order_id, expense_item_id, expense_item_quantity, notes, created_by, created_at, updated_at, status, expense_item_price) FROM stdin;
282682e4-2036-40bc-a6c5-0495f739cb72	97ab39e6-2055-49e3-baa9-65ff423ff108	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	10	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 22:48:07.014763+02	2025-04-11 22:48:27.267+02	PENDING	5
96658394-00b1-42a0-b1fa-dd405f1fd7a0	97ab39e6-2055-49e3-baa9-65ff423ff108	969f409b-c721-43a1-b0a3-40950b8434fe	2	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 22:49:48.345602+02	\N	PENDING	10
c29747e4-2f6b-460e-a6fe-f69a1eea016b	97ab39e6-2055-49e3-baa9-65ff423ff108	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 22:58:19.971007+02	\N	PENDING	5
4342fe52-7d8e-4bdf-a1f0-2a5fc9c901fc	0312fa40-107d-45f9-b51e-0bdccfc1a447	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 11:33:51.32677+02	\N	PENDING	5
32859211-6aec-4ec1-9d7e-c25155cb4bac	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
df91e362-e9f1-4918-9058-684dbdbee728	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
a8c27213-6eb2-4ce7-9513-cf8657d4e3da	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
84e93f85-fd23-4a2b-a612-8638150c7303	6356878d-4704-4ad7-8eda-e79b10290414	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 22:16:59.847147+02	\N	PENDING	5
a4546bbb-f841-4859-bff0-bbcf0b9fae3f	6356878d-4704-4ad7-8eda-e79b10290414	35608ed0-5472-4fc5-ae7d-049d9d46453b	2	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 22:16:59.847147+02	\N	PENDING	10
2033ff3d-fc05-4931-944f-f39049197d57	6356878d-4704-4ad7-8eda-e79b10290414	969f409b-c721-43a1-b0a3-40950b8434fe	13	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 22:16:59.847147+02	\N	PENDING	10
1f7d752a-0880-4851-8e5b-afa42a3ed09d	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
fced5ba1-195f-49b5-81e5-02662f1a1584	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
bf613396-1806-413f-8c1d-7967a8b45df4	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
83e18810-46b8-4644-b911-9224645ed6b7	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
a945c788-e9c3-4469-80e4-88f8c0131f93	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
1b299fcb-d4e1-41ca-a007-8aadb20f9457	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
659c0dc5-32a1-4556-b3f0-105352ef8655	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
2c38d1d4-845f-4236-bfd9-2fbcf31f7483	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
5aeb4447-fcf3-44c0-95ae-73614017a194	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
46ac489a-5d32-4fd9-9da5-31090b1f7e5d	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
ba0faa40-ec85-4aaf-ba6b-93001babb570	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
8633228f-66ca-4150-9b77-b60396997754	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
2debe645-1796-4567-8de5-9b53aa98b226	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
68ee2752-df70-4433-a084-6ac50de7773d	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
7c43c4a6-8298-4460-a137-d127e4b1c4df	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
dfd13210-5658-4436-b300-12064d4bf528	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
db0e9b3f-064d-4af2-8200-5e85f074b39f	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
8208ad0f-d051-4975-a55a-6d06a4522bf0	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
da669c75-2832-442d-8d12-baefe01594b6	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	PENDING	5
2bd574a2-0917-4679-b7aa-36ec6cd9a5ae	0312fa40-107d-45f9-b51e-0bdccfc1a447	969f409b-c721-43a1-b0a3-40950b8434fe	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 14:48:32.017162+02	\N	PENDING	10
353d9ed2-bccd-485a-bc3f-2bbd92cc881b	bc7f369a-af70-4c3d-93d5-90ca937b42bc	480b45ef-9bcc-4311-9db9-47941a0600bb	4	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-18 21:40:06.17409+02	\N	PENDING	100
37783f95-f1c6-4d0e-b963-69d65f325e4c	a6f738e6-8f13-4636-8ad5-d2aa266bec9d	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	69	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-18 21:40:45.052734+02	\N	PENDING	5
a7bcfac1-ec76-4a06-867b-2d5079746b9f	a6f738e6-8f13-4636-8ad5-d2aa266bec9d	35608ed0-5472-4fc5-ae7d-049d9d46453b	69	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-18 21:40:45.052734+02	\N	PENDING	10
02bf20fb-8e57-44af-959b-d18bb247ffd3	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 13:47:53.364489+02	\N	DONE	5
87a88809-e92d-46d8-b754-f3b604ae556a	48b5b580-68bd-425c-9535-4a71d17648b5	969f409b-c721-43a1-b0a3-40950b8434fe	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-19 16:17:02.632211+02	\N	PENDING	10
d1981c76-fe8d-4a7a-a8c0-5d18c6477564	bc562823-f2d4-4a78-849c-cf3867b4338e	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-20 15:17:45.477924+02	\N	PENDING	5
e3890a2a-a54c-4629-9028-72b000f425c2	bc562823-f2d4-4a78-849c-cf3867b4338e	35608ed0-5472-4fc5-ae7d-049d9d46453b	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-20 15:17:45.477924+02	\N	PENDING	10
abb5f307-e5db-4044-8f74-1c91e699feb6	48b5b580-68bd-425c-9535-4a71d17648b5	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-20 15:28:03.065785+02	\N	PENDING	5
5f80a96e-9917-4e43-ad60-347f58c66119	97ab39e6-2055-49e3-baa9-65ff423ff108	969f409b-c721-43a1-b0a3-40950b8434fe	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-22 19:37:43.934121+02	2025-04-22 19:40:24.56+02	PENDING	1
5e6d47ff-53a2-444f-8ad5-7fbbbe256376	8291413f-0732-4556-9e40-3e02f5272984	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	15	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-22 19:33:31.370783+02	2025-04-22 20:25:41.275+02	PENDING	15
ad59d9fa-1086-40ba-9d39-15b3ef5754d6	8291413f-0732-4556-9e40-3e02f5272984	480b45ef-9bcc-4311-9db9-47941a0600bb	1	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-22 20:16:55.152162+02	2025-04-22 20:25:41.275+02	PENDING	1
46a943b6-c4e0-4cd8-96ba-7e599132d612	afb30c02-3c24-4b82-bfdb-8b6951cf7ec9	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	2	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-22 20:28:58.158288+02	2025-04-22 20:34:00.625+02	PENDING	2
3b414267-c3ea-416e-b2aa-ceef3ea07cd0	18882946-f3c4-4c0e-aa61-b26af1263f14	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	2	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-22 20:43:35.744101+02	2025-04-22 20:45:42.72+02	PENDING	50
a736b883-e890-458d-8160-7cd1c5dff5df	18882946-f3c4-4c0e-aa61-b26af1263f14	969f409b-c721-43a1-b0a3-40950b8434fe	3	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-22 20:46:06.972078+02	\N	PENDING	10
30d1413b-c91b-417b-a862-f7fa5b23bd7b	920a897a-910f-41c4-ac23-f19edd360d7a	1aa82b76-fbf0-42ea-b17a-395e87cbf2fb	2	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-22 21:04:53.797423+02	\N	PENDING	11
de1cc8fe-3e39-4aef-a8ce-16522b4baab9	920a897a-910f-41c4-ac23-f19edd360d7a	35608ed0-5472-4fc5-ae7d-049d9d46453b	10	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-22 21:04:53.797423+02	\N	PENDING	5.5
\.


--
-- Data for Name: order_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_history (history_id, order_id, change_type, previous_values, new_values, changed_by, changed_at, change_note) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.order_items (order_items_id, order_id, item_id, item_location_id, quantity, created_at, updated_at) FROM stdin;
67674a08-ed6d-4570-82bf-50a1f0957237	779602e0-da67-46ff-a6b8-a567fb353476	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	10	2025-02-26 01:40:17.036127+01	\N
77675523-6cdb-46a4-8c66-0cdc96a9a686	f3a7d645-67ec-4649-bb7e-8ea360f16e42	fc451ae0-5753-4414-886d-b13e2e19a429	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-02-26 01:45:57.791097+01	\N
5f7962e9-1f38-43ee-833f-bfcd838a2531	f3a7d645-67ec-4649-bb7e-8ea360f16e42	e5048e03-378c-4b54-b5e5-c6198ce728c6	4e176e92-e833-44f5-aea9-0537f980fb4b	4	2025-02-26 01:45:57.791097+01	\N
8826c501-e6c7-45a7-bf81-62e4b96769ab	f7036833-3441-4e3a-acd9-79990ca08be5	36de253f-52b6-4f3c-bece-a415c010636a	4e176e92-e833-44f5-aea9-0537f980fb4b	666	2025-02-26 19:32:18.650073+01	\N
b6c3f989-dfb9-44d2-a0b2-f131fa881c6a	7fc238df-ae32-42bb-bf95-76620ab355f1	d38771e5-024b-44c8-93e4-95b44bb52a04	4e176e92-e833-44f5-aea9-0537f980fb4b	3	2025-02-26 19:45:23.959385+01	\N
f3198cd7-002e-4530-8b78-aa4cc34a9921	8b2a1619-2e24-41a3-be9e-e794fc633b1c	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	1000	2025-02-26 20:50:18.009653+01	\N
e24dc3d3-b45b-42f5-bf16-e538654d97de	b89314e9-5479-4dae-95b0-61ec620fba66	e5048e03-378c-4b54-b5e5-c6198ce728c6	4e176e92-e833-44f5-aea9-0537f980fb4b	999	2025-02-26 21:01:23.027151+01	\N
6e48710e-2d46-434c-9191-3f164642d7d4	0b67be6a-dba7-45bb-9e51-10bef9286c6d	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	66	2025-02-27 18:19:30.861561+01	\N
bbf2dde3-3c6c-4e1f-a637-b488a7a46c8d	90c11237-a1a5-44f2-8ba8-9b22cefbf2c3	fc451ae0-5753-4414-886d-b13e2e19a429	4e176e92-e833-44f5-aea9-0537f980fb4b	6	2025-02-27 18:22:44.223145+01	\N
00886092-ba7b-4ed3-af38-c5510edb0395	348f064e-0ad8-4957-aa29-903f01ed90ba	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	500	2025-02-27 21:56:53.160861+01	\N
5665955d-a86c-4946-974f-b97b596a3b28	a07d9511-dc03-42b3-85c5-a7a01a88dd37	0a408a8c-7219-4589-ae5e-2b1c3c8848d0	4e176e92-e833-44f5-aea9-0537f980fb4b	3	2025-03-02 11:12:22.360154+01	\N
98ede1d3-04ca-4e5b-98d0-e7cdbebfee0b	8fe8db50-e0ca-49b4-8adc-fdf0b8a6cf57	36de253f-52b6-4f3c-bece-a415c010636a	4e176e92-e833-44f5-aea9-0537f980fb4b	600	2025-03-02 11:18:11.817542+01	\N
81bb790d-6d0a-430f-a73e-8d0ba4aad11e	12a423f3-acaf-4f45-847b-770910382809	36de253f-52b6-4f3c-bece-a415c010636a	4e176e92-e833-44f5-aea9-0537f980fb4b	500	2025-03-04 19:06:31.349602+01	\N
38cfdbc9-ee3f-4d72-a04f-a48fb4d518d7	ea3ffcbf-1a45-4636-8b06-019d1bb9d320	d38771e5-024b-44c8-93e4-95b44bb52a04	4e176e92-e833-44f5-aea9-0537f980fb4b	2	2025-03-05 13:10:37.306137+01	\N
84025cf0-7767-4178-8ec5-38e8af43c959	e02cfecf-a7c3-4d9c-a89f-e0aa75890de3	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	1000	2025-03-05 18:11:16.124997+01	\N
ff89e942-8df1-4ec1-a9c8-c5d24cc38aac	1605d5c4-4ea6-45cd-b730-c1e5d8468f10	92226cb9-df00-4212-9d36-30b3b94d1c19	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-03-05 20:25:58.197226+01	\N
f2a1c283-c74d-4691-bbd5-4c04999e4f67	cc75d809-13e0-4c2e-a7b4-c9711991887e	d1600c44-73cc-4630-a978-d59c36097954	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-03-07 00:24:02.349831+01	\N
c6b86606-cbce-450e-864a-0793dc722a82	2d2dd05b-c4b1-4b6c-9ca5-acbe367b0b38	36c7a838-779c-4aef-a934-5b847242906e	4e176e92-e833-44f5-aea9-0537f980fb4b	6	2025-03-07 19:43:56.466776+01	\N
58d3ce74-4b9e-4732-ab33-b1111a97e609	cf78d2bf-4565-422f-b09b-977541d98539	0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	666	2025-03-09 17:30:41.091035+01	\N
5da8ae24-d908-42c1-b4d8-125d51758319	fb0a96cf-0d18-4135-bbec-7766fbf024c0	0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	2	2025-03-09 23:45:58.078705+01	\N
1c3bd9f8-364f-4cbd-a6da-f43eed838d13	fb0a96cf-0d18-4135-bbec-7766fbf024c0	406843e4-8e07-46ff-a9db-2addcbe781ea	4e176e92-e833-44f5-aea9-0537f980fb4b	3	2025-03-09 23:45:58.078705+01	\N
607cf84a-6f7b-4727-83f2-f33932455b67	6d052ada-2749-4e07-9b5e-20b164716365	0a408a8c-7219-4589-ae5e-2b1c3c8848d0	4e176e92-e833-44f5-aea9-0537f980fb4b	345	2025-03-09 23:46:15.966475+01	\N
900e2ed6-2064-4ad1-b1a9-5ce61ed7c855	843abb66-94d8-4c8c-9819-d27d71e8f2f6	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	100	2025-03-11 23:04:30.377131+01	\N
28d2951e-933d-42e0-aa95-8abdd7f52cfd	843abb66-94d8-4c8c-9819-d27d71e8f2f6	36c7a838-779c-4aef-a934-5b847242906e	4e176e92-e833-44f5-aea9-0537f980fb4b	100	2025-03-11 23:04:30.377131+01	\N
f73a8a48-ebf0-4613-b943-be185dea5d2b	843abb66-94d8-4c8c-9819-d27d71e8f2f6	36c7a838-779c-4aef-a934-5b847242906e	4e176e92-e833-44f5-aea9-0537f980fb4b	4	2025-03-11 23:04:30.377131+01	\N
67df366d-77eb-468b-b3b6-523c2d957263	1e1a0d9e-ed4c-4607-a4e8-8fc2dc25684b	63678a82-5e9c-4290-82b7-4b7e901966b9	4e176e92-e833-44f5-aea9-0537f980fb4b	10	2025-03-12 19:31:54.307242+01	\N
d8ff2805-236d-4028-af3b-0f1e9368c66a	1e1a0d9e-ed4c-4607-a4e8-8fc2dc25684b	406843e4-8e07-46ff-a9db-2addcbe781ea	4e176e92-e833-44f5-aea9-0537f980fb4b	10	2025-03-12 19:31:54.307242+01	\N
44506f4a-f996-45db-b72c-edb26fec2291	595a8270-c70b-48ef-913b-efc98abf09bd	7759dc13-bafa-42f3-97ed-c6ab38785952	4e176e92-e833-44f5-aea9-0537f980fb4b	10000000	2025-03-13 00:32:38.325658+01	\N
85dc99aa-2e38-4b32-bf3e-52912b214e49	3755716b-97ff-4b6f-a9ce-7aeb979d600c	23f898dc-26f3-478b-b294-c20f638a9706	4e176e92-e833-44f5-aea9-0537f980fb4b	10	2025-03-14 15:15:32.015162+01	\N
df0f1f82-8db8-4389-870f-d527b5169d8a	8565f6c3-a94b-44a2-a104-f62dbefa77fc	41b8fd1a-0927-4fb9-8d89-ced69f87c2d3	4e176e92-e833-44f5-aea9-0537f980fb4b	10	2025-03-14 15:20:54.391392+01	\N
398ab065-91c8-47a6-a939-8c2dfef89ee1	863cc6d1-1e20-4d1f-8b46-0955daf0b10d	7e5f826d-21b2-4d71-b2f8-cd6aaeda9a17	4e176e92-e833-44f5-aea9-0537f980fb4b	10	2025-03-18 23:03:12.560687+01	\N
10ca6fd5-a28c-46d4-92b8-5f74c73ea2af	84a978a1-669d-4af9-abd0-87f1be64c807	7e5f826d-21b2-4d71-b2f8-cd6aaeda9a17	4e176e92-e833-44f5-aea9-0537f980fb4b	435	2025-04-04 16:11:59.611879+02	\N
8ca981ae-d47b-426a-b1aa-bdc118cb9ab6	3ad5fbfa-d340-4ff8-90ad-0f9bb27b335d	23f898dc-26f3-478b-b294-c20f638a9706	4e176e92-e833-44f5-aea9-0537f980fb4b	787	2025-04-04 16:14:32.20858+02	\N
a831c162-db0b-4fe8-93cf-6e60db9d7a99	bce378bf-f6bc-444c-9937-ba1c0580b97e	7759dc13-bafa-42f3-97ed-c6ab38785952	4e176e92-e833-44f5-aea9-0537f980fb4b	234234	2025-04-05 19:20:02.139243+02	\N
359dd118-c9b0-44b1-a325-0e0df02a0712	98ad87a6-e230-4e2f-be06-032a567b2959	7e5f826d-21b2-4d71-b2f8-cd6aaeda9a17	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-05 20:23:49.184107+02	\N
feb39706-6e20-4c2d-a97b-c8c93bc41499	9efe6bae-d8eb-4616-9126-3770be5bcf46	24ccbb68-b391-46cf-b76b-c524e93f5de9	4e176e92-e833-44f5-aea9-0537f980fb4b	888	2025-04-05 20:56:00.005334+02	\N
c0b8380d-e09a-4fb4-80a6-bac237f319b9	e522577d-a20f-4a95-a8f6-e9cba7ab4713	86f64e5d-0d86-4549-b3a1-41b01af4ce31	4e176e92-e833-44f5-aea9-0537f980fb4b	100	2025-04-09 22:29:55.312633+02	\N
98f5b45d-6672-4b24-8d6d-5d2b4844ff70	e522577d-a20f-4a95-a8f6-e9cba7ab4713	86f64e5d-0d86-4549-b3a1-41b01af4ce31	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-09 22:29:55.312633+02	\N
c8034c6f-e9c3-4ec2-9f57-8780d2e0f113	e522577d-a20f-4a95-a8f6-e9cba7ab4713	86f64e5d-0d86-4549-b3a1-41b01af4ce31	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-09 22:29:55.312633+02	\N
9181c793-6256-463a-a889-672be4e89975	e522577d-a20f-4a95-a8f6-e9cba7ab4713	86f64e5d-0d86-4549-b3a1-41b01af4ce31	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-09 22:29:55.312633+02	\N
37e89f16-f6b3-40a8-954f-2af30b0bdf09	e522577d-a20f-4a95-a8f6-e9cba7ab4713	86f64e5d-0d86-4549-b3a1-41b01af4ce31	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-09 22:29:55.312633+02	\N
e99abc5c-37ed-479e-8a5d-b996966c3c63	e522577d-a20f-4a95-a8f6-e9cba7ab4713	86f64e5d-0d86-4549-b3a1-41b01af4ce31	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-09 22:29:55.312633+02	\N
67b47210-b01e-40cc-918a-7adc17910ad7	e522577d-a20f-4a95-a8f6-e9cba7ab4713	86f64e5d-0d86-4549-b3a1-41b01af4ce31	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-09 22:29:55.312633+02	\N
f5113818-0bba-4161-b7db-7a5b5cbf2df3	c63bbf78-3897-4b0d-8f94-17953b049aca	24ccbb68-b391-46cf-b76b-c524e93f5de9	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-10 18:25:36.682947+02	\N
7aeb9e7f-00af-4c25-bfa8-2631b03bb10b	4ed37a9e-65f7-4896-b1c9-bd45a9ede3c8	6b5df264-449c-456b-a9ab-a10cdfea6690	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-10 22:28:04.672338+02	\N
447b9c21-a115-447a-b3cb-cd028b0817c0	7f157b60-f153-4fbb-b368-cd586333e9c6	23f898dc-26f3-478b-b294-c20f638a9706	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-10 22:32:02.692167+02	\N
84a4958f-cad0-4b4f-a733-72d8631cd163	32d025ff-ed47-4876-9dce-f532c33258ab	a90eb711-65d4-4e9a-9cdd-105e13e2869a	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-10 22:33:01.932021+02	\N
bd9b5882-d8c4-4ad9-8d41-fc477256479e	43ba7965-13e1-4ef7-a528-027781a6fecd	23f898dc-26f3-478b-b294-c20f638a9706	4e176e92-e833-44f5-aea9-0537f980fb4b	2	2025-04-10 22:33:50.018168+02	\N
dafa8598-cf34-476d-8418-be1cd143c954	3b87f997-3460-4e80-b31b-8c03727b8267	7759dc13-bafa-42f3-97ed-c6ab38785952	4e176e92-e833-44f5-aea9-0537f980fb4b	345	2025-04-10 23:41:03.19803+02	\N
76941151-29ee-4cb2-bb73-5bdc9f3aea0c	8da23fb6-5a73-474b-980a-da9e29299c4f	9bf99bd4-6bac-4c45-8e4e-e1ce7c0192dd	4e176e92-e833-44f5-aea9-0537f980fb4b	5	2025-04-11 00:02:49.750317+02	\N
90194060-aed0-4b50-8094-3757db70862c	0cd36696-a3b3-48db-ac5a-45b010c3da86	24ccbb68-b391-46cf-b76b-c524e93f5de9	4e176e92-e833-44f5-aea9-0537f980fb4b	10	2025-04-11 00:07:07.334216+02	\N
3acaae8b-5e5f-4ea7-8d59-f1c6940f2086	0ffe1a88-90b0-4005-a0e2-b92e0576e39e	e36c5e32-4990-4b86-a7d1-143b9c1bf8ac	4e176e92-e833-44f5-aea9-0537f980fb4b	5	2025-04-11 00:08:55.139047+02	\N
60948b9d-9ef3-4e83-86b1-896baff93075	69124a2f-a463-43ff-9498-ca72fe5d64f3	0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	69	2025-04-11 00:10:11.034387+02	\N
1626898f-a3b3-4258-af1b-7d7ecf5f16ce	01f96baf-7b65-4893-b009-5afae795a83e	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-11 00:19:22.571542+02	\N
83655d7d-c3fa-477a-b061-22eac9021a2e	61d03cce-3fd2-4bf7-856a-2b3f458f3225	e36c5e32-4990-4b86-a7d1-143b9c1bf8ac	4e176e92-e833-44f5-aea9-0537f980fb4b	4	2025-04-11 00:23:15.971006+02	\N
495af4e0-f0be-4709-bd83-0447cd44ea6e	61d03cce-3fd2-4bf7-856a-2b3f458f3225	406843e4-8e07-46ff-a9db-2addcbe781ea	4e176e92-e833-44f5-aea9-0537f980fb4b	3	2025-04-11 00:23:15.971006+02	\N
60142d10-39ab-40be-883e-c03c55c42ee1	516e2130-9f62-4a9c-8744-98bd7f3d2a19	23f898dc-26f3-478b-b294-c20f638a9706	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-11 00:24:38.63185+02	\N
b332092b-7733-4877-8602-e8f033114d9d	516e2130-9f62-4a9c-8744-98bd7f3d2a19	a90eb711-65d4-4e9a-9cdd-105e13e2869a	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-11 00:24:38.63185+02	\N
781841e8-002e-4822-8397-0614262e9f27	b628f270-4ce7-4df6-b614-b16c7a1b25ea	7e5f826d-21b2-4d71-b2f8-cd6aaeda9a17	4e176e92-e833-44f5-aea9-0537f980fb4b	34	2025-04-11 00:29:53.159654+02	\N
66178e30-1914-4061-98ac-3e291ebecb65	c61dc9ac-0235-4a60-963a-005499e3cf47	7e5f826d-21b2-4d71-b2f8-cd6aaeda9a17	4e176e92-e833-44f5-aea9-0537f980fb4b	34	2025-04-11 00:31:03.59855+02	\N
2c604d5c-b205-4957-ba17-556ed60dc5d4	d25cb26c-97a8-4183-8f5c-6b465da223ac	9bf99bd4-6bac-4c45-8e4e-e1ce7c0192dd	4e176e92-e833-44f5-aea9-0537f980fb4b	4	2025-04-11 01:44:59.111376+02	\N
67be5aa9-c8fd-4daa-8782-2a4a7de9ab15	d25cb26c-97a8-4183-8f5c-6b465da223ac	6fa123ce-7601-411f-bde3-19ee0dd15374	4e176e92-e833-44f5-aea9-0537f980fb4b	3	2025-04-11 01:44:59.111376+02	\N
787e2a01-dbf0-47fd-b77e-1002bc973fca	d25cb26c-97a8-4183-8f5c-6b465da223ac	9bf99bd4-6bac-4c45-8e4e-e1ce7c0192dd	4e176e92-e833-44f5-aea9-0537f980fb4b	99	2025-04-11 01:44:59.111376+02	\N
9e8463a9-5d57-487b-a489-6ad38a4e4318	6356878d-4704-4ad7-8eda-e79b10290414	8c9f2597-ebfa-40e3-b584-9f74bfba0d01	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-11 19:56:17.48615+02	\N
80cf4ad0-8019-4468-8b46-e8aaa4581090	7b8b9905-316e-4cb9-9e4d-32a7751fa730	6fa123ce-7601-411f-bde3-19ee0dd15374	4e176e92-e833-44f5-aea9-0537f980fb4b	3	2025-04-11 19:57:05.205243+02	\N
835d2821-9881-4e37-817b-89029587e626	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	00fe3e65-2e6e-4e34-8213-bac42ad4d943	4e176e92-e833-44f5-aea9-0537f980fb4b	2	2025-04-11 22:12:58.401179+02	\N
cbd1f358-c99b-4f8c-808d-968e894026af	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	10	2025-04-11 22:12:58.401179+02	\N
9e092434-9574-410c-a8a7-65fc2ca3db49	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	406843e4-8e07-46ff-a9db-2addcbe781ea	4e176e92-e833-44f5-aea9-0537f980fb4b	9	2025-04-11 22:12:58.401179+02	\N
e5e1e380-0a62-44f5-b003-9060f312ab85	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	41b8fd1a-0927-4fb9-8d89-ced69f87c2d3	4e176e92-e833-44f5-aea9-0537f980fb4b	4	2025-04-11 22:12:58.401179+02	\N
22167fe3-d2cb-4f31-b8a3-c7ac4abae43d	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	63678a82-5e9c-4290-82b7-4b7e901966b9	4e176e92-e833-44f5-aea9-0537f980fb4b	5	2025-04-11 22:12:58.401179+02	\N
ee538b60-d326-4310-8517-2e5a846d6825	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	89bc83f4-0420-48cf-b3e5-2013d7216da3	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-11 22:12:58.401179+02	\N
2eb33068-b9fd-41fc-aae5-547d36996a7c	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	ce661bda-db85-48a9-be57-69a435014213	4e176e92-e833-44f5-aea9-0537f980fb4b	7	2025-04-11 22:12:58.401179+02	\N
c1f8bf68-8616-4277-9026-2583656402ed	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	ce661bda-db85-48a9-be57-69a435014213	4e176e92-e833-44f5-aea9-0537f980fb4b	8	2025-04-11 22:12:58.401179+02	\N
92c5af52-abfa-4bce-8180-201d31891174	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	e36c5e32-4990-4b86-a7d1-143b9c1bf8ac	4e176e92-e833-44f5-aea9-0537f980fb4b	6	2025-04-11 22:12:58.401179+02	\N
689bc08b-acdc-4d1d-9e56-5940831bb73c	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	e9c8f943-7dae-4e3e-87eb-96e883d2a14b	4e176e92-e833-44f5-aea9-0537f980fb4b	3	2025-04-11 22:12:58.401179+02	\N
2b80ea25-3df3-48a9-9e3c-8bb4d0ebe432	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	41b8fd1a-0927-4fb9-8d89-ced69f87c2d3	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-11 22:12:58.401179+02	\N
ecfc9aa4-b0be-4e73-b0c2-9cdf91303f3f	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	e36c5e32-4990-4b86-a7d1-143b9c1bf8ac	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-11 22:12:58.401179+02	\N
89c78d01-a9da-49b5-ac9c-8a5fe9688b19	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-11 22:12:58.401179+02	\N
4114f748-3385-4e76-8485-c2f3f3e62042	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	ce661bda-db85-48a9-be57-69a435014213	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-11 22:12:58.401179+02	\N
e0917df5-05a9-4411-a7b5-a554ed67ab93	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	41b8fd1a-0927-4fb9-8d89-ced69f87c2d3	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-11 22:12:58.401179+02	\N
c5cd50b8-43e3-4507-a612-ccc5ce19bf7f	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	e36c5e32-4990-4b86-a7d1-143b9c1bf8ac	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-11 22:12:58.401179+02	\N
cca7205f-64c4-42b8-bf98-9b9d4ce401a4	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	63678a82-5e9c-4290-82b7-4b7e901966b9	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-11 22:12:58.401179+02	\N
ffad6610-e6c7-4b6f-96ed-eb989ff5eab7	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	ce661bda-db85-48a9-be57-69a435014213	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-11 22:12:58.401179+02	\N
7bbaf6de-1fcc-41fc-8492-84175d2ab3bc	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	e36c5e32-4990-4b86-a7d1-143b9c1bf8ac	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-11 22:12:58.401179+02	\N
8817f4c7-1a29-4156-b487-03d74c109794	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	406843e4-8e07-46ff-a9db-2addcbe781ea	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-11 22:12:58.401179+02	\N
6d085361-1e1d-4a2d-a415-0eddb7bb51f4	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	e9c8f943-7dae-4e3e-87eb-96e883d2a14b	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-11 22:12:58.401179+02	\N
e213103d-e9fa-420b-8436-24a873f8973c	97ab39e6-2055-49e3-baa9-65ff423ff108	89bc83f4-0420-48cf-b3e5-2013d7216da3	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-11 22:58:12.049588+02	\N
568155e5-e300-4d21-9dc2-984240e3fbbe	97ab39e6-2055-49e3-baa9-65ff423ff108	e36c5e32-4990-4b86-a7d1-143b9c1bf8ac	4e176e92-e833-44f5-aea9-0537f980fb4b	5	2025-04-11 22:58:12.049588+02	\N
c504ce53-3d07-4949-bc66-3762c728bc45	87a5f1f0-86dc-4490-8786-4342a316deba	29014a07-c465-420d-b28b-aa9c99d911d5	4e176e92-e833-44f5-aea9-0537f980fb4b	100	2025-04-12 10:05:05.343952+02	\N
0e72b0ff-ec59-4ec7-bbc9-4a75e25564e0	9abf3335-0ed4-4d2f-9104-0c214d0cf3a2	6b5df264-449c-456b-a9ab-a10cdfea6690	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-12 20:23:57.666433+02	\N
0598e44f-461d-4900-9e54-257109ebdba3	0312fa40-107d-45f9-b51e-0bdccfc1a447	6b5df264-449c-456b-a9ab-a10cdfea6690	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-12 21:11:17.663854+02	\N
3adfc9a6-d115-4e08-bf43-928c94653567	188ce518-956e-4e45-9d70-c47379015e67	89bc83f4-0420-48cf-b3e5-2013d7216da3	4e176e92-e833-44f5-aea9-0537f980fb4b	69	2025-04-12 21:11:45.729339+02	\N
3aca635b-2591-4282-9b29-fe933dbbc6b0	25775123-f77f-4678-8722-cd5efa6aef5f	8c9f2597-ebfa-40e3-b584-9f74bfba0d01	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-12 21:14:48.647618+02	\N
d92bfd45-9bf1-4354-afcf-4ceeced2ceeb	c200b3cb-4204-48ba-b12b-ff17858528a3	a90eb711-65d4-4e9a-9cdd-105e13e2869a	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-12 23:35:53.300225+02	\N
31401502-d371-4bd8-915b-66c647f684c2	18882946-f3c4-4c0e-aa61-b26af1263f14	a90eb711-65d4-4e9a-9cdd-105e13e2869a	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-13 00:15:08.526633+02	\N
80c65132-d556-4def-9abd-251f0ae6d8b3	8291413f-0732-4556-9e40-3e02f5272984	ecbe279d-ac06-4eee-a87e-bbe9cbc57b89	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-13 00:27:32.764877+02	\N
ef21e516-c309-49d1-9387-4ccbeab31e14	afb30c02-3c24-4b82-bfdb-8b6951cf7ec9	6b5df264-449c-456b-a9ab-a10cdfea6690	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-13 17:21:23.767351+02	\N
37c3d820-74c8-4f91-b0c5-a9eb20186e79	48b5b580-68bd-425c-9535-4a71d17648b5	8c9f2597-ebfa-40e3-b584-9f74bfba0d01	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-13 17:43:35.764196+02	\N
3fc3e757-980d-41ea-b6e9-6aa27d8704e1	cfeb8660-db8e-44ae-9fb0-599a5402a84f	00fe3e65-2e6e-4e34-8213-bac42ad4d943	4e176e92-e833-44f5-aea9-0537f980fb4b	2	2025-04-16 17:29:51.105196+02	\N
7a408df2-4eee-4c51-b25e-dfbd0c7cfee5	817e27e2-a7ed-4300-9a5a-edb479571e52	e36c5e32-4990-4b86-a7d1-143b9c1bf8ac	4e176e92-e833-44f5-aea9-0537f980fb4b	2	2025-04-16 20:40:56.801285+02	\N
1f2b6f32-e9bc-4caa-a5b8-552aa23af2c4	bc7f369a-af70-4c3d-93d5-90ca937b42bc	89bc83f4-0420-48cf-b3e5-2013d7216da3	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-18 19:08:55.2977+02	\N
8bc6343d-5177-45bb-a885-715096447a23	bc562823-f2d4-4a78-849c-cf3867b4338e	29014a07-c465-420d-b28b-aa9c99d911d5	4e176e92-e833-44f5-aea9-0537f980fb4b	5	2025-04-20 15:17:10.180322+02	\N
888144cd-b061-4f7b-bb56-f75ac4fc72f8	a6f738e6-8f13-4636-8ad5-d2aa266bec9d	e0c59fd2-7c23-4fe8-9f48-a5554c5a57cb	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-21 23:07:46.245252+02	\N
02d284ee-a320-4788-82bc-f25aad3e9766	920a897a-910f-41c4-ac23-f19edd360d7a	6b5df264-449c-456b-a9ab-a10cdfea6690	4e176e92-e833-44f5-aea9-0537f980fb4b	1	2025-04-22 21:03:53.537164+02	\N
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.orders (order_id, order_number, customer_id, order_type, movement, packing_type, delivery_method, status, address_id, fulfilled_at, notes, created_by, created_at, updated_at, is_deleted, order_mark, zoho_invoice_id, zoho_invoice_number) FROM stdin;
779602e0-da67-46ff-a6b8-a567fb353476	2	8cb066e3-0f31-4d60-bb41-79c28c9f3b03	CUSTOMER_ORDER	IN	NONE	NONE	COMPLETED	\N	\N	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-02-26 01:39:52.816778+01	2025-02-26 01:40:17.143+01	f	\N	\N	\N
f3a7d645-67ec-4649-bb7e-8ea360f16e42	3	5c2532e6-4c28-4b25-92b6-3f07852d83cc	CUSTOMER_ORDER	IN	CARTON	PICKUP	READY	\N	\N	\N	4dcc518f-2a4e-4c02-9eaf-0cdcfd878b91	2025-02-26 01:45:37.268383+01	2025-02-26 01:45:57.901+01	f	\N	\N	\N
595a8270-c70b-48ef-913b-efc98abf09bd	26	9acf39a7-8689-4502-9114-efbe39abc306	CUSTOMER_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-03-13 00:32:58.164708+01		2baac369-9752-4112-a0d8-2e6b3b25c9ff	2025-03-13 00:32:38.325658+01	2025-03-13 00:32:58.278+01	f	\N	\N	\N
dd653c46-7de8-4760-8bf3-700679caaa65	28	26701cd8-cab1-4de8-a2c7-48e27378e4bf	CUSTOMER_ORDER	OUT	NONE	NONE	COMPLETED	\N	2025-03-14 15:04:30.885872+01		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-14 14:38:31.046949+01	2025-03-14 15:04:30.974+01	f	\N	\N	\N
f7036833-3441-4e3a-acd9-79990ca08be5	6	699321c5-d728-4cda-8f2c-15bd4f888f95	CUSTOMER_ORDER	IN	NONE	NONE	COMPLETED	\N	\N		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-02-26 19:32:18.650073+01	\N	f	\N	\N	\N
12a423f3-acaf-4f45-847b-770910382809	15	699321c5-d728-4cda-8f2c-15bd4f888f95	CUSTOMER_ORDER	OUT	NONE	NONE	COMPLETED	\N	2025-03-04 19:06:31.349602+01	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-02 11:17:26.404624+01	2025-03-04 19:06:31.441+01	f	\N	\N	\N
ea3ffcbf-1a45-4636-8b06-019d1bb9d320	9	f742a74c-36ee-41dc-994a-7e32974ff36f	CUSTOMER_ORDER	IN	NONE	NONE	DRAFT	\N	2025-03-04 13:15:15.927063+01	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-02-26 19:46:02.643773+01	2025-03-05 13:10:37.367+01	f	\N	\N	\N
e02cfecf-a7c3-4d9c-a89f-e0aa75890de3	20	8cb066e3-0f31-4d60-bb41-79c28c9f3b03	CUSTOMER_ORDER	IN	NONE	NONE	CANCELLED	\N	2025-03-05 18:11:16.124997+01	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-05 17:55:13.473403+01	2025-03-14 00:19:33.892+01	f	\N	\N	\N
7fc238df-ae32-42bb-bf95-76620ab355f1	8	f742a74c-36ee-41dc-994a-7e32974ff36f	CUSTOMER_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-02-26 19:45:23.959385+01	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-02-26 19:38:45.422108+01	2025-02-26 19:45:24.067+01	f	\N	\N	\N
8b2a1619-2e24-41a3-be9e-e794fc633b1c	5	8cb066e3-0f31-4d60-bb41-79c28c9f3b03	CUSTOMER_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-02-26 20:50:18.009653+01	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-02-26 19:31:55.626399+01	2025-02-26 20:50:18.116+01	f	\N	\N	\N
b89314e9-5479-4dae-95b0-61ec620fba66	7	5c2532e6-4c28-4b25-92b6-3f07852d83cc	CUSTOMER_ORDER	IN	NONE	NONE	PENDING	\N	2025-02-26 19:34:33.028936+01	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-02-26 19:34:08.469251+01	2025-02-26 21:01:23.136+01	f	\N	\N	\N
3755716b-97ff-4b6f-a9ce-7aeb979d600c	29	26701cd8-cab1-4de8-a2c7-48e27378e4bf	CUSTOMER_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-03-14 15:15:40.756923+01		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-14 15:13:11.425665+01	2025-03-14 15:15:40.851+01	f	\N	\N	\N
0b67be6a-dba7-45bb-9e51-10bef9286c6d	10	8cb066e3-0f31-4d60-bb41-79c28c9f3b03	CUSTOMER_ORDER	IN	NONE	NONE	PENDING	\N	\N		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-02-27 18:19:30.861561+01	\N	f	\N	\N	\N
90c11237-a1a5-44f2-8ba8-9b22cefbf2c3	11	5c2532e6-4c28-4b25-92b6-3f07852d83cc	CUSTOMER_ORDER	IN	NONE	NONE	PENDING	\N	\N		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-02-27 18:22:44.223145+01	\N	f	\N	\N	\N
348f064e-0ad8-4957-aa29-903f01ed90ba	4	8cb066e3-0f31-4d60-bb41-79c28c9f3b03	CUSTOMER_ORDER	OUT	NONE	NONE	COMPLETED	\N	2025-02-27 21:56:53.160861+01	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-02-26 19:24:54.098649+01	2025-02-27 21:56:53.268+01	f	\N	\N	\N
8565f6c3-a94b-44a2-a104-f62dbefa77fc	30	47fa94e9-cc56-4f82-99df-a025f2603fb1	CUSTOMER_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-03-14 15:21:03.497846+01		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-14 15:20:54.391392+01	2025-03-14 15:21:03.596+01	f	\N	\N	\N
a07d9511-dc03-42b3-85c5-a7a01a88dd37	12	9acf39a7-8689-4502-9114-efbe39abc306	CUSTOMER_ORDER	OUT	SACK	PICKUP	COMPLETED	\N	2025-03-02 11:12:22.360154+01	\N	dba7ee11-ec92-4d95-9f5c-6d3b2af80f1a	2025-02-27 21:58:18.734597+01	2025-03-02 11:12:22.468+01	f	\N	\N	\N
863cc6d1-1e20-4d1f-8b46-0955daf0b10d	31	c0de8d84-e03d-4c4b-8731-49e0c0f016b5	CUSTOMER_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-03-18 23:03:31.710519+01		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-18 23:03:12.560687+01	2025-03-18 23:03:31.822+01	f	\N	\N	\N
1605d5c4-4ea6-45cd-b730-c1e5d8468f10	21	46830460-2405-4087-b6c3-491bc19fa32d	CUSTOMER_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-03-05 20:25:58.197226+01	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-05 20:15:29.350656+01	2025-03-05 20:25:58.267+01	f	\N	\N	\N
8fe8db50-e0ca-49b4-8adc-fdf0b8a6cf57	13	699321c5-d728-4cda-8f2c-15bd4f888f95	CUSTOMER_ORDER	OUT	NONE	NONE	PENDING	\N	2025-03-02 11:13:58.388663+01	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-02 11:13:32.956573+01	2025-03-02 11:18:11.926+01	f	\N	\N	\N
cf78d2bf-4565-422f-b09b-977541d98539	17	47fa94e9-cc56-4f82-99df-a025f2603fb1	CUSTOMER_ORDER	OUT	CARTON	NONE	DRAFT	\N	2025-03-03 19:05:09.627613+01	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-03 19:05:01.388457+01	2025-03-09 17:30:41.204+01	f	\N	\N	\N
fb0a96cf-0d18-4135-bbec-7766fbf024c0	18	47fa94e9-cc56-4f82-99df-a025f2603fb1	CUSTOMER_ORDER	IN	PALLET	DELIVERY	READY	\N	2025-03-09 17:26:47.576155+01	Please clarify deliver and pickup???????	d2bc0533-2d03-4083-8188-e19cd504d256	2025-03-03 20:03:30.325251+01	2025-03-09 23:45:58.192+01	f	\N	\N	\N
2d2dd05b-c4b1-4b6c-9ca5-acbe367b0b38	22	8cb066e3-0f31-4d60-bb41-79c28c9f3b03	CUSTOMER_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-03-07 19:43:56.466776+01	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-06 18:15:42.274811+01	2025-03-07 19:43:56.576+01	f	\N	\N	\N
6d052ada-2749-4e07-9b5e-20b164716365	23	9acf39a7-8689-4502-9114-efbe39abc306	CUSTOMER_ORDER	IN	SACK	PICKUP	COMPLETED	\N	2025-03-11 14:55:06.352+01	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-07 19:45:03.586274+01	2025-03-11 14:55:06.464+01	f	\N	\N	\N
cc75d809-13e0-4c2e-a7b4-c9711991887e	19	0b50d290-b92c-485c-b74c-29ca449d8a7b	CUSTOMER_ORDER	IN	NONE	NONE	PENDING	\N	2025-03-07 00:24:02.349831+01	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-05 17:52:45.719263+01	2025-03-11 21:42:05.167+01	f	\N	\N	\N
84a978a1-669d-4af9-abd0-87f1be64c807	33	c0de8d84-e03d-4c4b-8731-49e0c0f016b5	CUSTOMER_ORDER	IN	NONE	NONE	READY	\N	2025-04-04 16:11:59.611879+02		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-04 16:11:59.611879+02	2025-04-04 16:12:15.199+02	f	\N	\N	\N
27c4b1ef-df0d-43b8-b947-8c1b4e5e2a93	27	26701cd8-cab1-4de8-a2c7-48e27378e4bf	CUSTOMER_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-03-14 14:58:44.665449+01		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-13 22:52:20.457034+01	2025-03-14 14:58:44.822+01	f	\N	\N	\N
3ad5fbfa-d340-4ff8-90ad-0f9bb27b335d	34	26701cd8-cab1-4de8-a2c7-48e27378e4bf	CUSTOMER_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-04-04 16:14:32.20858+02		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-04 16:14:32.20858+02	\N	f	\N	\N	\N
843abb66-94d8-4c8c-9819-d27d71e8f2f6	14	8cb066e3-0f31-4d60-bb41-79c28c9f3b03	CUSTOMER_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-03-11 23:04:40.239524+01		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-02 11:14:34.701564+01	2025-03-11 23:04:40.352+01	f	\N	\N	\N
1e1a0d9e-ed4c-4607-a4e8-8fc2dc25684b	25	47fa94e9-cc56-4f82-99df-a025f2603fb1	CUSTOMER_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-03-12 19:32:37.419842+01		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-12 19:31:54.307242+01	2025-03-12 19:32:37.522+01	f	\N	\N	\N
98ad87a6-e230-4e2f-be06-032a567b2959	36	c0de8d84-e03d-4c4b-8731-49e0c0f016b5	WAREHOUSE_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-04-05 20:23:49.184107+02		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-05 20:23:49.184107+02	\N	f	\N	\N	\N
4ed37a9e-65f7-4896-b1c9-bd45a9ede3c8	39	24a9b37c-0188-4e7d-a5b0-8d74209e4a3e	WAREHOUSE_ORDER	OUT	PALLET	DELIVERY	PENDING	\N	\N	Qui do fugiat consequat qui eiusmod eiusmod sit cupidatat aliquip sint cillum. Nisi tempor dolore Lorem dolor sunt irure labore mollit. Eiusmod est incididunt labore in proident dolore est enim occaecat quis sint. Sint sint laboris adipisicing sit duis dolor.	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-10 22:27:30.035213+02	2025-04-10 22:28:04.663+02	f	\N	\N	\N
9efe6bae-d8eb-4616-9126-3770be5bcf46	37	c0de8d84-e03d-4c4b-8731-49e0c0f016b5	WAREHOUSE_ORDER	IN	NONE	NONE	CANCELLED	\N	2025-04-05 20:56:00.005334+02		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-05 20:56:00.005334+02	2025-04-07 19:07:37.396+02	t	\N	\N	\N
e522577d-a20f-4a95-a8f6-e9cba7ab4713	16	4ef451a0-38f7-41fa-b534-63d851d0db57	CUSTOMER_ORDER	OUT	NONE	NONE	COMPLETED	\N	2025-03-02 16:55:00.258819+01	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-02 16:53:40.671275+01	2025-04-09 22:29:55.307+02	f	\N	\N	\N
c63bbf78-3897-4b0d-8f94-17953b049aca	32	c0de8d84-e03d-4c4b-8731-49e0c0f016b5	CUSTOMER_ORDER	IN	SACK	NONE	COMPLETED	\N	2025-04-03 15:08:23.151281+02	Veniam non sit occaecat do elit. Laboris in non ad fugiat ad sint. Veniam id non sit voluptate. Adipisicing eiusmod velit pariatur qui. Laboris mollit dolore enim cupidatat tempor ullamco ipsum quis consectetur non amet aute exercitation do.	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-03 15:07:57.194667+02	2025-04-10 18:25:36.68+02	f	\N	\N	\N
7f157b60-f153-4fbb-b368-cd586333e9c6	41	26701cd8-cab1-4de8-a2c7-48e27378e4bf	WAREHOUSE_ORDER	IN	NONE	NONE	PENDING	\N	\N		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-10 22:32:02.692167+02	\N	f	\N	\N	\N
32d025ff-ed47-4876-9dce-f532c33258ab	42	26701cd8-cab1-4de8-a2c7-48e27378e4bf	WAREHOUSE_ORDER	IN	NONE	NONE	PENDING	\N	\N		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-10 22:33:01.932021+02	\N	f	\N	\N	\N
3b87f997-3460-4e80-b31b-8c03727b8267	43	9acf39a7-8689-4502-9114-efbe39abc306	WAREHOUSE_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-04-10 23:41:03.19803+02	Non nisi magna non commodo adipisicing magna dolor nostrud magna. Ullamco esse sint commodo nisi laboris velit cillum magna excepteur in id laborum ut sint consectetur. Non nisi magna non commodo adipisicing magna dolor nostrud magna. Ullamco esse sint commodo nisi laboris velit cillum magna excepteur in id laborum ut sint consectetur. Consequat commodo pariatur non quis in fugiat id aliquip sunt. Duis non sit tempor in mollit ut pariatur anim. Incididunt eu commodo laborum officia fugiat excepteur ut consequat. Esse irure enim ea incididunt quis anim labore magna eu deserunt reprehenderit. Est anim incididunt minim aliquip aliqua aliquip Lorem esse voluptate dolore. Deserunt enim in ullamco laboris eiusmod cillum ipsum tempor dolore magna laborum consequat pariatur sit ad.Non nisi magna non commodo adipisicing magna dolor nostrud magna. Ullamco esse sint commodo nisi laboris velit cillum magna excepteur in id laborum ut sint consectetur. Consequat commodo pariatur non quis in fugiat id aliquip sunt. Duis non sit tempor in mollit ut pariatur anim. Incididunt eu commodo laborum officia fugiat excepteur ut consequat. Esse irure enim ea incididunt quis anim labore magna eu deserunt reprehenderit. Est anim incididunt minim aliquip aliqua aliquip Lorem esse voluptate dolore. Deserunt enim in ullamco laboris eiusmod cillum ipsum tempor dolore magna laborum consequat pariatur sit ad.Non nisi magna non commodo adipisicing magna dolor nostrud magna. Ullamco esse sint commodo nisi laboris velit cillum magna excepteur in id laborum ut sint consectetur. Consequat commodo pariatur non quis in fugiat id aliquip sunt. Duis non sit tempor in mollit ut pariatur anim. Incididunt eu commodo laborum officia fugiat excepteur ut consequat. Esse irure enim ea incididunt quis anim labore magna eu deserunt reprehenderit. Est anim incididunt minim aliquip aliqua aliquip Lorem esse voluptate dolore. Deserunt enim in ullamco laboris eiusmod cillum ipsum tempor dolore magna laborum consequat pariatur sit ad.Non nisi magna non commodo adipisicing magna dolor nostrud magna. Ullamco esse sint commodo nisi laboris velit cillum magna excepteur in id laborum ut sint consectetur. Consequat commodo pariatur non quis in fugiat id aliquip sunt. Duis non sit tempor in mollit ut pariatur anim. Incididunt eu commodo laborum officia fugiat excepteur ut consequat. Esse irure enim ea incididunt quis anim labore magna eu deserunt reprehenderit. Est anim incididunt minim aliquip aliqua aliquip Lorem esse voluptate dolore. Deserunt enim in ullamco laboris eiusmod cillum ipsum tempor dolore magna laborum consequat pariatur sit ad.Non nisi magna non commodo adipisicing magna dolor nostrud magna. Ullamco esse sint commodo nisi laboris velit cillum magna excepteur in id laborum ut sint consectetur. Consequat commodo pariatur non quis in fugiat id aliquip sunt. Duis non sit tempor in mollit ut pariatur anim. Incididunt eu commodo laborum officia fugiat excepteur ut consequat. Esse irure enim ea incididunt quis anim labore magna eu deserunt reprehenderit. Est anim incididunt minim aliquip aliqua aliquip Lorem esse voluptate dolore. Deserunt enim in ullamco laboris eiusmod cillum ipsum tempor dolore magna laborum consequat pariatur sit ad.Consequat commodo pariatur non quis in fugiat id aliquip sunt. Duis non sit tempor in mollit ut pariatur anim. Incididunt eu commodo laborum officia fugiat excepteur ut consequat. Esse irure enim ea incididunt quis anim labore magna eu deserunt reprehenderit. Est anim incididunt minim aliquip aliqua aliquip Lorem esse voluptate dolore. Deserunt enim in ullamco laboris eiusmod cillum ipsum tempor dolore magna laborum consequat pariatur sit ad.Non nisi magna non commodo adipisicing magna dolor nostrud magna. Ullamco esse sint commodo nisi laboris velit cillum magna excepteur in id laborum ut sint consectetur. Consequat commodo pariatur non quis in fugiat id aliquip sunt. Duis non sit tempor in mollit ut pariatur anim. Incididunt eu commodo laborum officia fugiat excepteur ut consequat. Esse irure enim ea incididunt quis anim labore magna eu deserunt reprehenderit. Est anim incididunt minim aliquip aliqua aliquip Lorem esse voluptate dolore. Deserunt enim in ullamco laboris eiusmod cillum ipsum tempor dolore magna laborum consequat pariatur sit ad.Non nisi magna non commodo adipisicing magna dolor nostrud magna. Ullamco esse sint commodo nisi laboris velit cillum magna excepteur in id laborum ut sint consectetur. Consequat commodo pariatur non quis in fugiat id aliquip sunt. Duis non sit tempor in mollit ut pariatur anim. Incididunt eu commodo laborum officia fugiat excepteur ut consequat. Esse irure enim ea incididunt quis anim labore magna eu deserunt reprehenderit. Est anim incididunt minim aliquip aliqua aliquip Lorem esse voluptate dolore. Deserunt enim in ullamco laboris eiusmod cillum ipsum tempor dolore magna laborum consequat pariatur sit ad.Non nisi magna non commodo adipisicing magna dolor nostrud magna. Ullamco esse sint commodo nisi laboris velit cillum magna excepteur in id laborum ut sint consectetur. Consequat commodo pariatur non quis in fugiat id aliquip sunt. Duis non sit tempor in mollit ut pariatur anim. Incididunt eu commodo laborum officia fugiat excepteur ut consequat. Esse irure enim ea incididunt quis anim labore magna eu deserunt reprehenderit. Est anim incididunt minim aliquip aliqua aliquip Lorem esse voluptate dolore. Deserunt enim in ullamco laboris eiusmod cillum ipsum tempor dolore magna laborum consequat pariatur sit ad.Non nisi magna non commodo adipisicing magna dolor nostrud magna. Ullamco esse sint commodo nisi laboris velit cillum magna excepteur in id laborum ut sint consectetur. Consequat commodo pariatur non quis in fugiat id aliquip sunt. Duis non sit tempor in mollit ut pariatur anim. Incididunt eu commodo laborum officia fugiat excepteur ut consequat. Esse irure enim ea incididunt quis anim labore magna eu deserunt reprehenderit. Est anim incididunt minim aliquip aliqua aliquip Lorem esse voluptate dolore. Deserunt enim in ullamco laboris eiusmod cillum ipsum tempor dolore magna laborum consequat pariatur sit ad.Non nisi magna non commodo adipisicing magna dolor nostrud magna. Ullamco esse sint commodo nisi laboris velit cillum magna excepteur in id laborum ut sint consectetur. Consequat commodo pariatur non quis in fugiat id aliquip sunt. Duis non sit tempor in mollit ut pariatur anim. Incididunt eu commodo laborum officia fugiat excepteur ut consequat. Esse irure enim ea incididunt quis anim labore magna eu deserunt reprehenderit. Est anim incididunt minim aliquip aliqua aliquip Lorem esse voluptate dolore. Deserunt enim in ullamco laboris eiusmod cillum ipsum tempor dolore magna laborum consequat pariatur sit ad.	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-10 23:41:03.19803+02	\N	f	\N	\N	\N
8da23fb6-5a73-474b-980a-da9e29299c4f	44	f79bd8a3-f272-41cc-aaf2-e1aee9900022	WAREHOUSE_ORDER	IN	NONE	NONE	PENDING	\N	\N		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 00:02:49.750317+02	\N	f	\N	\N	\N
43ba7965-13e1-4ef7-a528-027781a6fecd	40	26701cd8-cab1-4de8-a2c7-48e27378e4bf	WAREHOUSE_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-04-10 22:36:43.348162+02	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-10 22:29:57.351832+02	2025-04-10 22:36:43.344+02	f	\N	\N	\N
bce378bf-f6bc-444c-9937-ba1c0580b97e	35	9acf39a7-8689-4502-9114-efbe39abc306	CUSTOMER_ORDER	OUT	NONE	NONE	COMPLETED	\N	2025-04-10 23:00:04.655823+02		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-05 19:20:02.139243+02	2025-04-10 23:00:04.652+02	f	\N	\N	\N
0cd36696-a3b3-48db-ac5a-45b010c3da86	45	c0de8d84-e03d-4c4b-8731-49e0c0f016b5	WAREHOUSE_ORDER	IN	NONE	NONE	PENDING	\N	\N	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 00:06:35.319634+02	2025-04-11 00:07:07.331+02	f	\N	\N	\N
0ffe1a88-90b0-4005-a0e2-b92e0576e39e	46	47fa94e9-cc56-4f82-99df-a025f2603fb1	WAREHOUSE_ORDER	OUT	NONE	NONE	CANCELLED	\N	\N		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 00:08:55.139047+02	\N	f	\N	\N	\N
69124a2f-a463-43ff-9498-ca72fe5d64f3	47	47fa94e9-cc56-4f82-99df-a025f2603fb1	WAREHOUSE_ORDER	IN	OTHER	PICKUP	COMPLETED	\N	2025-04-11 00:10:11.034387+02		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 00:10:11.034387+02	\N	f	\N	\N	\N
87a5f1f0-86dc-4490-8786-4342a316deba	48	699321c5-d728-4cda-8f2c-15bd4f888f95	WAREHOUSE_ORDER	IN	CARTON	NONE	CANCELLED	\N	2025-04-12 10:04:06.769003+02	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 00:16:48.834976+02	2025-04-12 10:07:50.072+02	f	123	\N	\N
817e27e2-a7ed-4300-9a5a-edb479571e52	24	47fa94e9-cc56-4f82-99df-a025f2603fb1	CUSTOMER_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-04-16 20:41:10.305276+02	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-03-11 21:43:21.166306+01	2025-04-16 20:41:10.301+02	f	\N	\N	\N
61d03cce-3fd2-4bf7-856a-2b3f458f3225	50	47fa94e9-cc56-4f82-99df-a025f2603fb1	WAREHOUSE_ORDER	IN	NONE	NONE	PENDING	\N	\N		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 00:23:15.971006+02	\N	f	\N	\N	\N
516e2130-9f62-4a9c-8744-98bd7f3d2a19	51	26701cd8-cab1-4de8-a2c7-48e27378e4bf	WAREHOUSE_ORDER	IN	NONE	NONE	PENDING	\N	\N		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 00:24:38.63185+02	\N	f	\N	\N	\N
b628f270-4ce7-4df6-b614-b16c7a1b25ea	52	c0de8d84-e03d-4c4b-8731-49e0c0f016b5	WAREHOUSE_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-04-11 00:29:53.159654+02		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 00:29:53.159654+02	\N	f	\N	\N	\N
c61dc9ac-0235-4a60-963a-005499e3cf47	53	c0de8d84-e03d-4c4b-8731-49e0c0f016b5	WAREHOUSE_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-04-11 00:31:03.59855+02		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 00:31:03.59855+02	\N	f	\N	\N	\N
d25cb26c-97a8-4183-8f5c-6b465da223ac	54	f79bd8a3-f272-41cc-aaf2-e1aee9900022	WAREHOUSE_ORDER	IN	NONE	NONE	PENDING	\N	\N	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 01:14:04.023114+02	2025-04-11 01:44:59.108+02	f	LOL	\N	\N
6356878d-4704-4ad7-8eda-e79b10290414	57	26701cd8-cab1-4de8-a2c7-48e27378e4bf	WAREHOUSE_ORDER	IN	NONE	NONE	PENDING	\N	\N		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 19:56:17.48615+02	\N	f	\N	\N	\N
7b8b9905-316e-4cb9-9e4d-32a7751fa730	56	f79bd8a3-f272-41cc-aaf2-e1aee9900022	WAREHOUSE_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-04-11 19:46:41.398797+02	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 19:46:41.398797+02	2025-04-11 19:57:05.197+02	f	\N	\N	\N
a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	38	47fa94e9-cc56-4f82-99df-a025f2603fb1	WAREHOUSE_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-04-10 23:37:30.279445+02	Veniam non sit occaecat do elit. Laboris in non ad fugiat ad sint. Veniam id non sit voluptate. Adipisicing eiusmod velit pariatur qui. Laboris mollit dolore enim cupidatat tempor ullamco ipsum quis consectetur non amet aute exercitation do.Veniam non sit occaecat do elit. Laboris in non ad fugiat ad sint. Veniam id non sit voluptate. Adipisicing eiusmod velit pariatur qui. Laboris mollit dolore enim cupidatat tempor ullamco ipsum quis consectetur non amet aute exercitation do.	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-09 21:49:28.587446+02	2025-04-11 22:12:58.392+02	f	\N	\N	\N
97ab39e6-2055-49e3-baa9-65ff423ff108	58	47fa94e9-cc56-4f82-99df-a025f2603fb1	WAREHOUSE_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-04-11 20:35:19.000231+02	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 20:35:19.000231+02	2025-04-11 22:58:12.042+02	f	\N	\N	\N
9abf3335-0ed4-4d2f-9104-0c214d0cf3a2	59	24a9b37c-0188-4e7d-a5b0-8d74209e4a3e	WAREHOUSE_ORDER	OUT	NONE	NONE	COMPLETED	\N	2025-04-12 20:18:43.414723+02	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 20:18:43.414723+02	2025-04-12 20:23:57.66+02	f	\N	\N	\N
01f96baf-7b65-4893-b009-5afae795a83e	49	8cb066e3-0f31-4d60-bb41-79c28c9f3b03	WAREHOUSE_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-04-12 20:35:00.604527+02		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 00:19:22.571542+02	2025-04-12 20:35:00.602+02	f	\N	\N	\N
0312fa40-107d-45f9-b51e-0bdccfc1a447	55	24a9b37c-0188-4e7d-a5b0-8d74209e4a3e	WAREHOUSE_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-04-12 11:33:00.586458+02	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-11 18:54:44.000394+02	2025-04-12 21:11:17.654+02	f	\N	\N	\N
25775123-f77f-4678-8722-cd5efa6aef5f	61	26701cd8-cab1-4de8-a2c7-48e27378e4bf	WAREHOUSE_ORDER	IN	NONE	NONE	PENDING	\N	\N		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 21:14:48.647618+02	\N	f	\N	\N	\N
c200b3cb-4204-48ba-b12b-ff17858528a3	62	26701cd8-cab1-4de8-a2c7-48e27378e4bf	WAREHOUSE_ORDER	IN	NONE	NONE	PENDING	\N	\N		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 23:35:53.300225+02	\N	f	\N	\N	\N
18882946-f3c4-4c0e-aa61-b26af1263f14	63	26701cd8-cab1-4de8-a2c7-48e27378e4bf	WAREHOUSE_ORDER	IN	NONE	NONE	PENDING	\N	\N		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-13 00:15:08.526633+02	\N	f	\N	\N	\N
8291413f-0732-4556-9e40-3e02f5272984	64	d2fd6f90-b55b-4a33-bf7d-ee956333d75c	WAREHOUSE_ORDER	IN	NONE	NONE	PENDING	\N	\N		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-13 00:27:32.764877+02	\N	f	\N	\N	\N
afb30c02-3c24-4b82-bfdb-8b6951cf7ec9	65	24a9b37c-0188-4e7d-a5b0-8d74209e4a3e	WAREHOUSE_ORDER	IN	NONE	NONE	PENDING	\N	\N		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-13 17:21:23.767351+02	\N	f	\N	\N	\N
48b5b580-68bd-425c-9535-4a71d17648b5	66	26701cd8-cab1-4de8-a2c7-48e27378e4bf	WAREHOUSE_ORDER	IN	NONE	NONE	PENDING	\N	\N		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-13 17:43:35.764196+02	\N	f	\N	\N	\N
cfeb8660-db8e-44ae-9fb0-599a5402a84f	69	47fa94e9-cc56-4f82-99df-a025f2603fb1	WAREHOUSE_ORDER	OUT	NONE	NONE	COMPLETED	\N	2025-04-16 17:29:51.105196+02		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-16 17:29:51.105196+02	\N	f	\N	\N	\N
188ce518-956e-4e45-9d70-c47379015e67	60	47fa94e9-cc56-4f82-99df-a025f2603fb1	WAREHOUSE_ORDER	IN	NONE	NONE	COMPLETED	\N	2025-04-16 20:41:31.966742+02		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-12 21:11:45.729339+02	2025-04-16 20:41:31.963+02	f	\N	\N	\N
bc7f369a-af70-4c3d-93d5-90ca937b42bc	70	47fa94e9-cc56-4f82-99df-a025f2603fb1	WAREHOUSE_ORDER	IN	NONE	NONE	PENDING	\N	\N		a3d39555-33b4-4fa8-bbe9-99226a3140df	2025-04-18 19:08:55.2977+02	\N	f	\N	\N	\N
bc562823-f2d4-4a78-849c-cf3867b4338e	71	699321c5-d728-4cda-8f2c-15bd4f888f95	WAREHOUSE_ORDER	IN	NONE	NONE	PENDING	\N	\N		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-20 15:17:10.180322+02	\N	f	\N	\N	\N
a6f738e6-8f13-4636-8ad5-d2aa266bec9d	67	5c2532e6-4c28-4b25-92b6-3f07852d83cc	WAREHOUSE_ORDER	IN	NONE	NONE	PENDING	\N	\N	\N	4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-15 19:44:37.306872+02	2025-04-21 23:07:46.243+02	f	ABC	\N	\N
920a897a-910f-41c4-ac23-f19edd360d7a	72	24a9b37c-0188-4e7d-a5b0-8d74209e4a3e	WAREHOUSE_ORDER	IN	NONE	NONE	PENDING	\N	\N		4bb68f57-fc14-4e49-96a4-f26c75418547	2025-04-22 21:03:53.537164+02	\N	f	\N	\N	\N
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.stock_movements (movement_id, item_id, location_id, movement_type, quantity, reference_type, reference_id, notes, created_by, created_at, movement_number) FROM stdin;
f14aa858-7eed-47e2-a3e3-af7dd2351214	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	500	ORDER_COMPLETION	348f064e-0ad8-4957-aa29-903f01ed90ba	[TX#1] Order Completed - Addition Inventory	\N	2025-02-26 19:26:10.791623+01	1
14e7e549-ec8d-4836-b1fe-660236d6eae7	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	500	ORDER_REVERSAL	348f064e-0ad8-4957-aa29-903f01ed90ba	[TX#2][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-02-26 19:26:45.442048+01	2
9f2bb528-32a6-4d65-b6bf-6bcebf407d4c	e5048e03-378c-4b54-b5e5-c6198ce728c6	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	999	ORDER_COMPLETION	b89314e9-5479-4dae-95b0-61ec620fba66	[TX#1] Order Completed - Addition Inventory	\N	2025-02-26 19:34:33.028936+01	3
59497c53-4eb3-4349-ad1f-00c343143834	d38771e5-024b-44c8-93e4-95b44bb52a04	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	3	ORDER_COMPLETION	7fc238df-ae32-42bb-bf95-76620ab355f1	[TX#1] Order Completed - Addition Inventory	\N	2025-02-26 19:39:04.784925+01	4
5c13f16c-e2f2-437c-b9d3-8c034c8f9b27	d38771e5-024b-44c8-93e4-95b44bb52a04	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	3	ORDER_REVERSAL	7fc238df-ae32-42bb-bf95-76620ab355f1	[TX#2][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-02-26 19:44:27.083807+01	5
cfa2caf1-67f5-4aa0-9aa6-9754251f8042	d38771e5-024b-44c8-93e4-95b44bb52a04	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	3	ORDER_COMPLETION	7fc238df-ae32-42bb-bf95-76620ab355f1	[TX#3] Order Completed - Addition Inventory	\N	2025-02-26 19:45:23.959385+01	6
aa53a315-ecdb-4e71-b26a-6f774fa190ac	d38771e5-024b-44c8-93e4-95b44bb52a04	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	2	ORDER_COMPLETION	ea3ffcbf-1a45-4636-8b06-019d1bb9d320	[TX#1] Order Completed - Deduction Inventory	\N	2025-02-26 19:46:38.182765+01	7
4c02070a-10e5-42d6-a682-da3d82af7817	d38771e5-024b-44c8-93e4-95b44bb52a04	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	2	ORDER_REVERSAL	ea3ffcbf-1a45-4636-8b06-019d1bb9d320	[TX#2][REVERSAL] Order Uncompleted - Reversing Previous OUT	\N	2025-02-26 19:48:43.97534+01	8
5db7fd76-a8c6-4d66-a650-e7aeee710b96	d38771e5-024b-44c8-93e4-95b44bb52a04	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	2	ORDER_COMPLETION	ea3ffcbf-1a45-4636-8b06-019d1bb9d320	[TX#3] Order Completed - Addition Inventory	\N	2025-02-26 19:49:05.89907+01	9
daa7a28b-af69-44be-8aba-0b45efa7b820	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	1000	ORDER_COMPLETION	8b2a1619-2e24-41a3-be9e-e794fc633b1c	[TX#1] Order Completed - Addition Inventory	\N	2025-02-26 20:50:18.009653+01	10
8ba23785-8a58-4751-a60b-51060598f30f	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	500	ORDER_COMPLETION	348f064e-0ad8-4957-aa29-903f01ed90ba	[TX#3] Order Completed - Deduction Inventory	\N	2025-02-26 20:55:35.630186+01	11
6433fbba-47aa-4efe-8dda-b42237858561	d38771e5-024b-44c8-93e4-95b44bb52a04	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	2	ORDER_REVERSAL	ea3ffcbf-1a45-4636-8b06-019d1bb9d320	[TX#4][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-02-26 20:56:59.724794+01	12
58f44500-2b40-408e-9f07-549880a64d6a	d38771e5-024b-44c8-93e4-95b44bb52a04	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	2	ORDER_COMPLETION	ea3ffcbf-1a45-4636-8b06-019d1bb9d320	[TX#5] Order Completed - Addition Inventory	\N	2025-02-26 21:00:54.568085+01	13
73e8ddfd-61b8-4400-b307-38ad2b029884	e5048e03-378c-4b54-b5e5-c6198ce728c6	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	999	ORDER_REVERSAL	b89314e9-5479-4dae-95b0-61ec620fba66	[TX#2][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-02-26 21:01:23.027151+01	14
91bf0a31-fde3-472d-b3c4-39bcb1b226b2	d38771e5-024b-44c8-93e4-95b44bb52a04	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	2	ORDER_REVERSAL	ea3ffcbf-1a45-4636-8b06-019d1bb9d320	[TX#6][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-02-27 18:18:26.502404+01	15
7a89f058-279d-49d3-b00c-5cc0ef27d817	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	500	ORDER_REVERSAL	348f064e-0ad8-4957-aa29-903f01ed90ba	[TX#4][REVERSAL] Order Uncompleted - Reversing Previous OUT	\N	2025-02-27 21:56:17.249168+01	16
075c39e6-9ef6-4ef1-ad13-4dcd9e8032f4	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	500	ORDER_COMPLETION	348f064e-0ad8-4957-aa29-903f01ed90ba	[TX#5] Order Completed - Deduction Inventory	\N	2025-02-27 21:56:53.160861+01	17
d2c35c0c-49d4-4b2b-9ca5-358a075b86fd	0a408a8c-7219-4589-ae5e-2b1c3c8848d0	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	3	ORDER_REVERSAL	a07d9511-dc03-42b3-85c5-a7a01a88dd37	[TX#1][REVERSAL] Order Uncompleted - Reversing Previous OUT	\N	2025-02-27 21:58:39.273533+01	18
bed3988b-9e23-4097-8aff-371a60758c62	0a408a8c-7219-4589-ae5e-2b1c3c8848d0	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	3	ORDER_COMPLETION	a07d9511-dc03-42b3-85c5-a7a01a88dd37	[TX#2] Order Completed - Deduction Inventory	\N	2025-03-02 11:12:22.360154+01	19
54a57fd0-f4e8-4451-ae17-06623c941a88	36de253f-52b6-4f3c-bece-a415c010636a	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	600	ORDER_COMPLETION	8fe8db50-e0ca-49b4-8adc-fdf0b8a6cf57	[TX#1] Order Completed - Addition Inventory	\N	2025-03-02 11:13:58.388663+01	20
5799af6d-2fc4-4581-9b36-0422e96c410a	36de253f-52b6-4f3c-bece-a415c010636a	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	500	ORDER_COMPLETION	12a423f3-acaf-4f45-847b-770910382809	[TX#1] Order Completed - Deduction Inventory	\N	2025-03-02 11:17:34.05932+01	25
f8b70973-dfa5-4d6b-a763-015a9b9dc6f9	36de253f-52b6-4f3c-bece-a415c010636a	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	600	ORDER_REVERSAL	8fe8db50-e0ca-49b4-8adc-fdf0b8a6cf57	[TX#2][REVERSAL] Order Uncompleted - Reversing Previous OUT	\N	2025-03-02 11:18:11.817542+01	27
c427fa11-a860-4a6a-83b4-013529ddd1be	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	100	ORDER_COMPLETION	843abb66-94d8-4c8c-9819-d27d71e8f2f6	[TX#1] Order Completed - Addition Inventory	\N	2025-03-02 16:02:57.49325+01	30
c39e69db-00d9-42dc-a2ba-149b3713e808	36c7a838-779c-4aef-a934-5b847242906e	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	100	ORDER_COMPLETION	843abb66-94d8-4c8c-9819-d27d71e8f2f6	[TX#1] Order Completed - Addition Inventory	\N	2025-03-02 16:02:57.49325+01	31
7cbc268d-f021-4db0-a583-b196efad99f4	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	100	ORDER_REVERSAL	843abb66-94d8-4c8c-9819-d27d71e8f2f6	[TX#3][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-02 16:27:35.602058+01	33
7a92ac3b-ac65-4f91-8848-25e11a5df512	36c7a838-779c-4aef-a934-5b847242906e	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	100	ORDER_REVERSAL	843abb66-94d8-4c8c-9819-d27d71e8f2f6	[TX#3][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-02 16:27:35.602058+01	34
b6307230-c50c-420e-99e5-335a4b1f5a27	36de253f-52b6-4f3c-bece-a415c010636a	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	500	ORDER_REVERSAL	12a423f3-acaf-4f45-847b-770910382809	[TX#2][REVERSAL] Order Uncompleted - Reversing Previous OUT	\N	2025-03-02 16:51:29.937787+01	35
8498734f-8296-4243-bbd0-07522907c39d	86f64e5d-0d86-4549-b3a1-41b01af4ce31	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	100	ORDER_COMPLETION	e522577d-a20f-4a95-a8f6-e9cba7ab4713	[TX#1] Order Completed - Addition Inventory	\N	2025-03-02 16:54:05.490291+01	36
887cbc95-8808-49e2-be5e-5140d714bd7f	86f64e5d-0d86-4549-b3a1-41b01af4ce31	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	100	ORDER_REVERSAL	e522577d-a20f-4a95-a8f6-e9cba7ab4713	[TX#2][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-02 16:54:26.672696+01	37
64afa0ce-d7b7-4881-ab10-785f535d509e	86f64e5d-0d86-4549-b3a1-41b01af4ce31	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	100	ORDER_COMPLETION	e522577d-a20f-4a95-a8f6-e9cba7ab4713	[TX#3] Order Completed - Addition Inventory	\N	2025-03-02 16:55:00.258819+01	39
121f96bf-a011-4e68-b23b-bb62858b9dcf	0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	666	ORDER_COMPLETION	cf78d2bf-4565-422f-b09b-977541d98539	[TX#1] Order Completed - Addition Inventory	\N	2025-03-03 19:05:09.627613+01	40
87615aaa-f6c5-4840-92f9-46260daaff8c	406843e4-8e07-46ff-a9db-2addcbe781ea	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	3	ORDER_COMPLETION	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#1] Order Completed - Addition Inventory	\N	2025-03-03 20:04:58.882707+01	41
7b3c155a-d9ac-4d29-94b1-af05fa97fd25	0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	2	ORDER_COMPLETION	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#1] Order Completed - Addition Inventory	\N	2025-03-03 20:04:58.882707+01	42
e9a5a9f9-490a-467a-84ee-522729c97362	d38771e5-024b-44c8-93e4-95b44bb52a04	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	2	ORDER_COMPLETION	ea3ffcbf-1a45-4636-8b06-019d1bb9d320	[TX#7] Order Completed - Addition Inventory	\N	2025-03-04 13:15:15.927063+01	43
008122af-6129-4f04-8c27-330e19f6f615	36de253f-52b6-4f3c-bece-a415c010636a	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	500	ORDER_COMPLETION	12a423f3-acaf-4f45-847b-770910382809	[TX#3] Order Completed - Deduction Inventory	\N	2025-03-04 19:06:31.349602+01	44
21854905-1897-4b3e-bb2e-32d13700914d	d38771e5-024b-44c8-93e4-95b44bb52a04	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	2	ORDER_REVERSAL	ea3ffcbf-1a45-4636-8b06-019d1bb9d320	[TX#8][REVERSAL] Order Uncompleted - Reversing Previous OUT	\N	2025-03-05 13:10:37.306137+01	45
26e6fe02-2c61-4263-82d5-b325de9c4134	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	100	ORDER_COMPLETION	843abb66-94d8-4c8c-9819-d27d71e8f2f6	[TX#5] Order Completed - Addition Inventory	\N	2025-03-05 13:31:28.272682+01	46
ec8bb47e-bb63-4308-a9ba-98092e724d9b	36c7a838-779c-4aef-a934-5b847242906e	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	100	ORDER_COMPLETION	843abb66-94d8-4c8c-9819-d27d71e8f2f6	[TX#5] Order Completed - Addition Inventory	\N	2025-03-05 13:31:28.272682+01	47
1f17b4af-71c0-4f8e-a40f-4746172560a0	d1600c44-73cc-4630-a978-d59c36097954	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	1	ORDER_COMPLETION	cc75d809-13e0-4c2e-a7b4-c9711991887e	[TX#1] Order Completed - Addition Inventory	\N	2025-03-05 17:52:52.683981+01	48
9456a0f4-a71b-4a0f-a908-bd1de3d8cf9f	d1600c44-73cc-4630-a978-d59c36097954	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	1	ORDER_REVERSAL	cc75d809-13e0-4c2e-a7b4-c9711991887e	[TX#2][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-05 17:53:25.674907+01	49
2126ca33-394f-459d-8550-375206015b43	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	1000	ORDER_COMPLETION	e02cfecf-a7c3-4d9c-a89f-e0aa75890de3	[TX#1] Order Completed - Addition Inventory	\N	2025-03-05 17:55:19.601174+01	50
bf665465-a58a-4b8b-b7a1-785b9969c32c	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	1000	ORDER_REVERSAL	e02cfecf-a7c3-4d9c-a89f-e0aa75890de3	[TX#2][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-05 18:04:40.198682+01	51
9796a4b0-1558-4afd-b5f1-8e37874a51b5	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	1000	ORDER_COMPLETION	e02cfecf-a7c3-4d9c-a89f-e0aa75890de3	[TX#3] Order Completed - Addition Inventory	\N	2025-03-05 18:11:16.124997+01	52
9a7e85b3-2a85-4269-b1ff-9450c9c63e51	92226cb9-df00-4212-9d36-30b3b94d1c19	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	1	ORDER_COMPLETION	1605d5c4-4ea6-45cd-b730-c1e5d8468f10	[TX#1] Order Completed - Addition Inventory	\N	2025-03-05 20:15:39.455001+01	53
494c29e8-ce2c-49d0-8f7c-c585bc5d3d34	92226cb9-df00-4212-9d36-30b3b94d1c19	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	1	ORDER_REVERSAL	1605d5c4-4ea6-45cd-b730-c1e5d8468f10	[TX#2][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-05 20:15:49.325526+01	54
451991f0-31b3-440f-a937-eeaf62b08383	92226cb9-df00-4212-9d36-30b3b94d1c19	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	1	ORDER_COMPLETION	1605d5c4-4ea6-45cd-b730-c1e5d8468f10	[TX#3] Order Completed - Addition Inventory	\N	2025-03-05 20:15:56.635978+01	55
58bb7c02-3d4b-4a32-a4ab-97f007842b45	92226cb9-df00-4212-9d36-30b3b94d1c19	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	1	ORDER_REVERSAL	1605d5c4-4ea6-45cd-b730-c1e5d8468f10	[TX#4][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-05 20:24:55.701542+01	56
72ff5479-519e-4dab-903b-b852a068cd50	92226cb9-df00-4212-9d36-30b3b94d1c19	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	1	ORDER_COMPLETION	1605d5c4-4ea6-45cd-b730-c1e5d8468f10	[TX#5] Order Completed - Addition Inventory	\N	2025-03-05 20:25:58.197226+01	57
4c902b9b-f834-440c-ba6d-22bd5ba4e272	36c7a838-779c-4aef-a934-5b847242906e	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	6	ORDER_COMPLETION	2d2dd05b-c4b1-4b6c-9ca5-acbe367b0b38	[TX#1] Order Completed - Addition Inventory	\N	2025-03-06 18:16:28.77413+01	58
1f7b75ad-044e-481c-b886-8a7bacfe0fa1	406843e4-8e07-46ff-a9db-2addcbe781ea	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	3	ORDER_REVERSAL	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#3][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-06 23:18:16.858879+01	59
f6da466b-868c-47cd-9b72-7c90577736e4	0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	2	ORDER_REVERSAL	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#3][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-06 23:18:16.858879+01	60
283402ac-a573-4978-aabc-0b665d82af4d	36c7a838-779c-4aef-a934-5b847242906e	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	6	ORDER_REVERSAL	2d2dd05b-c4b1-4b6c-9ca5-acbe367b0b38	[TX#2][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-06 23:49:37.379409+01	61
0ad6511b-b367-4d2a-a5cd-2691a96d2401	d1600c44-73cc-4630-a978-d59c36097954	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	1	ORDER_COMPLETION	cc75d809-13e0-4c2e-a7b4-c9711991887e	[TX#3] Order Completed - Addition Inventory	\N	2025-03-07 00:24:02.349831+01	62
622c0802-f7ea-4a02-95ce-963cf8b426b4	36c7a838-779c-4aef-a934-5b847242906e	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	6	ORDER_COMPLETION	2d2dd05b-c4b1-4b6c-9ca5-acbe367b0b38	[TX#3] Order Completed - Addition Inventory	\N	2025-03-07 19:43:56.466776+01	63
f3ff7ecb-e095-45f7-9fdd-0c832223b3b7	0a408a8c-7219-4589-ae5e-2b1c3c8848d0	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	345	ORDER_COMPLETION	6d052ada-2749-4e07-9b5e-20b164716365	[TX#1] Order Completed - Addition Inventory	\N	2025-03-07 19:45:10.11081+01	64
d24d20aa-a8ca-4e73-a51c-c2ec1672ab03	406843e4-8e07-46ff-a9db-2addcbe781ea	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	3	ORDER_COMPLETION	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#5] Order Completed - Addition Inventory	\N	2025-03-09 13:41:27.757524+01	65
3cd08973-87a5-4c82-9630-986372bca776	0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	2	ORDER_COMPLETION	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#5] Order Completed - Addition Inventory	\N	2025-03-09 13:41:27.757524+01	66
2b4a0b7c-eb8d-4a6d-b280-43a43bb6a82d	0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	2	ORDER_REVERSAL	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#7][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-09 13:41:49.307163+01	67
1b290927-bf0f-4d8b-b5c3-da6393f52e71	406843e4-8e07-46ff-a9db-2addcbe781ea	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	3	ORDER_REVERSAL	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#7][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-09 13:41:49.307163+01	68
94e33a3c-7831-4d24-a6cf-cc467f3703b1	406843e4-8e07-46ff-a9db-2addcbe781ea	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	3	ORDER_COMPLETION	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#9] Order Completed - Addition Inventory	\N	2025-03-09 13:41:57.516997+01	69
8dc8ae3b-1c94-4b17-9bc8-851ad5fde36b	0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	2	ORDER_COMPLETION	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#9] Order Completed - Addition Inventory	\N	2025-03-09 13:41:57.516997+01	70
cad674f7-71e3-4399-8b90-866c3ff61eae	0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	2	ORDER_REVERSAL	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#11][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-09 13:42:03.900027+01	71
6c1ebf3a-5188-42f4-b342-9bae607c197d	406843e4-8e07-46ff-a9db-2addcbe781ea	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	3	ORDER_REVERSAL	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#11][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-09 13:42:03.900027+01	72
cc0517dc-1c61-43ba-b426-f980701f0524	406843e4-8e07-46ff-a9db-2addcbe781ea	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	3	ORDER_COMPLETION	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#13] Order Completed - Addition Inventory	\N	2025-03-09 13:42:14.552531+01	73
2f36b209-0ba3-4746-85fd-9d0b0bfcd50b	0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	2	ORDER_COMPLETION	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#13] Order Completed - Addition Inventory	\N	2025-03-09 13:42:14.552531+01	74
4502b121-852a-44f6-88f8-5011caa86609	0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	2	ORDER_REVERSAL	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#15][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-09 13:42:26.442116+01	75
a5acb318-9e91-4ede-a396-0fd2ccaba2fe	406843e4-8e07-46ff-a9db-2addcbe781ea	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	3	ORDER_REVERSAL	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#15][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-09 13:42:26.442116+01	76
729c30f9-1c02-4e08-a8e0-f4381a03e9b2	0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	666	ORDER_REVERSAL	cf78d2bf-4565-422f-b09b-977541d98539	[TX#2][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-09 17:03:55.399161+01	77
e73c1fb4-56d2-4b33-85cd-4b429b36a61e	0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	2	ORDER_COMPLETION	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#17] Order Completed - Addition Inventory	\N	2025-03-09 17:14:30.347848+01	78
6592e7da-4b1e-4a56-b96e-ff314d0a5e66	406843e4-8e07-46ff-a9db-2addcbe781ea	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	3	ORDER_COMPLETION	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#17] Order Completed - Addition Inventory	\N	2025-03-09 17:14:30.347848+01	79
f6e1aa9e-f5f1-437b-b457-7be7ddc1c19a	0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	2	ORDER_REVERSAL	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#19][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-09 17:14:58.96933+01	80
1285dc25-8eec-49ba-9a78-640c2b777100	406843e4-8e07-46ff-a9db-2addcbe781ea	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	3	ORDER_REVERSAL	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#19][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-09 17:14:58.96933+01	81
b9794964-902d-4083-9df3-49f055874529	0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	2	ORDER_COMPLETION	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#21] Order Completed - Addition Inventory	\N	2025-03-09 17:26:47.576155+01	82
0731f9b2-322a-4bbf-9676-6cf2105de1b1	406843e4-8e07-46ff-a9db-2addcbe781ea	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	3	ORDER_COMPLETION	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#21] Order Completed - Addition Inventory	\N	2025-03-09 17:26:47.576155+01	83
dfda9d62-040c-42a8-9017-6883644de7a2	0a408a8c-7219-4589-ae5e-2b1c3c8848d0	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	345	ORDER_REVERSAL	6d052ada-2749-4e07-9b5e-20b164716365	[TX#2][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-09 17:27:06.330355+01	84
8b25aa99-b0ec-4ebe-b50b-d3187b7b6aee	0a408a8c-7219-4589-ae5e-2b1c3c8848d0	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	345	ORDER_COMPLETION	6d052ada-2749-4e07-9b5e-20b164716365	[TX#3] Order Completed - Addition Inventory	\N	2025-03-09 17:27:43.46863+01	85
33580da8-276c-4018-bc21-fc394da9945f	0a408a8c-7219-4589-ae5e-2b1c3c8848d0	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	345	ORDER_REVERSAL	6d052ada-2749-4e07-9b5e-20b164716365	[TX#4][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-09 17:28:21.12054+01	86
60c4c79c-9cf4-4e6c-bb68-0e17411fcaef	0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	2	ORDER_REVERSAL	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#23][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-09 23:45:58.078705+01	89
ed8990be-05ac-4c04-b20c-ba25a1cf1d75	406843e4-8e07-46ff-a9db-2addcbe781ea	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	3	ORDER_REVERSAL	fb0a96cf-0d18-4135-bbec-7766fbf024c0	[TX#23][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-09 23:45:58.078705+01	90
b52dd95f-e9b5-4d9f-94d9-736af5527c93	0a408a8c-7219-4589-ae5e-2b1c3c8848d0	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	345	ORDER_COMPLETION	6d052ada-2749-4e07-9b5e-20b164716365	[TX#5] Order Completed - Addition Inventory	\N	2025-03-09 23:46:15.966475+01	91
a1553f90-a1b7-40a8-92a6-c80d6fb05dd7	0a408a8c-7219-4589-ae5e-2b1c3c8848d0	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	345	ORDER_REVERSAL	6d052ada-2749-4e07-9b5e-20b164716365	[TX#6][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-11 14:54:36.350766+01	93
33fee64a-2337-4691-b64c-062b9f9c41b2	0a408a8c-7219-4589-ae5e-2b1c3c8848d0	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	345	ORDER_COMPLETION	6d052ada-2749-4e07-9b5e-20b164716365	[TX#7] Order Completed - Addition Inventory	\N	2025-03-11 14:55:06.352+01	94
6a032cc4-c2fd-42e4-9953-cf6e00e37940	d1600c44-73cc-4630-a978-d59c36097954	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	1	ORDER_REVERSAL	cc75d809-13e0-4c2e-a7b4-c9711991887e	[TX#4][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-11 21:42:05.05349+01	95
c5add842-5ecd-4d46-861b-7240a92be2d6	e36c5e32-4990-4b86-a7d1-143b9c1bf8ac	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	68999	ORDER_COMPLETION	817e27e2-a7ed-4300-9a5a-edb479571e52	[TX#1] Order Completed - Addition Inventory	\N	2025-03-11 21:43:58.330448+01	96
eabf8b05-cde6-4843-bef3-e5579f23166e	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	100	ORDER_REVERSAL	843abb66-94d8-4c8c-9819-d27d71e8f2f6	[TX#7][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-11 23:03:52.437471+01	97
5498d7e2-5518-47f5-ba48-cd33deafeaa1	36c7a838-779c-4aef-a934-5b847242906e	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	100	ORDER_REVERSAL	843abb66-94d8-4c8c-9819-d27d71e8f2f6	[TX#7][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-11 23:03:52.437471+01	98
e9a47eac-7812-4381-8fae-baa679caaa30	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	100	ORDER_COMPLETION	843abb66-94d8-4c8c-9819-d27d71e8f2f6	[TX#9] Order Completed - Addition Inventory	\N	2025-03-11 23:04:40.239524+01	99
e38b3968-1176-48e6-8d7e-96db9075e8f9	36c7a838-779c-4aef-a934-5b847242906e	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	100	ORDER_COMPLETION	843abb66-94d8-4c8c-9819-d27d71e8f2f6	[TX#9] Order Completed - Addition Inventory	\N	2025-03-11 23:04:40.239524+01	100
3aa0a26e-b714-4928-a640-420e61874b64	36c7a838-779c-4aef-a934-5b847242906e	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	4	ORDER_COMPLETION	843abb66-94d8-4c8c-9819-d27d71e8f2f6	[TX#9] Order Completed - Addition Inventory	\N	2025-03-11 23:04:40.239524+01	101
1d7569f4-ee36-4b23-a4cf-26726dbb7637	63678a82-5e9c-4290-82b7-4b7e901966b9	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	10	ORDER_COMPLETION	1e1a0d9e-ed4c-4607-a4e8-8fc2dc25684b	[TX#1] Order Completed - Addition Inventory	\N	2025-03-12 19:32:37.419842+01	102
15ab7e58-a0cf-4a79-9190-ff891172a439	406843e4-8e07-46ff-a9db-2addcbe781ea	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	10	ORDER_COMPLETION	1e1a0d9e-ed4c-4607-a4e8-8fc2dc25684b	[TX#1] Order Completed - Addition Inventory	\N	2025-03-12 19:32:37.419842+01	103
94dec7f4-e61c-4fca-a370-9b65f3c9fcd0	7759dc13-bafa-42f3-97ed-c6ab38785952	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	10000000	ORDER_COMPLETION	595a8270-c70b-48ef-913b-efc98abf09bd	[TX#1] Order Completed - Addition Inventory	\N	2025-03-13 00:32:58.164708+01	104
f840638f-783e-4f58-85f5-0288506edbb0	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	1000	ORDER_REVERSAL	e02cfecf-a7c3-4d9c-a89f-e0aa75890de3	[TX#4][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-14 00:19:33.775484+01	107
4aa5b2b3-2c19-46a6-b3ce-ea35f6e35039	23f898dc-26f3-478b-b294-c20f638a9706	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	10	ORDER_REVERSAL	3755716b-97ff-4b6f-a9ce-7aeb979d600c	[TX#2][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-03-14 15:14:50.641614+01	129
fefe8c5c-7ead-4c7b-baff-6b78a9cd369d	23f898dc-26f3-478b-b294-c20f638a9706	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	10	ORDER_COMPLETION	3755716b-97ff-4b6f-a9ce-7aeb979d600c	[TX#1] Order Completed - Addition Inventory	\N	2025-03-14 15:13:24.84863+01	128
306a1dc5-6c6c-4fa8-9f0a-e8fbaf4630b5	23f898dc-26f3-478b-b294-c20f638a9706	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	10	ORDER_COMPLETION	3755716b-97ff-4b6f-a9ce-7aeb979d600c	[TX#3] Order Completed - Addition Inventory	\N	2025-03-14 15:15:40.756923+01	130
f8a7b3a1-f9d6-4c73-8e34-42e4af790382	41b8fd1a-0927-4fb9-8d89-ced69f87c2d3	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	10	ORDER_COMPLETION	8565f6c3-a94b-44a2-a104-f62dbefa77fc	[TX#1] Order Completed - Addition Inventory	\N	2025-03-14 15:21:03.497846+01	131
19ebc82e-cceb-40a5-a7a5-886d7e4abcb9	7e5f826d-21b2-4d71-b2f8-cd6aaeda9a17	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	10	ORDER_COMPLETION	863cc6d1-1e20-4d1f-8b46-0955daf0b10d	[TX#1] Order Completed - Addition Inventory	\N	2025-03-18 23:03:31.710519+01	132
ce292dbc-2aa5-468d-9a3b-057072a74c7a	24ccbb68-b391-46cf-b76b-c524e93f5de9	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	1	ORDER_COMPLETION	c63bbf78-3897-4b0d-8f94-17953b049aca	[TX#1] Order Completed - Addition Inventory	\N	2025-04-03 15:08:23.151281+02	133
bd88472f-08ac-44b0-aa5b-6b23a733be63	7e5f826d-21b2-4d71-b2f8-cd6aaeda9a17	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	435	ORDER_COMPLETION	84a978a1-669d-4af9-abd0-87f1be64c807	[TX#1] Order Completed - Addition Inventory	\N	2025-04-04 16:11:59.611879+02	134
46f4b020-0ed3-46e6-be85-a397956060d7	7e5f826d-21b2-4d71-b2f8-cd6aaeda9a17	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	435	ORDER_REVERSAL	84a978a1-669d-4af9-abd0-87f1be64c807	[TX#2][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-04-04 16:12:15.074738+02	135
a9e684d5-8aba-4e4b-9750-79fb0ed550d5	23f898dc-26f3-478b-b294-c20f638a9706	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	787	ORDER_COMPLETION	3ad5fbfa-d340-4ff8-90ad-0f9bb27b335d	[TX#1] Order Completed - Addition Inventory	\N	2025-04-04 16:14:32.20858+02	136
98c6bbff-9339-4133-a432-1a07a262361a	7759dc13-bafa-42f3-97ed-c6ab38785952	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	234234	ORDER_COMPLETION	bce378bf-f6bc-444c-9937-ba1c0580b97e	[TX#1] Order Completed - Deduction Inventory	\N	2025-04-05 19:20:02.139243+02	137
eb592383-fa7d-42aa-9fa0-42abfb40171e	7e5f826d-21b2-4d71-b2f8-cd6aaeda9a17	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	1	ORDER_COMPLETION	98ad87a6-e230-4e2f-be06-032a567b2959	[TX#1] Order Completed - Addition Inventory	\N	2025-04-05 20:23:49.184107+02	138
226d49a5-157e-4b8e-964d-42f551b5df51	24ccbb68-b391-46cf-b76b-c524e93f5de9	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	888	ORDER_COMPLETION	9efe6bae-d8eb-4616-9126-3770be5bcf46	[TX#1] Order Completed - Addition Inventory	\N	2025-04-05 20:56:00.005334+02	139
78632bb6-1d7d-4b9a-b532-1161b5db80b6	24ccbb68-b391-46cf-b76b-c524e93f5de9	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	888	ORDER_REVERSAL	9efe6bae-d8eb-4616-9126-3770be5bcf46	[TX#2][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-04-07 19:07:37.396899+02	140
ccba2779-e6bf-4c8b-9928-f3081d29a7ef	23f898dc-26f3-478b-b294-c20f638a9706	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	2	ORDER_COMPLETION	43ba7965-13e1-4ef7-a528-027781a6fecd	[TX#1] Order Completed - Addition Inventory	\N	2025-04-10 22:36:43.348162+02	141
b3bec57f-7a55-45da-a853-6c7647ad302b	7759dc13-bafa-42f3-97ed-c6ab38785952	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	234234	ORDER_REVERSAL	bce378bf-f6bc-444c-9937-ba1c0580b97e	[TX#2][REVERSAL] Order Uncompleted - Reversing Previous OUT	\N	2025-04-10 22:59:58.715137+02	142
8e462306-ed6b-4fa2-8c4f-e0550fbffacf	7759dc13-bafa-42f3-97ed-c6ab38785952	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	234234	ORDER_COMPLETION	bce378bf-f6bc-444c-9937-ba1c0580b97e	[TX#3] Order Completed - Deduction Inventory	\N	2025-04-10 23:00:04.655823+02	143
406694e9-769e-48f1-a129-999132066d0a	406843e4-8e07-46ff-a9db-2addcbe781ea	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	9	ORDER_COMPLETION	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	[TX#1] Order Completed - Addition Inventory	\N	2025-04-10 23:37:30.279445+02	144
b8981026-8daf-4844-8ab6-ca27bcf05211	ce661bda-db85-48a9-be57-69a435014213	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	7	ORDER_COMPLETION	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	[TX#1] Order Completed - Addition Inventory	\N	2025-04-10 23:37:30.279445+02	145
89214457-767e-43aa-8341-52d4c0c94364	ce661bda-db85-48a9-be57-69a435014213	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	8	ORDER_COMPLETION	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	[TX#1] Order Completed - Addition Inventory	\N	2025-04-10 23:37:30.279445+02	146
0d8ebd94-b647-4a97-a239-e61c98577b1e	e36c5e32-4990-4b86-a7d1-143b9c1bf8ac	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	6	ORDER_COMPLETION	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	[TX#1] Order Completed - Addition Inventory	\N	2025-04-10 23:37:30.279445+02	147
158ae19a-15d8-479b-8240-376b9139948a	89bc83f4-0420-48cf-b3e5-2013d7216da3	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	1	ORDER_COMPLETION	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	[TX#1] Order Completed - Addition Inventory	\N	2025-04-10 23:37:30.279445+02	148
9f37747f-9364-478c-a73b-a23f0d5f62d1	41b8fd1a-0927-4fb9-8d89-ced69f87c2d3	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	4	ORDER_COMPLETION	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	[TX#1] Order Completed - Addition Inventory	\N	2025-04-10 23:37:30.279445+02	149
6d20cafc-c5df-4d83-8475-dba2e8295643	0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	10	ORDER_COMPLETION	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	[TX#1] Order Completed - Addition Inventory	\N	2025-04-10 23:37:30.279445+02	150
83dca4cf-db56-481c-9ecb-4df031a84dae	63678a82-5e9c-4290-82b7-4b7e901966b9	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	5	ORDER_COMPLETION	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	[TX#1] Order Completed - Addition Inventory	\N	2025-04-10 23:37:30.279445+02	151
a5404221-bd75-41be-9957-3ebe3523ce31	00fe3e65-2e6e-4e34-8213-bac42ad4d943	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	2	ORDER_COMPLETION	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	[TX#1] Order Completed - Addition Inventory	\N	2025-04-10 23:37:30.279445+02	152
763eae2c-c78a-445e-bc9c-2494a2cce233	e9c8f943-7dae-4e3e-87eb-96e883d2a14b	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	3	ORDER_COMPLETION	a652f8c9-6493-4a7c-9ff4-6d8479fc59c3	[TX#1] Order Completed - Addition Inventory	\N	2025-04-10 23:37:30.279445+02	153
11e3636b-8a9e-4705-8844-9dfda61b1590	7759dc13-bafa-42f3-97ed-c6ab38785952	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	345	ORDER_COMPLETION	3b87f997-3460-4e80-b31b-8c03727b8267	[TX#1] Order Completed - Addition Inventory	\N	2025-04-10 23:41:03.19803+02	154
b7756936-8c7e-43b6-b17b-3e4adca1736e	0c4ce288-4c9f-467f-8b8d-c80149c7864a	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	69	ORDER_COMPLETION	69124a2f-a463-43ff-9498-ca72fe5d64f3	[TX#1] Order Completed - Addition Inventory	\N	2025-04-11 00:10:11.034387+02	155
6ad3bf1c-eccf-4641-99f5-6e7213a02db2	7e5f826d-21b2-4d71-b2f8-cd6aaeda9a17	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	34	ORDER_COMPLETION	b628f270-4ce7-4df6-b614-b16c7a1b25ea	[TX#1] Order Completed - Addition Inventory	\N	2025-04-11 00:29:53.159654+02	156
770c3f21-2f68-4ab4-b559-d2d8cecd69ae	7e5f826d-21b2-4d71-b2f8-cd6aaeda9a17	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	34	ORDER_COMPLETION	c61dc9ac-0235-4a60-963a-005499e3cf47	[TX#1] Order Completed - Addition Inventory	\N	2025-04-11 00:31:03.59855+02	157
63a34b1b-bb94-43bd-845f-a44fce241de9	6fa123ce-7601-411f-bde3-19ee0dd15374	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	2	ORDER_COMPLETION	7b8b9905-316e-4cb9-9e4d-32a7751fa730	[TX#1] Order Completed - Addition Inventory	\N	2025-04-11 19:46:41.398797+02	158
9cc03e78-4fd1-464f-90e5-439208e5b688	89bc83f4-0420-48cf-b3e5-2013d7216da3	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	1	ORDER_COMPLETION	97ab39e6-2055-49e3-baa9-65ff423ff108	[TX#1] Order Completed - Addition Inventory	\N	2025-04-11 20:35:19.000231+02	159
4b952d0b-193e-495a-97e8-fb0825dd10b3	29014a07-c465-420d-b28b-aa9c99d911d5	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	100	ORDER_COMPLETION	87a5f1f0-86dc-4490-8786-4342a316deba	[TX#1] Order Completed - Addition Inventory	\N	2025-04-12 10:04:06.769003+02	160
ac3ef53b-0b56-4c7e-8c5e-8cccc03cc32a	29014a07-c465-420d-b28b-aa9c99d911d5	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	100	ORDER_REVERSAL	87a5f1f0-86dc-4490-8786-4342a316deba	[TX#2][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-04-12 10:05:05.343952+02	161
757ad3e2-ac9b-465e-9341-d0d7d39298df	6b5df264-449c-456b-a9ab-a10cdfea6690	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	1	ORDER_COMPLETION	0312fa40-107d-45f9-b51e-0bdccfc1a447	[TX#1] Order Completed - Addition Inventory	\N	2025-04-12 11:33:00.586458+02	162
425fddcc-7443-4426-8a7d-55823f7d3be4	6b5df264-449c-456b-a9ab-a10cdfea6690	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	1	ORDER_COMPLETION	9abf3335-0ed4-4d2f-9104-0c214d0cf3a2	[TX#1] Order Completed - Deduction Inventory	\N	2025-04-12 20:18:43.414723+02	163
f985f27b-96d0-4de3-9d30-13d7efdf7a97	99d8b319-2d59-4ada-b1af-03bfbed67348	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	1	ORDER_COMPLETION	01f96baf-7b65-4893-b009-5afae795a83e	[TX#1] Order Completed - Addition Inventory	\N	2025-04-12 20:35:00.604527+02	164
218fde5a-6940-458a-bac0-3ea9019c5456	00fe3e65-2e6e-4e34-8213-bac42ad4d943	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	2	ORDER_COMPLETION	cfeb8660-db8e-44ae-9fb0-599a5402a84f	[TX#1] Order Completed - Deduction Inventory	\N	2025-04-16 17:29:51.105196+02	166
6b5db722-87a0-4331-a5f2-6557b454c084	e36c5e32-4990-4b86-a7d1-143b9c1bf8ac	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	68999	ORDER_REVERSAL	817e27e2-a7ed-4300-9a5a-edb479571e52	[TX#2][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-04-16 20:37:59.988425+02	167
bb8030f6-546c-4a82-acb0-51550fde4e82	e36c5e32-4990-4b86-a7d1-143b9c1bf8ac	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	68999	ORDER_COMPLETION	817e27e2-a7ed-4300-9a5a-edb479571e52	[TX#3] Order Completed - Addition Inventory	\N	2025-04-16 20:38:05.416169+02	168
cd9b64db-8dd9-4f59-a667-b09ffa81f96c	e36c5e32-4990-4b86-a7d1-143b9c1bf8ac	4e176e92-e833-44f5-aea9-0537f980fb4b	OUT	68999	ORDER_REVERSAL	817e27e2-a7ed-4300-9a5a-edb479571e52	[TX#4][REVERSAL] Order Uncompleted - Reversing Previous IN	\N	2025-04-16 20:40:35.982185+02	169
084e8cc2-b8c1-42a2-94fe-e59c28a94a92	e36c5e32-4990-4b86-a7d1-143b9c1bf8ac	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	2	ORDER_COMPLETION	817e27e2-a7ed-4300-9a5a-edb479571e52	[TX#5] Order Completed - Addition Inventory	\N	2025-04-16 20:41:10.305276+02	170
296c35f6-9ac7-4bda-8ea7-b81e6f72de9d	89bc83f4-0420-48cf-b3e5-2013d7216da3	4e176e92-e833-44f5-aea9-0537f980fb4b	IN	69	ORDER_COMPLETION	188ce518-956e-4e45-9d70-c47379015e67	[TX#1] Order Completed - Addition Inventory	\N	2025-04-16 20:41:31.966742+02	171
\.


--
-- Data for Name: stock_reconciliation; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.stock_reconciliation (reconciliation_id, item_id, location_id, expected_quantity, actual_quantity, discrepancy, notes, reconciliation_date, performed_by, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (user_id, email, password_hash, first_name, last_name, user_type, is_admin, is_active, last_login, customer_id, login_count, created_at, updated_at) FROM stdin;
dd4652a1-3d82-4d9d-8de1-ff670cc1f4ef	hunter@spaghetti.com	$2a$06$9MP/Iq9g51HfbmMofGZZN.Z4sZcqB9qYs3ckNOX4w2WDbZov8sRcK	Hunter	Spaghetti	CUSTOMER	f	t	\N	\N	0	2025-02-14 20:26:03.052004+01	\N
e17e6f4d-e509-4753-8346-7778e9946d6e	car@vrooom.com	$2a$06$vBAB1xpJ2s5j1Xfc5okbIOoxd1hP6ioeIkocsmBPaEtcJFhTPuSU2	Bugatti	Boooogatti	CUSTOMER	f	t	\N	\N	0	2025-02-14 20:27:59.319951+01	\N
d0213a35-d458-48df-aaaf-85716857d101	vroooo@oooooom.com	$2a$06$mhldASIK43w5p.ch5rCu9OzySUQKV/7ktDCGoJ49EFhC5kMVNQLDW	Vroom	Vrooooom	CUSTOMER	f	t	2025-02-14 20:34:09.813996+01	\N	0	2025-02-14 20:33:50.156431+01	2025-02-14 20:34:09.813996+01
ac825a84-f2bf-44d7-8a25-284439a2a806	flip@mail.com	$2a$06$sP2nwC4pOcACabyqcaBatORqfmFVfbfoM9moYHtZB.CNuEDw2Dr7O	Flip	Upside	DEMO	f	t	2025-02-07 23:41:37.70968+01	\N	0	2025-02-07 23:40:19.523175+01	2025-02-07 23:41:37.70968+01
2bd8639a-14b9-4f5a-bdbd-65c557e1ed6b	hi@hi.com	$2a$06$sad0Dms6RhkjYj9spuYTYufOjXJszasPy361lvP/jzXwPiX8wuMDm	Simon	Dosantas	CUSTOMER	f	t	2025-02-08 21:13:27.662274+01	\N	0	2025-02-08 21:13:17.156536+01	2025-02-08 21:13:27.662274+01
588624d9-94be-46dc-a211-dd8d2616fe8b	a@a.com	$2a$06$TGMU.BipPIIE/.MbvbaR.OQydZqJ1.G1wzLWvAg.0wDQP7GyN7mhi	Arthur	Silverstone	EMPLOYEE	f	t	2025-02-11 15:14:17.022151+01	\N	0	2025-02-06 11:48:09.521668+01	2025-02-11 15:14:17.022151+01
2e5c4542-e8ed-49f6-8efe-c20b773e1f76	lionkingfakeemail@gmail.com	$2a$06$1nk5XUfIHi46ZvO7TV9F7.sp3bKnSiPjpB6.lfGPOyTe3P6dfybf2	Lion	King	EMPLOYEE	f	t	2025-03-12 23:47:59.439851+01	\N	1	2025-03-12 23:47:46.470962+01	\N
2baac369-9752-4112-a0d8-2e6b3b25c9ff	aurelolo123@gmail.com	$2a$06$afwW4G/Lp3K1E9nA0FESg.qznCvcv5M12Q1kVI7pfu/DTS1tZwAkK	Ghxy	Cuc7	EMPLOYEE	f	t	2025-03-13 00:25:05.172261+01	\N	1	2025-03-13 00:24:56.99893+01	\N
009cb738-ce02-4cc0-b6cf-03a014b79c44	1@1.com	$2a$06$5pLpYTm.kcQh93qun4hN6OX5U1u6IX8uoByNWCKAgRxQGNybZJLI6	Edward	Lumen	CUSTOMER	f	t	\N	\N	0	2025-02-16 19:48:11.447146+01	\N
2e964450-0a4d-4c6c-9097-46856f5a98c5	evilorangebitch@pieceofshit.com	$2a$06$wg.DqrmR8hDfxa4g/8VAnef7.Ng.2/JEGy6eQnP8zZrAu1WE3hKl2	Sillygoose 	Mcgee	EMPLOYEE	f	t	2025-03-13 01:43:57.671043+01	\N	1	2025-03-13 01:43:46.315213+01	\N
67491cc7-d947-4373-8581-2ab05e69e1c3	hope@fully.com	$2a$06$.W9agQ8apOa3g8JIoF2nyuRc.8ffsR/8n1FGfVwzXoEpwesqGAm7e	Hope	Fully	CUSTOMER	f	t	2025-03-13 18:02:56.998818+01	\N	1	2025-03-13 18:02:36.17349+01	\N
1ba6cda0-70c5-4398-a252-5f1211b8665f	tnqklhcwhddijdzvij@nbmbb.com	$2a$06$OWqwE/87u9fxgxjWRixh1.d8pG.kexkK8YIyXv7uDyWiiuiM4Y8pS	Fddd	Ff	CUSTOMER	f	t	2025-02-27 21:48:44.134272+01	\N	1	2025-02-27 21:48:33.249413+01	\N
e17af64f-7a96-48c7-891d-c18792d9803e	dadsad@awea.com	$2a$06$Kl.BLRwhjPBIXENVfET8i.6Qk/jPlWEB6pk4eehk2gEF9YPD2kyN2	Ddd	Ddasd	EMPLOYEE	f	t	\N	\N	0	2025-02-27 21:50:52.167409+01	\N
dba7ee11-ec92-4d95-9f5c-6d3b2af80f1a	majd@gmail.com	$2a$06$yjgPMyvS/lNFqMlX6djAWOjcRKyEFw31oNpg48dXbOaJITlmzFSHa	Dadasd	Asdasdasd	EMPLOYEE	f	t	2025-02-27 21:51:28.761297+01	\N	1	2025-02-27 21:51:15.177018+01	\N
06e2695a-1dae-4a1c-8693-731a4114a3a2	123@1.com	$2a$06$TPSuQlkAZD5dI/.ZwxXuDu2PBK5MGep/dcq1vOAtS7aF.CBoQsh7W	Bro	123	EMPLOYEE	f	t	2025-04-01 18:54:28.05615+02	\N	1	2025-04-01 18:50:36.940492+02	\N
4dcc518f-2a4e-4c02-9eaf-0cdcfd878b91	email@mail.com	$2a$06$CqblmBtqqw2WLuglADs5a.NaJHwlhkDxceOW4wvc.3AJ8/jSMxuDq	Hunter	Butter	EMPLOYEE	f	t	2025-03-05 12:13:22.518524+01	\N	3	2025-02-17 01:19:23.661032+01	\N
a3d39555-33b4-4fa8-bbe9-99226a3140df	test@test.com	$2a$06$MWwf68GgJgcI3/MgzRHLne9EFqHz6tUJrBgDgsypJEKA5V763c6/e	Kris	Bacardi	CUSTOMER	f	t	2025-04-20 22:30:56.992425+02	47fa94e9-cc56-4f82-99df-a025f2603fb1	7	2025-02-06 11:24:35.714059+01	2025-02-06 11:54:18.798086+01
d2bc0533-2d03-4083-8188-e19cd504d256	spaghettimonster32@malekdarwish.com	$2a$06$C4ZTN77vsVlfGPoJeFhe3eWCDOimisBpjfWeeBlAHj2I4dAY8Mqky	Ashley	Lastname	CUSTOMER	f	t	2025-04-09 18:17:27.188331+02	47fa94e9-cc56-4f82-99df-a025f2603fb1	16	2025-03-03 19:54:30.683533+01	\N
2b7aa0d9-2a47-458d-99ea-ccb1e2d5c463	bob@bob.com	$2a$06$0AHCwzjULRbSBHOkqDAPX.XvJehK08NJ9WhNzncEGuf.bBEG.mxge	Bob	Tomas	CUSTOMER	f	t	2025-04-09 18:19:58.643302+02	\N	1	2025-04-09 18:19:51.262006+02	\N
4bb68f57-fc14-4e49-96a4-f26c75418547	malooky23@gmail.com	$2a$06$Emtho19aKLF8EwAk6EJ9Suz2cawfSSef3SM3SWYZVnvTyEr51TYW2	Malek	Darwish	EMPLOYEE	f	t	2025-05-01 10:19:26.132424+02	\N	100	2025-02-06 11:28:06.443665+01	2025-02-14 22:07:22.866686+01
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: postgres
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, false);


--
-- Name: customers_customer_number_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.customers_customer_number_seq', 28, true);


--
-- Name: items_item_number_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.items_item_number_seq', 38, true);


--
-- Name: login_attempts_login_attempt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.login_attempts_login_attempt_id_seq', 157, true);


--
-- Name: orders_order_number_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.orders_order_number_seq', 72, true);


--
-- Name: stock_movements_movemment_number_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.stock_movements_movemment_number_seq', 171, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: users_sync users_sync_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neondb_owner
--

ALTER TABLE ONLY neon_auth.users_sync
    ADD CONSTRAINT users_sync_pkey PRIMARY KEY (id);


--
-- Name: address_details address_details_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.address_details
    ADD CONSTRAINT address_details_pkey PRIMARY KEY (address_id);


--
-- Name: business_customers business_customers_business_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.business_customers
    ADD CONSTRAINT business_customers_business_name_unique UNIQUE (business_name);


--
-- Name: business_customers business_customers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.business_customers
    ADD CONSTRAINT business_customers_pkey PRIMARY KEY (business_customer_id);


--
-- Name: business_customers business_customers_tax_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.business_customers
    ADD CONSTRAINT business_customers_tax_number_unique UNIQUE (tax_number);


--
-- Name: contact_details contact_details_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contact_details
    ADD CONSTRAINT contact_details_pkey PRIMARY KEY (contact_details_id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (customer_id);


--
-- Name: deleted_items deleted_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.deleted_items
    ADD CONSTRAINT deleted_items_pkey PRIMARY KEY (item_id);


--
-- Name: entity_addresses entity_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.entity_addresses
    ADD CONSTRAINT entity_addresses_pkey PRIMARY KEY (id);


--
-- Name: entity_contact_details entity_contact_details_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.entity_contact_details
    ADD CONSTRAINT entity_contact_details_pkey PRIMARY KEY (id);


--
-- Name: expense_items expense_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_items
    ADD CONSTRAINT expense_items_pkey PRIMARY KEY (expense_item_id);


--
-- Name: individual_customers individual_customers_personal_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.individual_customers
    ADD CONSTRAINT individual_customers_personal_id_unique UNIQUE (personal_id);


--
-- Name: individual_customers individual_customers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.individual_customers
    ADD CONSTRAINT individual_customers_pkey PRIMARY KEY (individual_customer_id);


--
-- Name: item_stock item_stock_item_id_location_id_pk; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.item_stock
    ADD CONSTRAINT item_stock_item_id_location_id_pk PRIMARY KEY (item_id, location_id);


--
-- Name: items items_item_barcode_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_item_barcode_unique UNIQUE (item_barcode);


--
-- Name: items items_item_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_item_name_unique UNIQUE (item_name);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (item_id);


--
-- Name: locations locations_location_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_location_code_unique UNIQUE (location_code);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (location_id);


--
-- Name: login_attempts login_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.login_attempts
    ADD CONSTRAINT login_attempts_pkey PRIMARY KEY (login_attempt_id);


--
-- Name: order_expenses order_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_expenses
    ADD CONSTRAINT order_expenses_pkey PRIMARY KEY (order_expense_id);


--
-- Name: order_history order_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_history
    ADD CONSTRAINT order_history_pkey PRIMARY KEY (history_id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (order_items_id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (movement_id);


--
-- Name: stock_reconciliation stock_reconciliation_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_reconciliation
    ADD CONSTRAINT stock_reconciliation_pkey PRIMARY KEY (reconciliation_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users_sync_deleted_at_idx; Type: INDEX; Schema: neon_auth; Owner: neondb_owner
--

CREATE INDEX users_sync_deleted_at_idx ON neon_auth.users_sync USING btree (deleted_at);


--
-- Name: idx_stock_movements_customer_date; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_stock_movements_customer_date ON public.stock_movements_view USING btree (customer_id, created_at);


--
-- Name: idx_stock_movements_search; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_stock_movements_search ON public.stock_movements_view USING btree (item_name, customer_display_name);


--
-- Name: idx_stock_movements_view_created_at; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_stock_movements_view_created_at ON public.stock_movements_view USING btree (created_at);


--
-- Name: idx_stock_movements_view_customer; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_stock_movements_view_customer ON public.stock_movements_view USING btree (customer_id);


--
-- Name: idx_stock_movements_view_item_location; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_stock_movements_view_item_location ON public.stock_movements_view USING btree (item_id, location_id);


--
-- Name: idx_stock_movements_view_movement; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_stock_movements_view_movement ON public.stock_movements_view USING btree (movement_id);


--
-- Name: idx_stock_movements_view_reference; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_stock_movements_view_reference ON public.stock_movements_view USING btree (reference_type, reference_id);


--
-- Name: idx_stockmovements_createdat; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_stockmovements_createdat ON public.stock_movements_view USING btree (created_at);


--
-- Name: idx_stockmovements_customerdisplayname; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_stockmovements_customerdisplayname ON public.stock_movements_view USING btree (customer_display_name);


--
-- Name: idx_stockmovements_customerid; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_stockmovements_customerid ON public.stock_movements_view USING btree (customer_id);


--
-- Name: idx_stockmovements_itemname; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_stockmovements_itemname ON public.stock_movements_view USING btree (item_name);


--
-- Name: idx_stockmovements_movementtype; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_stockmovements_movementtype ON public.stock_movements_view USING btree (movement_type);


--
-- Name: stock_movements_view_movement_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX stock_movements_view_movement_id_index ON public.stock_movements_view USING btree (movement_id);


--
-- Name: items after_item_insert; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER after_item_insert AFTER INSERT ON public.items FOR EACH ROW EXECUTE FUNCTION public.insert_into_item_stock();


--
-- Name: items before_item_delete; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER before_item_delete BEFORE DELETE ON public.items FOR EACH ROW EXECUTE FUNCTION public.handle_item_soft_delete();


--
-- Name: orders order_completion_inventory_trigger; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER order_completion_inventory_trigger BEFORE UPDATE OF status ON public.orders FOR EACH ROW EXECUTE FUNCTION public.record_order_stock_movement();


--
-- Name: stock_movements refresh_stock_movements_view; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER refresh_stock_movements_view AFTER INSERT OR DELETE OR UPDATE ON public.stock_movements FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_view();


--
-- Name: stock_movements stock_movement_item_stock_trigger; Type: TRIGGER; Schema: public; Owner: neondb_owner
--

CREATE TRIGGER stock_movement_item_stock_trigger AFTER INSERT ON public.stock_movements FOR EACH ROW EXECUTE FUNCTION public.update_item_stock_on_movement();


--
-- Name: business_customers business_customers_business_customer_id_customers_customer_id_f; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.business_customers
    ADD CONSTRAINT business_customers_business_customer_id_customers_customer_id_f FOREIGN KEY (business_customer_id) REFERENCES public.customers(customer_id) ON DELETE CASCADE;


--
-- Name: entity_addresses entity_addresses_address_id_address_details_address_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.entity_addresses
    ADD CONSTRAINT entity_addresses_address_id_address_details_address_id_fk FOREIGN KEY (address_id) REFERENCES public.address_details(address_id) ON DELETE CASCADE;


--
-- Name: entity_contact_details entity_contact_details_contact_details_id_contact_details_conta; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.entity_contact_details
    ADD CONSTRAINT entity_contact_details_contact_details_id_contact_details_conta FOREIGN KEY (contact_details_id) REFERENCES public.contact_details(contact_details_id) ON DELETE CASCADE;


--
-- Name: individual_customers individual_customers_individual_customer_id_customers_customer_; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.individual_customers
    ADD CONSTRAINT individual_customers_individual_customer_id_customers_customer_ FOREIGN KEY (individual_customer_id) REFERENCES public.customers(customer_id) ON DELETE CASCADE;


--
-- Name: item_stock item_stock_item_id_items_item_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.item_stock
    ADD CONSTRAINT item_stock_item_id_items_item_id_fk FOREIGN KEY (item_id) REFERENCES public.items(item_id);


--
-- Name: item_stock item_stock_last_movement_id_stock_movements_movement_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.item_stock
    ADD CONSTRAINT item_stock_last_movement_id_stock_movements_movement_id_fk FOREIGN KEY (last_movement_id) REFERENCES public.stock_movements(movement_id);


--
-- Name: item_stock item_stock_last_reconciliation_by_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.item_stock
    ADD CONSTRAINT item_stock_last_reconciliation_by_users_user_id_fk FOREIGN KEY (last_reconciliation_by) REFERENCES public.users(user_id);


--
-- Name: item_stock item_stock_location_id_locations_location_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.item_stock
    ADD CONSTRAINT item_stock_location_id_locations_location_id_fk FOREIGN KEY (location_id) REFERENCES public.locations(location_id);


--
-- Name: items items_created_by_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_created_by_users_user_id_fk FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE RESTRICT;


--
-- Name: items items_customer_id_customers_customer_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_customer_id_customers_customer_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE RESTRICT;


--
-- Name: login_attempts login_attempts_user_id_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.login_attempts
    ADD CONSTRAINT login_attempts_user_id_users_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: order_items orderItems_locations_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "orderItems_locations_location_id_fkey" FOREIGN KEY (item_location_id) REFERENCES public.locations(location_id) ON DELETE RESTRICT;


--
-- Name: order_expenses order_expenses_expense_item_id_expense_items_expense_item_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_expenses
    ADD CONSTRAINT order_expenses_expense_item_id_expense_items_expense_item_id_fk FOREIGN KEY (expense_item_id) REFERENCES public.expense_items(expense_item_id);


--
-- Name: order_expenses order_expenses_order_id_orders_order_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_expenses
    ADD CONSTRAINT order_expenses_order_id_orders_order_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(order_id);


--
-- Name: order_history order_history_changed_by_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_history
    ADD CONSTRAINT order_history_changed_by_users_user_id_fk FOREIGN KEY (changed_by) REFERENCES public.users(user_id);


--
-- Name: order_history order_history_order_id_orders_order_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_history
    ADD CONSTRAINT order_history_order_id_orders_order_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- Name: order_items order_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(item_id) ON DELETE RESTRICT;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- Name: orders orders_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.address_details(address_id) ON DELETE SET NULL;


--
-- Name: orders orders_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_creator_id_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE RESTRICT;


--
-- Name: orders orders_cus_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_cus_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE RESTRICT;


--
-- Name: stock_movements stock_movements_created_by_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_created_by_users_user_id_fk FOREIGN KEY (created_by) REFERENCES public.users(user_id);


--
-- Name: stock_movements stock_movements_item_id_items_item_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_item_id_items_item_id_fk FOREIGN KEY (item_id) REFERENCES public.items(item_id);


--
-- Name: stock_movements stock_movements_location_id_locations_location_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_location_id_locations_location_id_fk FOREIGN KEY (location_id) REFERENCES public.locations(location_id);


--
-- Name: stock_reconciliation stock_reconciliation_item_id_items_item_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_reconciliation
    ADD CONSTRAINT stock_reconciliation_item_id_items_item_id_fk FOREIGN KEY (item_id) REFERENCES public.items(item_id);


--
-- Name: stock_reconciliation stock_reconciliation_location_id_locations_location_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_reconciliation
    ADD CONSTRAINT stock_reconciliation_location_id_locations_location_id_fk FOREIGN KEY (location_id) REFERENCES public.locations(location_id);


--
-- Name: stock_reconciliation stock_reconciliation_performed_by_users_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_reconciliation
    ADD CONSTRAINT stock_reconciliation_performed_by_users_user_id_fk FOREIGN KEY (performed_by) REFERENCES public.users(user_id);


--
-- Name: users users_customer_id_customers_customer_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_customer_id_customers_customer_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- Name: order_expense_details_mv; Type: MATERIALIZED VIEW DATA; Schema: public; Owner: postgres
--

REFRESH MATERIALIZED VIEW public.order_expense_details_mv;


--
-- Name: stock_movements_view; Type: MATERIALIZED VIEW DATA; Schema: public; Owner: neondb_owner
--

REFRESH MATERIALIZED VIEW public.stock_movements_view;


--
-- PostgreSQL database dump complete
--

