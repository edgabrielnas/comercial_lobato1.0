import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Surgery, SurgeryDefinition, SupabaseConfig } from '../types';

let supabase: SupabaseClient | null = null;

// Fallback credentials (Development/Demo)
const FALLBACK_URL = "https://mrpfcikhpsvnjzixgrqo.supabase.co";
const FALLBACK_KEY = "sb_publishable_qsu-RwskulBm8fMDT-m-1Q_bJOI7gfs";

export const SupabaseService = {
  initialize: (config?: SupabaseConfig) => {
    // 1. Try Config passed via argument (Local Storage)
    let url = config?.url;
    let key = config?.anonKey;

    // 2. Try Environment Variables (Defensive check)
    // We access import.meta.env safely to prevent runtime crashes if it's undefined
    if (!url || !key) {
        try {
            // @ts-ignore - Handle cases where types might misalign during strict builds
            const env: any = import.meta.env || {}; 
            url = env.VITE_SUPABASE_URL;
            key = env.VITE_SUPABASE_ANON_KEY;
        } catch (e) {
            console.warn("Could not access import.meta.env");
        }
    }

    // 3. Fallback to hardcoded constants
    if (!url) url = FALLBACK_URL;
    if (!key) key = FALLBACK_KEY;

    if (url && key) {
        try {
            supabase = createClient(url, key);
            return supabase;
        } catch (e) {
            console.warn("Supabase init warning", e);
            return null;
        }
    }
    return null;
  },

  getClient: () => supabase,

  // --- Surgeries ---

  fetchSurgeries: async (): Promise<Surgery[]> => {
    if (!supabase) throw new Error("Supabase not initialized");
    
    const { data, error } = await supabase
      .from('surgeries')
      .select('*');

    if (error) throw error;

    // Map snake_case (DB) to camelCase (App)
    return (data || []).map((row: any) => ({
      id: row.id,
      patientName: row.patient_name,
      date: row.date,
      doctorName: row.doctor_name,
      surgeryType: row.surgery_type,
      points: Number(row.points),
      notes: row.notes,
      source: row.source,
      healthInsurance: row.health_insurance,
      cost: Number(row.cost),
      receivedValue: Number(row.received_value),
      isPaid: row.is_paid
    }));
  },

  // Save all (Upsert strategy with batching)
  saveSurgeries: async (surgeries: Surgery[]): Promise<void> => {
    if (!supabase) throw new Error("Supabase not initialized");

    const CHUNK_SIZE = 100; // Supabase batch size limit safety
    for (let i = 0; i < surgeries.length; i += CHUNK_SIZE) {
        const chunk = surgeries.slice(i, i + CHUNK_SIZE);
        
        // Map camelCase (App) to snake_case (DB)
        const rows = chunk.map(s => ({
          id: s.id,
          patient_name: s.patientName,
          date: s.date,
          doctor_name: s.doctorName,
          surgery_type: s.surgeryType,
          points: s.points,
          notes: s.notes,
          source: s.source,
          health_insurance: s.healthInsurance,
          cost: s.cost,
          received_value: s.receivedValue || 0,
          is_paid: s.isPaid
        }));

        const { error } = await supabase
          .from('surgeries')
          .upsert(rows, { onConflict: 'id' });

        if (error) throw error;
    }
  },

  deleteSurgery: async (id: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase not initialized");
    const { error } = await supabase.from('surgeries').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Definitions ---

  fetchDefinitions: async (): Promise<SurgeryDefinition[]> => {
    if (!supabase) throw new Error("Supabase not initialized");

    const { data, error } = await supabase
      .from('definitions')
      .select('*');

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      points: Number(row.points),
      complexity: row.complexity,
      code: row.code,
      basePrice: Number(row.base_price)
    }));
  },

  saveDefinitions: async (definitions: SurgeryDefinition[]): Promise<void> => {
    if (!supabase) throw new Error("Supabase not initialized");

    const CHUNK_SIZE = 100;
    for (let i = 0; i < definitions.length; i += CHUNK_SIZE) {
        const chunk = definitions.slice(i, i + CHUNK_SIZE);
        
        const rows = chunk.map(d => ({
          id: d.id,
          name: d.name,
          points: d.points,
          complexity: d.complexity,
          code: d.code,
          base_price: d.basePrice
        }));

        const { error } = await supabase
          .from('definitions')
          .upsert(rows, { onConflict: 'id' });

        if (error) throw error;
    }
  },

  deleteDefinition: async (id: string): Promise<void> => {
    if (!supabase) throw new Error("Supabase not initialized");
    const { error } = await supabase.from('definitions').delete().eq('id', id);
    if (error) throw error;
  }
};