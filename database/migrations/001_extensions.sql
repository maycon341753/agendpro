SET search_path TO public;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE OR REPLACE FUNCTION public.gen_random_uuid()
RETURNS uuid AS $$
BEGIN
  RETURN gen_random_uuid();
EXCEPTION
  WHEN undefined_function THEN
    RETURN public.gen_random_uuid();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
