-- =====================================================
-- MIGRAÇÃO: Módulos de Gestão Financeira Médica
-- UroScore — Execute no Supabase SQL Editor
-- =====================================================

-- Módulo 1: Procedimentos Médicos
CREATE TABLE IF NOT EXISTS medical_procedures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  patient_identifier text NOT NULL,
  procedure_type text NOT NULL DEFAULT 'consulta',
  location text NOT NULL DEFAULT 'consultório',
  tuss_code text,
  procedure_name text NOT NULL,
  health_insurance text NOT NULL DEFAULT 'particular',
  guide_number text,
  table_value numeric DEFAULT 0,
  charged_value numeric DEFAULT 0,
  received_value numeric DEFAULT 0,
  billing_status text NOT NULL DEFAULT 'REALIZADO',
  expected_payment_date date,
  billing_date date,
  payment_date date,
  doctor_name text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Módulo 2: Convênios
CREATE TABLE IF NOT EXISTS health_insurances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  reference_table text DEFAULT 'CBHPM',
  adjustment_percentage numeric DEFAULT 0,
  contractual_payment_days int DEFAULT 30,
  average_actual_days numeric DEFAULT 30,
  gloss_rate numeric DEFAULT 0,
  total_glossed_year numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Módulo 2: Glosas
CREATE TABLE IF NOT EXISTS glosses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id uuid,
  health_insurance text NOT NULL,
  gloss_code text,
  gloss_reason text NOT NULL,
  glossed_value numeric NOT NULL DEFAULT 0,
  identified_date date NOT NULL,
  appeal_deadline date,
  appeal_status text NOT NULL DEFAULT 'PENDENTE',
  appeal_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Módulo 3: Notas Fiscais NFS-e
CREATE TABLE IF NOT EXISTS invoices_nfse (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id uuid,
  issue_date date,
  service_type text NOT NULL DEFAULT 'médico',
  recipient_type text NOT NULL DEFAULT 'pf',
  recipient_document text,
  recipient_name text NOT NULL,
  city text NOT NULL DEFAULT 'São Paulo',
  gross_value numeric NOT NULL DEFAULT 0,
  iss_rate numeric DEFAULT 2,
  iss_withheld boolean DEFAULT false,
  ir_withheld boolean DEFAULT false,
  inss_withheld boolean DEFAULT false,
  net_value numeric DEFAULT 0,
  nfse_number text,
  status text NOT NULL DEFAULT 'PENDENTE',
  competence_month text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Módulo 4: Despesas Médicas
CREATE TABLE IF NOT EXISTS medical_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  value numeric NOT NULL DEFAULT 0,
  entity text NOT NULL DEFAULT 'PJ',
  is_deductible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Módulo 6: Financeiro Pessoal
CREATE TABLE IF NOT EXISTS personal_finance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text NOT NULL UNIQUE,
  prolabore_defined numeric DEFAULT 0,
  prolabore_withdrawn numeric DEFAULT 0,
  dividends numeric DEFAULT 0,
  personal_expenses numeric DEFAULT 0,
  invested numeric DEFAULT 0,
  emergency_reserve numeric DEFAULT 0,
  pgbl_vgbl_contribution numeric DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- Verificação (rode para confirmar)
-- =====================================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'medical_procedures','health_insurances','glosses',
    'invoices_nfse','medical_expenses','personal_finance'
  )
ORDER BY table_name;
