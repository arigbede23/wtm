-- Auto-create a public.users row when a new auth.users row is inserted.
-- This handles OAuth signups where no explicit profile creation happens.
-- Extracts displayName and avatarUrl from the OAuth provider metadata.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, "displayName", "avatarUrl", "createdAt", "updatedAt")
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data ->> 'avatar_url',
      NEW.raw_user_meta_data ->> 'picture'
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    "displayName" = COALESCE(EXCLUDED."displayName", public.users."displayName"),
    "avatarUrl"   = COALESCE(EXCLUDED."avatarUrl", public.users."avatarUrl"),
    "updatedAt"   = NOW();

  RETURN NEW;
END;
$$;

-- Drop the trigger if it already exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
