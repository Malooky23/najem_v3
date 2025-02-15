CREATE OR REPLACE FUNCTION new_user(
    p_email TEXT,
    p_password TEXT,
    p_first_name VARCHAR(50),
    p_last_name VARCHAR(50),
    p_user_type user_type,
    p_is_admin BOOLEAN DEFAULT FALSE
) RETURNS JSONB AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;