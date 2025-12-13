import { Surgery, GoogleConfig } from '../types';

// Global types for Google API
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';

export const GoogleSheetsService = {
  extractIdFromUrl: (url: string): string | null => {
    const match = url.match(/\/d\/(.*?)(\/|$)/);
    return match ? match[1] : null;
  },

  initializeGapiClient: async (config: GoogleConfig): Promise<boolean> => {
    if (!config.apiKey || !config.clientId) return false;

    return new Promise((resolve) => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: config.apiKey,
            discoveryDocs: [DISCOVERY_DOC],
          });
          resolve(true);
        } catch (error) {
          console.error('Error initializing GAPI client', error);
          resolve(false);
        }
      });
    });
  },

  // Initializes the Token Client (for OAuth)
  initializeTokenClient: (config: GoogleConfig, callback: (resp: any) => void) => {
    if (!window.google) return null;
    return window.google.accounts.oauth2.initTokenClient({
      client_id: config.clientId,
      scope: SCOPES,
      callback: callback,
    });
  },

  // Formats App Data to Google Sheets Rows
  surgeriesToRows: (surgeries: Surgery[]): any[][] => {
    const header = ['ID', 'PACIENTE', 'DATA', 'MÉDICO', 'CIRURGIA', 'PONTOS', 'OBSERVAÇÕES', 'FONTE', 'CONVÊNIO', 'VALOR', 'PAGO'];
    const rows = surgeries.map(s => [
      s.id,
      s.patientName,
      s.date,
      s.doctorName,
      s.surgeryType,
      s.points,
      s.notes || '',
      s.source || 'Hapvida',
      s.healthInsurance || '',
      s.cost || 0,
      s.isPaid ? 'SIM' : 'NÃO'
    ]);
    return [header, ...rows];
  },

  // Formats Google Sheets Rows to App Data
  rowsToSurgeries: (rows: any[][]): Surgery[] => {
    if (!rows || rows.length < 2) return [];
    
    // Assuming Fixed Structure created by surgeriesToRows
    // Skip header (index 0)
    return rows.slice(1).map((row, index) => {
        // row indexes correspond to the header above
        return {
            id: row[0] || `synced-${index}-${Date.now()}`,
            patientName: row[1] || 'Desconhecido',
            date: row[2] || new Date().toISOString().split('T')[0],
            doctorName: row[3] || '',
            surgeryType: row[4] || '',
            points: Number(row[5]) || 0,
            notes: row[6] || '',
            source: row[7] || 'Hapvida',
            healthInsurance: row[8] || '',
            cost: Number(row[9]) || 0,
            isPaid: (row[10] || '').toString().toUpperCase() === 'SIM'
        };
    });
  },

  // Read Data
  fetchSurgeries: async (config: GoogleConfig): Promise<Surgery[]> => {
    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: config.spreadsheetId,
        range: 'A:K', // Columns A to K
      });
      const rows = response.result.values;
      return GoogleSheetsService.rowsToSurgeries(rows);
    } catch (error) {
      console.error('Error fetching from Sheets:', error);
      throw error;
    }
  },

  // Write Data (Overwrites the sheet content to ensure sync)
  saveSurgeries: async (config: GoogleConfig, surgeries: Surgery[]): Promise<void> => {
    try {
      const rows = GoogleSheetsService.surgeriesToRows(surgeries);
      
      const body = {
        values: rows
      };

      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: config.spreadsheetId,
        range: 'A1',
        valueInputOption: 'RAW',
        resource: body,
      });
    } catch (error) {
      console.error('Error saving to Sheets:', error);
      throw error;
    }
  }
};