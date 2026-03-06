export interface Surgery {
  id: string;
  patientName: string;
  date: string; // Stored as ISO string YYYY-MM-DD
  doctorName: string;
  surgeryType: string;
  points: number;
  notes?: string;
  hospital?: string;
  source?: 'Hapvida' | 'Carta de Rede' | 'Venda de Serviço' | string;
  healthInsurance?: string; // Convênio (para Venda de Serviço)
  cost?: number; // Valor em R$ (para Venda de Serviço) - Valor Cobrado/Tabela
  receivedValue?: number; // Valor efetivamente recebido
  isPaid?: boolean; // Status do recebimento
}

export interface SurgeryDefinition {
  id: string;
  name: string;
  points: number;
  complexity: string;
  code?: string;
  basePrice?: number; // Preço base para cálculo de Venda de Serviço
}

export interface DoctorStats {
  doctorName: string;
  totalSurgeries: number;
  totalPoints: number;
  averagePoints: number;
  surgeriesByMonth: Record<string, number>;
  pointsByMonth: Record<string, number>;
}

export interface User {
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  lastSync?: string;
}

export interface GoogleConfig {
  apiKey: string;
  clientId: string;
  spreadsheetId: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export type ViewMode = 'login' | 'dashboard' | 'list' | 'analytics' | 'upload' | 'add_surgery' | 'admin' | 'doctors' | 'reports' | 'billing' | 'insurance' | 'invoices' | 'cashflow' | 'alerts' | 'personal';

// =====================================================
// MÓDULOS DE GESTÃO FINANCEIRA MÉDICA
// =====================================================

export type BillingStatus = 'REALIZADO' | 'FATURADO' | 'PAGO' | 'GLOSADO' | 'PENDENTE';
export type ProcedureType = 'consulta' | 'cirurgia' | 'ambulatorial' | 'telemedicina';
export type AppealStatus = 'PENDENTE' | 'EM ANÁLISE' | 'APROVADO' | 'NEGADO';
export type InvoiceStatus = 'PENDENTE' | 'EMITIDA' | 'CANCELADA';
export type ServiceType = 'médico' | 'cirúrgico' | 'consultoria' | 'perícia';
export type Entity = 'PJ' | 'PF';

// Módulo 1 — Produção Médica
export interface MedicalProcedure {
  id: string;
  date: string; // YYYY-MM-DD
  patientIdentifier: string; // Iniciais + Data nascimento (LGPD)
  procedureType: ProcedureType;
  location: string;
  tussCode?: string;
  procedureName: string;
  healthInsurance: string; // 'particular' ou nome do convênio
  guideNumber?: string;
  tableValue: number;
  chargedValue: number;
  receivedValue: number;
  billingStatus: BillingStatus;
  expectedPaymentDate?: string;
  billingDate?: string;
  paymentDate?: string;
  doctorName?: string;
  notes?: string;
  createdAt?: string;
}

// Módulo 2 — Convênios
export interface HealthInsurance {
  id: string;
  name: string;
  referenceTable: string;
  adjustmentPercentage: number;
  contractualPaymentDays: number;
  averageActualDays: number;
  glossRate: number;
  totalGlossedYear: number;
}

// Módulo 2 — Glosas
export interface Gloss {
  id: string;
  procedureId?: string;
  healthInsurance: string;
  glossCode?: string;
  glossReason: string;
  glossedValue: number;
  identifiedDate: string;
  appealDeadline?: string;
  appealStatus: AppealStatus;
  appealNotes?: string;
}

// Módulo 3 — NFS-e
export interface InvoiceNFSe {
  id: string;
  procedureId?: string;
  issueDate?: string;
  serviceType: ServiceType;
  recipientType: 'pf' | 'pj';
  recipientDocument?: string;
  recipientName: string;
  city: string;
  grossValue: number;
  issRate: number;
  issWithheld: boolean;
  irWithheld: boolean;
  inssWithheld: boolean;
  netValue: number;
  nfseNumber?: string;
  status: InvoiceStatus;
  competenceMonth?: string;
  notes?: string;
}

// Módulo 4 — Despesas
export interface MedicalExpense {
  id: string;
  date: string;
  category: string;
  description: string;
  value: number;
  entity: Entity;
  isDeductible: boolean;
}

// Módulo 6 — Financeiro Pessoal
export interface PersonalFinance {
  id: string;
  month: string; // YYYY-MM
  prolaboreDefined: number;
  prolaboreWithdrawn: number;
  dividends: number;
  personalExpenses: number;
  invested: number;
  emergencyReserve: number;
  pgblVgblContribution: number;
  notes?: string;
}

// Alerta do sistema
export interface SystemAlert {
  id: string;
  level: 'urgent' | 'warning' | 'info';
  message: string;
  detail?: string;
  action?: string;
  date: string;
}