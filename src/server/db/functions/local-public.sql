create type customer_type as enum ('INDIVIDUAL', 'BUSINESS');

create type entity_type as enum ('CUSTOMER', 'USER');

create type movement_type as enum ('IN', 'OUT');

create type packing_type as enum ('SACK', 'PALLET', 'CARTON', 'OTHER', 'NONE');

create type user_type as enum ('EMPLOYEE', 'CUSTOMER', 'DEMO');

create type contact_type as enum ('email', 'phone', 'mobile', 'landline', 'other');

create type delivery_method as enum ('NONE', 'PICKUP', 'DELIVERY');

create type order_status as enum ('DRAFT', 'PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED');

create type order_type as enum ('CUSTOMER_ORDER');

create table address_details
(
    address_id   uuid                     default gen_random_uuid() not null
        primary key,
    address_1    text,
    address_2    text,
    city         text,
    country      text,
    postal_code  varchar(20),
    address_type text,
    created_at   timestamp with time zone default now()             not null,
    updated_at   timestamp with time zone
);

create table contact_details
(
    contact_details_id uuid                     default gen_random_uuid() not null
        primary key,
    contact_data       text                                               not null,
    is_primary         boolean                  default false,
    created_at         timestamp with time zone default now()             not null,
    updated_at         timestamp with time zone,
    contact_type       contact_type                                       not null
);

create table customers
(
    customer_id     uuid                     default gen_random_uuid() not null
        primary key,
    customer_number serial,
    customer_type   customer_type                                      not null,
    notes           text,
    country         text                                               not null,
    created_at      timestamp with time zone default now()             not null,
    updated_at      timestamp with time zone,
    display_name    varchar(100)                                       not null
);

create table business_customers
(
    business_customer_id uuid                                   not null
        primary key
        constraint business_customers_business_customer_id_customers_customer_id_f
            references customers
            on delete cascade,
    business_name        text                                   not null
        constraint business_customers_business_name_unique
            unique,
    is_tax_registered    boolean                  default false not null,
    tax_number           text
        constraint business_customers_tax_number_unique
            unique,
    created_at           timestamp with time zone default now() not null,
    updated_at           timestamp with time zone
);

create table deleted_items
(
    item_id    uuid not null
        primary key,
    deleted_at timestamp default now()
);

create table entity_addresses
(
    id          uuid                     default gen_random_uuid() not null
        primary key,
    entity_id   uuid                                               not null,
    entity_type text                                               not null,
    address_id  uuid                                               not null
        constraint entity_addresses_address_id_address_details_address_id_fk
            references address_details
            on delete cascade,
    created_at  timestamp with time zone default now()             not null
);

create table entity_contact_details
(
    id                 uuid                     default gen_random_uuid() not null
        primary key,
    entity_id          uuid                                               not null,
    entity_type        text                                               not null,
    contact_details_id uuid                                               not null
        constraint entity_contact_details_contact_details_id_contact_details_conta
            references contact_details
            on delete cascade,
    contact_type       text,
    created_at         timestamp with time zone default now()             not null
);

create table individual_customers
(
    individual_customer_id uuid                                   not null
        primary key
        constraint individual_customers_individual_customer_id_customers_customer_
            references customers
            on delete cascade,
    first_name             text                                   not null,
    middle_name            text,
    last_name              text                                   not null,
    personal_id            text
        constraint individual_customers_personal_id_unique
            unique,
    created_at             timestamp with time zone default now() not null,
    updated_at             timestamp with time zone
);

create table locations
(
    location_id   uuid                     default gen_random_uuid() not null
        primary key,
    location_name text                                               not null,
    location_code text                                               not null
        constraint locations_location_code_unique
            unique,
    notes         text,
    created_at    timestamp with time zone default now()             not null,
    updated_at    timestamp with time zone
);

create table users
(
    user_id       uuid                     default gen_random_uuid()     not null
        primary key,
    email         text                                                   not null
        constraint users_email_unique
            unique,
    password_hash text                                                   not null,
    first_name    varchar(50)                                            not null,
    last_name     varchar(50)                                            not null,
    user_type     user_type                default 'CUSTOMER'::user_type not null,
    is_admin      boolean                  default false                 not null,
    is_active     boolean                  default true                  not null,
    last_login    timestamp with time zone,
    customer_id   uuid
        constraint users_customer_id_customers_customer_id_fk
            references customers,
    login_count   integer                  default 0,
    created_at    timestamp with time zone default now()                 not null,
    updated_at    timestamp with time zone
);

