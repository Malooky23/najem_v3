CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION authenticate_user(
  p_email TEXT,
  p_password TEXT,
  p_ip_address INET,
  p_user_agent TEXT
) RETURNS JSON AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;


