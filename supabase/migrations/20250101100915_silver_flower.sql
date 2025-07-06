/*
  # Schéma pour les institutions financières et la gestion avancée des portefeuilles

  1. Nouvelles Tables
    - `institutions` : Informations sur les institutions financières
    - `portfolio_managers` : Gestionnaires de portefeuille agréés
    - `portfolios` : Portefeuilles d'investissement
    - `portfolio_rules` : Règles de gestion des portefeuilles
    - `companies` : Entreprises prospectées
    - `meetings` : Rendez-vous avec les entrepreneurs
    - `chat_messages` : Messages de chat
    - `financial_products` : Produits financiers (crédit, leasing)
    - `equipment_catalog` : Catalogue d'équipements pour le leasing

  2. Relations
    - Portfolio Manager -> Portfolios (1:n)
    - Institution -> Portfolio Managers (1:n)
    - Portfolio -> Operations (1:n)
    - Portfolio -> Rules (1:n)

  3. Sécurité
    - RLS pour chaque table
    - Politiques basées sur les rôles et les institutions
*/

-- Institutions
CREATE TABLE institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  license_number text UNIQUE NOT NULL,
  license_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  validation_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Portfolio Managers
CREATE TABLE portfolio_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  institution_id uuid REFERENCES institutions NOT NULL,
  license_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  validation_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Portfolios
CREATE TABLE portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  manager_id uuid REFERENCES portfolio_managers NOT NULL,
  type text NOT NULL,
  target_amount numeric NOT NULL,
  target_return numeric NOT NULL,
  target_sectors text[] NOT NULL,
  risk_profile text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Portfolio Rules
CREATE TABLE portfolio_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid REFERENCES portfolios NOT NULL,
  rule_type text NOT NULL,
  rule_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Companies (Prospects)
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sector text NOT NULL,
  size text NOT NULL,
  annual_revenue numeric,
  employee_count int,
  pitch_deck_url text,
  financial_metrics jsonb,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Meetings
CREATE TABLE meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies NOT NULL,
  portfolio_manager_id uuid REFERENCES portfolio_managers NOT NULL,
  meeting_date timestamptz NOT NULL,
  meeting_type text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chat Messages
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users NOT NULL,
  receiver_id uuid REFERENCES auth.users NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Financial Products
CREATE TABLE financial_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid REFERENCES portfolios NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  characteristics jsonb NOT NULL,
  interest_rate_range jsonb,
  duration_range jsonb,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Equipment Catalog
CREATE TABLE equipment_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES financial_products NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  specifications jsonb NOT NULL,
  price numeric NOT NULL,
  image_url text,
  availability boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_catalog ENABLE ROW LEVEL SECURITY;

-- Policies for institutions
CREATE POLICY "Public institutions are viewable by all users"
  ON institutions FOR SELECT
  USING (status = 'active');

-- Policies for portfolio managers
CREATE POLICY "Portfolio managers can view their own data"
  ON portfolio_managers FOR SELECT
  USING (user_id = auth.uid());

-- Policies for portfolios
CREATE POLICY "Managers can view their portfolios"
  ON portfolios FOR SELECT
  USING (
    manager_id IN (
      SELECT id FROM portfolio_managers 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Institution managers can view all portfolios"
  ON portfolios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_managers pm
      WHERE pm.user_id = auth.uid()
      AND pm.role = 'manager'
      AND pm.institution_id = (
        SELECT institution_id FROM portfolio_managers
        WHERE id = portfolios.manager_id
      )
    )
  );

-- Add indexes for performance
CREATE INDEX idx_portfolio_managers_user_id ON portfolio_managers(user_id);
CREATE INDEX idx_portfolios_manager_id ON portfolios(manager_id);
CREATE INDEX idx_meetings_company_id ON meetings(company_id);
CREATE INDEX idx_chat_messages_sender_receiver ON chat_messages(sender_id, receiver_id);