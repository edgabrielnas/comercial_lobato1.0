
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

export interface DoctorConfig {
  id: string; // Usually doctorName normalized
  doctorName: string;
  fixedValue: number; // Valor Fixo
  timeValue: number;  // Valor por Tempo
  roleValue: number;  // Valor por Cargos/Função
  roleDescription?: string; // Descrição do cargo (ex: Coordenador)
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

export type ViewMode = 'login' | 'dashboard' | 'list' | 'analytics' | 'upload' | 'add_surgery' | 'admin' | 'doctors' | 'reports' | 'payments';
