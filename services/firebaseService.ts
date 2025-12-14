import { Surgery, SurgeryDefinition, FirebaseConfig } from '../types';

/*
// Firebase v9 Modular SDK imports
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, writeBatch, Firestore } from 'firebase/firestore';
*/

// Types stubbed to avoid compilation errors
type Firestore = any;
type FirebaseApp = any;

let db: Firestore | null = null;
let app: FirebaseApp | null = null;

export const FirebaseService = {
  initialize: (config: FirebaseConfig) => {
    /*
    if (!config.apiKey || !config.projectId) {
        console.error("Configuração Firebase incompleta. Necessário apiKey e projectId.");
        return null;
    }
    try {
      // Check if apps are already initialized to prevent duplicate initialization
      if (!getApps().length) {
        app = initializeApp(config);
      } else {
        app = getApp();
      }
      db = getFirestore(app);
      return db;
    } catch (e) {
      console.error("Firebase init error", e);
      return null;
    }
    */
    console.warn("FirebaseService is disabled due to missing dependencies.");
    return null;
  },

  getClient: () => db,

  // --- Surgeries ---

  fetchSurgeries: async (): Promise<Surgery[]> => {
    /*
    if (!db) throw new Error("Firebase not initialized");
    
    const querySnapshot = await getDocs(collection(db, "surgeries"));
    const data: Surgery[] = [];
    
    querySnapshot.forEach((doc) => {
      data.push(doc.data() as Surgery);
    });

    return data;
    */
    console.warn("FirebaseService is disabled.");
    return [];
  },

  // Save all (Batch write)
  saveSurgeries: async (surgeries: Surgery[]): Promise<void> => {
    /*
    if (!db) throw new Error("Firebase not initialized");

    const CHUNK_SIZE = 450;
    for (let i = 0; i < surgeries.length; i += CHUNK_SIZE) {
        const chunk = surgeries.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach(s => {
            const ref = doc(db!, "surgeries", s.id);
            batch.set(ref, s);
        });
        await batch.commit();
    }
    */
    console.warn("FirebaseService is disabled.");
  },

  // --- Definitions ---

  fetchDefinitions: async (): Promise<SurgeryDefinition[]> => {
    /*
    if (!db) throw new Error("Firebase not initialized");

    const querySnapshot = await getDocs(collection(db, "definitions"));
    const data: SurgeryDefinition[] = [];

    querySnapshot.forEach((doc) => {
      data.push(doc.data() as SurgeryDefinition);
    });

    return data;
    */
    console.warn("FirebaseService is disabled.");
    return [];
  },

  saveDefinitions: async (definitions: SurgeryDefinition[]): Promise<void> => {
    /*
    if (!db) throw new Error("Firebase not initialized");

    const CHUNK_SIZE = 450;
    for (let i = 0; i < definitions.length; i += CHUNK_SIZE) {
        const chunk = definitions.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach(d => {
            const ref = doc(db!, "definitions", d.id);
            batch.set(ref, d);
        });
        await batch.commit();
    }
    */
    console.warn("FirebaseService is disabled.");
  }
};