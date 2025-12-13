import { Surgery, SurgeryDefinition, GoogleConfig } from '../types';

const KEYS = {
  SURGERIES: 'uroscore_db_surgeries',
  DEFINITIONS: 'uroscore_db_definitions',
  BUDGET: 'uroscore_db_budget',
  GOOGLE_CONFIG: 'uroscore_db_google_config'
};

export const StorageService = {
  // Surgeries (Logs)
  saveSurgeries: (data: Surgery[]) => {
    try {
      localStorage.setItem(KEYS.SURGERIES, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar cirurgias:', error);
    }
  },

  loadSurgeries: (): Surgery[] => {
    try {
      const data = localStorage.getItem(KEYS.SURGERIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar cirurgias:', error);
      return [];
    }
  },

  // Definitions (Score Table)
  saveDefinitions: (data: SurgeryDefinition[]) => {
    try {
      localStorage.setItem(KEYS.DEFINITIONS, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar definições:', error);
    }
  },

  loadDefinitions: (): SurgeryDefinition[] => {
    try {
      const data = localStorage.getItem(KEYS.DEFINITIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar definições:', error);
      return [];
    }
  },

  // Financial Settings
  saveBudget: (amount: number) => {
    try {
      localStorage.setItem(KEYS.BUDGET, amount.toString());
    } catch (error) {
      console.error('Erro ao salvar verba:', error);
    }
  },

  loadBudget: (): number => {
    try {
      const data = localStorage.getItem(KEYS.BUDGET);
      return data ? parseFloat(data) : 0;
    } catch (error) {
      console.error('Erro ao carregar verba:', error);
      return 0;
    }
  },

  // Google Config
  saveGoogleConfig: (config: GoogleConfig) => {
    try {
      localStorage.setItem(KEYS.GOOGLE_CONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('Erro ao salvar config Google:', error);
    }
  },

  loadGoogleConfig: (): GoogleConfig | null => {
    try {
      const data = localStorage.getItem(KEYS.GOOGLE_CONFIG);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao carregar config Google:', error);
      return null;
    }
  },

  // Clear Database (Optional utility)
  clearDatabase: () => {
    localStorage.removeItem(KEYS.SURGERIES);
    localStorage.removeItem(KEYS.DEFINITIONS);
    localStorage.removeItem(KEYS.BUDGET);
    // Keep google config optionally
  }
};