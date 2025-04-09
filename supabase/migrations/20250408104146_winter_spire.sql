/*
  # Initial Schema Setup

  1. New Tables
    - users (extends Supabase auth.users)
      - role (text): provider or customer
      - name (text): user's display name
      - location (point): user's location coordinates
    
    - categories
      - name (text): category name
      - description (text): category description
      - image_url (text): category image
    
    - services
      - title (text): service title
      - description (text): service description
      - price (numeric): service price
      - provider_id (uuid): reference to users
      - category_id (uuid): reference to categories
      - location (point): service location

  2. Security
    - Enable RLS on all tables
    - Add policies for read/write access
*/

-- Create users table extending auth.users
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  role text NOT NULL CHECK (role IN ('provider', 'customer')),
  name text NOT NULL,
  location point,
  created_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  provider_id uuid REFERENCES public.users(id),
  category_id uuid REFERENCES public.categories(id),
  location point,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can read all profiles"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policies for categories table
CREATE POLICY "Anyone can read categories"
  ON public.categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for services table
CREATE POLICY "Anyone can read services"
  ON public.services
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Providers can create services"
  ON public.services
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND role = 'provider'
    )
  );

CREATE POLICY "Providers can update own services"
  ON public.services
  FOR UPDATE
  TO authenticated
  USING (provider_id = auth.uid());