create table items
(
    item_id                uuid                     default gen_random_uuid() not null
        primary key,
    item_number            serial,
    item_name              text                                               not null
        constraint items_item_name_unique
            unique,
    item_type              text,
    item_brand             text,
    item_model             text,
    item_barcode           text
        constraint items_item_barcode_unique
            unique,
    item_country_of_origin text,
    dimensions             json,
    weight_grams           integer,
    customer_id            uuid                                               not null
        constraint items_customer_id_customers_customer_id_fk
            references customers
            on delete restrict,
    notes                  text,
    created_by             uuid                                               not null
        constraint items_created_by_users_user_id_fk
            references users
            on delete restrict,
    created_at             timestamp with time zone default now()             not null,
    updated_at             timestamp with time zone,
    is_deleted             boolean                  default false
);

create table login_attempts
(
    login_attempt_id serial
        primary key,
    user_id          uuid
        constraint login_attempts_user_id_users_user_id_fk
            references users,
    success          boolean                  default false not null,
    created_at       timestamp with time zone default now() not null,
    ip_address       inet,
    user_agent       text,
    error_message    text
);

create table stock_movements
(
    movement_id    uuid                     default gen_random_uuid() not null
        primary key,
    item_id        uuid                                               not null
        constraint stock_movements_item_id_items_item_id_fk
            references items,
    location_id    uuid                                               not null
        constraint stock_movements_location_id_locations_location_id_fk
            references locations,
    movement_type  movement_type                                      not null,
    quantity       integer                                            not null,
    reference_type text,
    reference_id   uuid,
    notes          text,
    created_by     uuid
        constraint stock_movements_created_by_users_user_id_fk
            references users,
    created_at     timestamp with time zone default now()             not null
);

create table item_stock
(
    item_id                uuid                                   not null
        constraint item_stock_item_id_items_item_id_fk
            references items,
    location_id            uuid                                   not null
        constraint item_stock_location_id_locations_location_id_fk
            references locations,
    current_quantity       integer                  default 0     not null
        constraint quantity_check
            check (current_quantity >= 0),
    last_updated           timestamp with time zone default now() not null,
    last_movement_id       uuid
        constraint item_stock_last_movement_id_stock_movements_movement_id_fk
            references stock_movements,
    last_reconciliation_at timestamp with time zone,
    last_reconciliation_by uuid
        constraint item_stock_last_reconciliation_by_users_user_id_fk
            references users,
    constraint item_stock_item_id_location_id_pk
        primary key (item_id, location_id)
);

create table orders
(
    order_id        uuid                     default gen_random_uuid()            not null
        primary key,
    order_number    serial
        unique,
    customer_id     uuid                                                          not null
        constraint orders_cus_id_fkey
            references customers
            on delete restrict,
    order_type      order_type               default 'CUSTOMER_ORDER'::order_type not null,
    movement        movement_type                                                 not null,
    packing_type    packing_type             default 'NONE'::packing_type         not null,
    delivery_method delivery_method          default 'NONE'::delivery_method      not null,
    status          order_status             default 'PENDING'::order_status      not null,
    address_id      uuid
                                                                                  references address_details
                                                                                      on delete set null,
    fulfilled_at    timestamp with time zone,
    notes           text,
    created_by      uuid                                                          not null
        constraint orders_creator_id_fkey
            references users
            on delete restrict,
    created_at      timestamp with time zone default now()                        not null,
    updated_at      timestamp with time zone,
    "isDeleted"     boolean                  default false
);

create table order_items
(
    order_items_id   uuid                     default gen_random_uuid() not null
        primary key,
    order_id         uuid                                               not null
        references orders
            on delete cascade,
    item_id          uuid                                               not null
        references items
            on delete restrict,
    quantity         integer                                            not null
        constraint order_items_quantity_check
            check (quantity > 0),
    created_at       timestamp with time zone default now()             not null,
    updated_at       timestamp with time zone,
    item_location_id uuid
        constraint "orderItems_locations_location_id_fkey"
            references locations
            on delete restrict
);

create table stock_reconciliation
(
    reconciliation_id   uuid                     default gen_random_uuid() not null
        primary key,
    item_id             uuid                                               not null
        constraint stock_reconciliation_item_id_items_item_id_fk
            references items,
    location_id         uuid                                               not null
        constraint stock_reconciliation_location_id_locations_location_id_fk
            references locations,
    expected_quantity   integer                                            not null,
    actual_quantity     integer                                            not null,
    discrepancy         integer                                            not null,
    notes               text,
    reconciliation_date timestamp with time zone default now()             not null,
    performed_by        uuid                                               not null
        constraint stock_reconciliation_performed_by_users_user_id_fk
            references users,
    created_at          timestamp with time zone default now()             not null
);

create function new_user(p_email text, p_password text, p_first_name character varying, p_last_name character varying, p_user_type user_type, p_is_admin boolean DEFAULT false) returns jsonb
    security definer
    language plpgsql
as
$$
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

create function authenticate_user(p_email text, p_password text, p_ip_address inet, p_user_agent text) returns json
    security definer
    language plpgsql
as
$$
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


create function insert_into_item_stock() returns trigger
    language plpgsql
