-- 1. Schema Updates
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

-- 2. Add/Update Representatives
DO $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Shelby
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'shelby@cleverly.co') THEN
        INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, is_sso_user)
        VALUES (
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'shelby@cleverly.co',
            crypt('shelby@321', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"email_verified":true}',
            now(),
            now(),
            '',
            false
        ) RETURNING id INTO new_user_id;
    ELSE
        SELECT id FROM auth.users WHERE email = 'shelby@cleverly.co' INTO new_user_id;
        UPDATE auth.users SET encrypted_password = crypt('shelby@321', gen_salt('bf')), updated_at = now() WHERE id = new_user_id;
    END IF;
    UPDATE public.profiles SET phone = '+1 213 927 8693' WHERE id = new_user_id;
    INSERT INTO public."User" (id, name, email, password, role, phone)
    VALUES (new_user_id::text, 'Shelby', 'shelby@cleverly.co', 'shelby@321', 'agent', '+1 213 927 8693')
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, password = EXCLUDED.password, phone = EXCLUDED.phone;

    -- Joseph
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'joseph@cleverly.co') THEN
        INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, is_sso_user)
        VALUES (
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'joseph@cleverly.co',
            crypt('joseph@321', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"email_verified":true}',
            now(),
            now(),
            '',
            false
        ) RETURNING id INTO new_user_id;
    ELSE
        SELECT id FROM auth.users WHERE email = 'joseph@cleverly.co' INTO new_user_id;
        UPDATE auth.users SET encrypted_password = crypt('joseph@321', gen_salt('bf')), updated_at = now() WHERE id = new_user_id;
    END IF;
    UPDATE public.profiles SET phone = '+1 323 673 3721' WHERE id = new_user_id;
    INSERT INTO public."User" (id, name, email, password, role, phone)
    VALUES (new_user_id::text, 'Joseph', 'joseph@cleverly.co', 'joseph@321', 'agent', '+1 323 673 3721')
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, password = EXCLUDED.password, phone = EXCLUDED.phone;

    -- Anna
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'anna@cleverly.co') THEN
        INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, is_sso_user)
        VALUES (
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'anna@cleverly.co',
            crypt('anna@321', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"email_verified":true}',
            now(),
            now(),
            '',
            false
        ) RETURNING id INTO new_user_id;
    ELSE
        SELECT id FROM auth.users WHERE email = 'anna@cleverly.co' INTO new_user_id;
        UPDATE auth.users SET encrypted_password = crypt('anna@321', gen_salt('bf')), updated_at = now() WHERE id = new_user_id;
    END IF;
    UPDATE public.profiles SET phone = '+1 323 524 2176' WHERE id = new_user_id;
    INSERT INTO public."User" (id, name, email, password, role, phone)
    VALUES (new_user_id::text, 'Anna', 'anna@cleverly.co', 'anna@321', 'agent', '+1 323 524 2176')
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, password = EXCLUDED.password, phone = EXCLUDED.phone;

    -- Jake
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'jake@cleverly.co') THEN
        INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, is_sso_user)
        VALUES (
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'jake@cleverly.co',
            crypt('oz@321', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"email_verified":true}',
            now(),
            now(),
            '',
            false
        ) RETURNING id INTO new_user_id;
    ELSE
        SELECT id FROM auth.users WHERE email = 'jake@cleverly.co' INTO new_user_id;
        UPDATE auth.users SET encrypted_password = crypt('oz@321', gen_salt('bf')), updated_at = now() WHERE id = new_user_id;
    END IF;
    UPDATE public.profiles SET phone = '+1 213 263 5329' WHERE id = new_user_id;
    INSERT INTO public."User" (id, name, email, password, role, phone)
    VALUES (new_user_id::text, 'Jake', 'jake@cleverly.co', 'oz@321', 'agent', '+1 213 263 5329')
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, password = EXCLUDED.password, phone = EXCLUDED.phone;

END $$;
