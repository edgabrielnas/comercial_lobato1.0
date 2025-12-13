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
  cost?: number; // Valor em R$ (para Venda de Serviço)
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

export interface GoogleConfig {
  spreadsheetUrl: string;
  spreadsheetId: string;
  apiKey: string;
  clientId: string;
  lastSync?: string;
}

export type ViewMode = 'login' | 'dashboard' | 'list' | 'analytics' | 'upload' | 'add_surgery' | 'admin' | 'doctors' | 'reports';