as
$$
BEGIN
    -- Insert a new row into item_stock with the item_id of the newly inserted item
    -- and a fixed location_id (4e176e92-e833-44f5-aea9-0537f980fb4b)
    INSERT INTO item_stock (item_id, location_id)
    VALUES (NEW.item_id, '4e176e92-e833-44f5-aea9-0537f980fb4b');

    -- Return the NEW row to allow the trigger to continue
    RETURN NEW;
END;
$$;

create trigger after_item_insert
    after insert
    on items
    for each row
execute procedure insert_into_item_stock();

create function update_updated_at_column() returns trigger
    language plpgsql
as
$$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP; -- This includes the timezone
    RETURN NEW; -- Return the modified row
END;
$$;

create trigger set_updated_at_address_details
    before update
    on address_details
    for each row
execute procedure update_updated_at_column();

create trigger set_updated_at_business_customers
    before update
    on business_customers
    for each row
execute procedure update_updated_at_column();

create trigger set_updated_at_contact_details
    before update
    on contact_details
    for each row
execute procedure update_updated_at_column();

create trigger set_updated_at_customers
    before update
    on customers
    for each row
execute procedure update_updated_at_column();

create trigger set_updated_at_individual_customers
    before update
    on individual_customers
    for each row
execute procedure update_updated_at_column();

create trigger set_updated_at_items
    before update
    on items
    for each row
execute procedure update_updated_at_column();

create trigger set_updated_at_locations
    before update
    on locations
    for each row
execute procedure update_updated_at_column();

create trigger set_updated_at_users
    before update
    on users
    for each row
execute procedure update_updated_at_column();

create trigger set_updated_at_orders
    before update
    on orders
    for each row
execute procedure update_updated_at_column();

create function _create_customer_entity(p_customer_type customer_type, p_country text, p_notes text DEFAULT NULL::text) returns uuid
    language plpgsql
as
$$
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

create function _create_address_details(p_entity_id uuid, p_entity_type text, p_address jsonb) returns void
    language plpgsql
as
$$
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

create function _create_contact_details(p_entity_id uuid, p_entity_type text, p_contacts jsonb) returns void
    language plpgsql
as
$$
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

create function create_customer(p_customer_type customer_type, p_country text, p_notes text DEFAULT NULL::text, p_business_name text DEFAULT NULL::text, p_is_tax_registered boolean DEFAULT NULL::boolean, p_tax_number text DEFAULT NULL::text, p_firstname text DEFAULT NULL::text, p_middlename text DEFAULT NULL::text, p_lastname text DEFAULT NULL::text, p_personalid text DEFAULT NULL::text, p_address jsonb DEFAULT NULL::jsonb, p_contacts jsonb DEFAULT NULL::jsonb) returns jsonb
    language plpgsql
as
$$
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

create function new_business_customer(p_country text, p_business_name text, p_is_tax_registered boolean, p_tax_number text, p_address jsonb, p_contacts jsonb, p_notes text DEFAULT NULL::text) returns jsonb
    language plpgsql
as
$$
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
    $$;

create function new_individual_customer(p_firstname text, p_middlename text, p_lastname text, p_personalid text, p_country text, p_address jsonb, p_contacts jsonb, p_notes text DEFAULT NULL::text) returns jsonb
    language plpgsql
as
$$
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

create function update_item_stock_on_movement() returns trigger
    language plpgsql
as
$$
DECLARE
    current_stock_quantity INTEGER;
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
            RAISE EXCEPTION 'Insufficient stock for item % at location % for movement %', NEW.item_id, NEW.location_id, NEW.movement_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

create trigger stock_movement_item_stock_trigger
    after insert
    on stock_movements
    for each row
execute procedure update_item_stock_on_movement();

create function record_order_stock_movement() returns trigger
    language plpgsql
as
$$
DECLARE
    item_record RECORD;
    movement_type movement_type;
    is_reversal BOOLEAN;
    tx_number INTEGER;
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
        movement_type := CASE WHEN NEW.movement = 'IN' THEN 'OUT' ELSE 'IN' END;
        is_reversal := TRUE;
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
                    CASE movement_type
                        WHEN 'OUT' THEN format('[TX#%s][REVERSAL] Order Uncompleted - Reversing Previous IN', tx_number)
                        ELSE format('[TX#%s][REVERSAL] Order Uncompleted - Reversing Previous OUT', tx_number)
                    END
                ELSE
                    CASE movement_type
                        WHEN 'OUT' THEN format('[TX#%s] Order Completed - Inventory Deduction', tx_number)
                        ELSE format('[TX#%s] Order Completed - Inventory Addition', tx_number)
                    END
            END
        );
    END LOOP;

    RETURN NEW;
END;
$$;

create trigger order_completion_inventory_trigger
    after update
        of status
    on orders
    for each row
execute procedure record_order_stock_movement();

create function handle_item_soft_delete() returns trigger
    language plpgsql
as
$$
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

create trigger before_item_delete
    before delete
    on items
    for each row
execute procedure handle_item_soft_delete();

