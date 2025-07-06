-- Create institution_types table
CREATE TABLE institution_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Add institution type data
INSERT INTO institution_types (name, code, description) VALUES
  ('Banque', 'bank', 'Établissement bancaire traditionnel'),
  ('Institution de Microfinance', 'microfinance', 'Institution spécialisée en microfinance'),
  ('Fonds d''Investissement', 'investment_fund', 'Fonds d''investissement et capital-risque'),
  ('Coopérative', 'cooperative', 'Coopérative d''épargne et de crédit');

-- Add columns to institutions table
ALTER TABLE institutions ADD COLUMN type_id uuid REFERENCES institution_types(id);
ALTER TABLE institutions ADD COLUMN address text;
ALTER TABLE institutions ADD COLUMN phone text;
ALTER TABLE institutions ADD COLUMN email text;
ALTER TABLE institutions ADD COLUMN website text;
ALTER TABLE institutions ADD COLUMN legal_representative text;
ALTER TABLE institutions ADD COLUMN tax_id text;
ALTER TABLE institutions ADD COLUMN regulatory_status text;
ALTER TABLE institutions ADD COLUMN documents jsonb;

-- Create institution_users table for managing institution staff
CREATE TABLE institution_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES institutions(id),
  user_id uuid REFERENCES auth.users(id),
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'portfolio_manager', 'analyst', 'viewer')),
  status text NOT NULL DEFAULT 'pending',
  permissions jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add portfolio categories
CREATE TABLE portfolio_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

INSERT INTO portfolio_categories (name, code, description) VALUES
  ('Finance Traditionnelle', 'traditional', 'Portefeuille de crédit classique'),
  ('Capital Investissement', 'investment', 'Portefeuille d''investissement en capital'),
  ('Leasing', 'leasing', 'Portefeuille de leasing et crédit-bail');

-- Update portfolios table with new relationships
ALTER TABLE portfolios ADD COLUMN category_id uuid REFERENCES portfolio_categories(id);
ALTER TABLE portfolios ADD COLUMN institution_id uuid REFERENCES institutions(id);
ALTER TABLE portfolios ADD COLUMN description text;
ALTER TABLE portfolios ADD COLUMN investment_criteria jsonb;
ALTER TABLE portfolios ADD COLUMN risk_limits jsonb;
ALTER TABLE portfolios ADD COLUMN performance_targets jsonb;
ALTER TABLE portfolios ADD COLUMN documents jsonb;

-- Create portfolio_team table for managing portfolio team members
CREATE TABLE portfolio_team (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid REFERENCES portfolios(id),
  user_id uuid REFERENCES auth.users(id),
  role text NOT NULL CHECK (role IN ('manager', 'analyst', 'viewer')),
  permissions jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS policies
ALTER TABLE institution_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_team ENABLE ROW LEVEL SECURITY;

-- Policies for institution_users
CREATE POLICY "Users can view their own institution roles"
  ON institution_users FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Institution admins can manage users"
  ON institution_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM institution_users
      WHERE user_id = auth.uid()
      AND institution_id = institution_users.institution_id
      AND role = 'admin'
    )
  );

-- Policies for portfolio_team
CREATE POLICY "Users can view their portfolio roles"
  ON portfolio_team FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Portfolio managers can manage team"
  ON portfolio_team
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_team
      WHERE user_id = auth.uid()
      AND portfolio_id = portfolio_team.portfolio_id
      AND role = 'manager'
    )
  );

-- Add indexes
CREATE INDEX idx_institution_users_user_id ON institution_users(user_id);
CREATE INDEX idx_institution_users_institution_id ON institution_users(institution_id);
CREATE INDEX idx_portfolio_team_user_id ON portfolio_team(user_id);
CREATE INDEX idx_portfolio_team_portfolio_id ON portfolio_team(portfolio_id);
CREATE INDEX idx_portfolios_institution_id ON portfolios(institution_id);
CREATE INDEX idx_portfolios_category_id ON portfolios(category_id);