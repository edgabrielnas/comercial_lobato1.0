import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SurgeryTable from './components/SurgeryTable';
import ImportView from './components/ImportView';
import AnalyticsView from './components/AnalyticsView';
import AddSurgeryView from './components/AddSurgeryView';
import AdminView from './components/AdminView';
import ReportsView from './components/ReportsView';
import Login from './components/Login';
import { Surgery, ViewMode, User, SurgeryDefinition, GoogleConfig } from './types';
import { INITIAL_DEFINITIONS_CSV, parseDefinitionsCSV } from './utils/csvHelper';
import { StorageService } from './services/storageService';
import { GoogleSheetsService } from './services/googleSheetsService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  
  // Data State
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [definitions, setDefinitions] = useState<SurgeryDefinition[]>([]);
  
  // Settings State
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  
  const [currentView, setCurrentView] = useState<ViewMode>('login');
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [googleConfig, setGoogleConfig] = useState<GoogleConfig | null>(null);

  // Load Data from "Database" (LocalStorage) on Mount
  useEffect(() => {
    const loadedSurgeries = StorageService.loadSurgeries();
    const loadedDefinitions = StorageService.loadDefinitions();
    const loadedBudget = StorageService.loadBudget();
    const loadedGoogleConfig = StorageService.loadGoogleConfig();

    setSurgeries(loadedSurgeries);
    setMonthlyBudget(loadedBudget);
    setGoogleConfig(loadedGoogleConfig);

    // If no definitions exist in storage, load initial CSV defaults
    if (loadedDefinitions.length === 0 && INITIAL_DEFINITIONS_CSV) {
        const initialDefs = parseDefinitionsCSV(INITIAL_DEFINITIONS_CSV);
        setDefinitions(initialDefs);
        StorageService.saveDefinitions(initialDefs);
    } else {
        setDefinitions(loadedDefinitions);
    }
    
    setIsLoaded(true);
  }, []);

  // Handlers that update State AND Storage

  const handleAddSurgery = async (surgery: Surgery) => {
    const updated = [surgery, ...surgeries];
    setSurgeries(updated);
    StorageService.saveSurgeries(updated);
    
    // Auto sync if configured
    if (googleConfig && googleConfig.spreadsheetId) {
        await handleSync(updated); 
    }
  };

  const handleImportLogs = (newData: Surgery[]) => {
    const updated = [...newData, ...surgeries];
    setSurgeries(updated);
    StorageService.saveSurgeries(updated);
    setCurrentView('dashboard');
  };

  const handleImportDefinitions = (newDefs: SurgeryDefinition[]) => {
      const merged = [...definitions];
      newDefs.forEach(nd => {
          const idx = merged.findIndex(md => md.name === nd.name);
          if (idx >= 0) {
              merged[idx] = nd;
          } else {
              merged.push(nd);
          }
      });
      setDefinitions(merged);
      StorageService.saveDefinitions(merged);
      setCurrentView('admin');
  };

  // Toggle Payment Status Handler
  const handleTogglePayment = async (id: string) => {
    const updatedSurgeries = surgeries.map(s => {
      if (s.id === id) {
        return { ...s, isPaid: !s.isPaid };
      }
      return s;
    });
    setSurgeries(updatedSurgeries);
    StorageService.saveSurgeries(updatedSurgeries);

    // Auto sync if configured
    if (googleConfig && googleConfig.spreadsheetId) {
        await handleSync(updatedSurgeries); 
    }
  };

  // Admin Handlers
  const handleUpdateDefinition = (updated: SurgeryDefinition) => {
      const newDefs = definitions.map(d => d.id === updated.id ? updated : d);
      setDefinitions(newDefs);
      StorageService.saveDefinitions(newDefs);
  };

  const handleAddDefinition = (newDef: SurgeryDefinition) => {
      const newDefs = [...definitions, newDef];
      setDefinitions(newDefs);
      StorageService.saveDefinitions(newDefs);
  };

  const handleDeleteDefinition = (id: string) => {
      const newDefs = definitions.filter(d => d.id !== id);
      setDefinitions(newDefs);
      StorageService.saveDefinitions(newDefs);
  };

  const handleUpdateBudget = (val: number) => {
      setMonthlyBudget(val);
      StorageService.saveBudget(val);
  };

  // Google Sync Logic
  const handleSync = async (currentData = surgeries) => {
      const config = StorageService.loadGoogleConfig();
      if (!config || !config.spreadsheetId || !config.clientId) {
          alert('Configure a conexão com o Google Sheets na aba Administração primeiro.');
          return;
      }
      
      setIsSyncing(true);
      
      try {
          // Initialize GAPI
          const initialized = await GoogleSheetsService.initializeGapiClient(config);
          if (!initialized) throw new Error("Falha ao inicializar Google API");

          // Initialize Token Client
          const tokenClient = GoogleSheetsService.initializeTokenClient(config, async (resp) => {
              if (resp.error) throw resp;
              
              // Auth Success -> Execute Sync logic
              // Strategy: Read Remote -> Merge? Or Overwrite?
              // For simplicity in this "Database" mode:
              // 1. If local is empty, pull remote.
              // 2. If local has data, overwrite remote (Push Master).
              
              try {
                  // Push local data to Sheet
                  await GoogleSheetsService.saveSurgeries(config, currentData);
                  
                  // Update Last Sync
                  const newConfig = { ...config, lastSync: new Date().toISOString() };
                  StorageService.saveGoogleConfig(newConfig);
                  setGoogleConfig(newConfig);
                  
                  alert('Sincronização com Google Sheets realizada com sucesso!');
              } catch (e) {
                  console.error(e);
                  alert('Erro ao salvar na planilha.');
              } finally {
                  setIsSyncing(false);
              }
          });

          if (tokenClient) {
              // Trigger Auth Flow - If token exists gapi might handle it, but explicit request is safer for "Connect" button
              // Request access token with prompt
              tokenClient.requestAccessToken({ prompt: '' });
          }

      } catch (error) {
          console.error(error);
          alert('Erro na conexão com o Google.');
          setIsSyncing(false);
      }
  };

  const handlePullFromGoogle = async () => {
    const config = StorageService.loadGoogleConfig();
    if (!config || !config.spreadsheetId) return;

    setIsSyncing(true);
    try {
        const initialized = await GoogleSheetsService.initializeGapiClient(config);
        if (!initialized) throw new Error("Falha ao inicializar Google API");

        const tokenClient = GoogleSheetsService.initializeTokenClient(config, async (resp) => {
            if (resp.error) throw resp;
            try {
                const remoteSurgeries = await GoogleSheetsService.fetchSurgeries(config);
                if (remoteSurgeries.length > 0) {
                    setSurgeries(remoteSurgeries);
                    StorageService.saveSurgeries(remoteSurgeries);
                    alert(`${remoteSurgeries.length} registros baixados do Google Sheets.`);
                } else {
                    alert('Planilha vazia.');
                }
            } catch (e) {
                console.error(e);
                alert('Erro ao ler planilha.');
            } finally {
                setIsSyncing(false);
            }
        });

        tokenClient?.requestAccessToken({ prompt: '' });
    } catch (e) {
        setIsSyncing(false);
    }
  };

  // If user is not logged in, show login view
  if (!user) {
    return <Login onLogin={(u) => { setUser(u); setCurrentView('dashboard'); }} />;
  }

  const getViewTitle = () => {
    switch(currentView) {
      case 'dashboard': return 'Painel de Controle';
      case 'list': return 'Lista de Cirurgias';
      case 'analytics': return 'Análises & Gráficos';
      case 'upload': return 'Importar Dados';
      case 'add_surgery': return 'Nova Cirurgia';
      case 'admin': return 'Administração';
      case 'doctors': return 'Visão Médica';
      case 'reports': return 'Relatórios e Recebimentos';
      default: return '';
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        user={user}
        onLogout={() => setUser(null)}
        onSync={() => handleSync(surgeries)}
        onPull={handlePullFromGoogle}
        isSyncing={isSyncing}
        hasGoogleConfig={!!googleConfig?.spreadsheetId}
      />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 h-screen overflow-y-auto custom-scrollbar">
        <header className="mb-8 flex justify-between items-center no-print">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 capitalize">{getViewTitle()}</h2>
          </div>
          <div className="flex items-center gap-4">
             {googleConfig?.lastSync && (
                 <span className="text-xs text-slate-400">
                     Sincronizado: {new Date(googleConfig.lastSync).toLocaleTimeString()}
                 </span>
             )}
            <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                Hoje: {new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
        </header>

        {(currentView === 'dashboard' || currentView === 'doctors') && (
            <Dashboard 
                surgeries={surgeries} 
                monthlyBudget={monthlyBudget} 
            />
        )}
        {currentView === 'list' && <SurgeryTable surgeries={surgeries} />}
        {currentView === 'analytics' && <AnalyticsView surgeries={surgeries} />}
        {currentView === 'reports' && (
            <ReportsView 
                surgeries={surgeries}
                monthlyBudget={monthlyBudget}
                onTogglePayment={handleTogglePayment}
            />
        )}
        {currentView === 'add_surgery' && (
            <AddSurgeryView 
                onAdd={handleAddSurgery} 
                definitions={definitions}
                onCancel={() => setCurrentView('dashboard')}
                existingSurgeries={surgeries}
            />
        )}
        {currentView === 'upload' && (
          <ImportView 
            onImportLogs={handleImportLogs} 
            onImportDefinitions={handleImportDefinitions}
            existingDefinitions={definitions}
            onCancel={() => setCurrentView('dashboard')} 
          />
        )}
        {currentView === 'admin' && user.isAdmin && (
            <AdminView 
                definitions={definitions}
                onUpdateDefinition={handleUpdateDefinition}
                onAddDefinition={handleAddDefinition}
                onDeleteDefinition={handleDeleteDefinition}
                monthlyBudget={monthlyBudget}
                onUpdateBudget={handleUpdateBudget}
            />
        )}
        {currentView === 'admin' && !user.isAdmin && (
            <div className="p-8 text-center text-slate-500">Acesso negado. Contate o administrador.</div>
        )}
      </main>
    </div>
  );
};

export default App;