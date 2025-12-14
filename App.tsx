import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SurgeryTable from './components/SurgeryTable';
import ImportView from './components/ImportView';
import AnalyticsView from './components/AnalyticsView';
import AddSurgeryView from './components/AddSurgeryView';
import { AdminView } from './components/AdminView';
import ReportsView from './components/ReportsView';
import Login from './components/Login';
import { Surgery, ViewMode, User, SurgeryDefinition, SupabaseConfig } from './types';
import { INITIAL_DEFINITIONS_CSV, parseDefinitionsCSV } from './utils/csvHelper';
import { StorageService } from './services/storageService';
import { SupabaseService } from './services/supabaseService';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  
  // Data State
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [definitions, setDefinitions] = useState<SurgeryDefinition[]>([]);
  
  // Settings State
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  
  const [currentView, setCurrentView] = useState<ViewMode>('login');
  const [isLoaded, setIsLoaded] = useState(false);

  // Editing State
  const [editingSurgery, setEditingSurgery] = useState<Surgery | null>(null);

  // Sync State
  const [isSyncing, setIsSyncing] = useState(false);

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize App: Load data from Supabase
  useEffect(() => {
    const initializeApp = async () => {
        const loadedBudget = StorageService.loadBudget();
        setMonthlyBudget(loadedBudget);

        // Load specific Supabase config or default
        let loadedSupabaseConfig = StorageService.loadSupabaseConfig();
        
        // Initialize Supabase Service
        const client = SupabaseService.initialize(loadedSupabaseConfig || undefined);
        
        if (client) {
            try {
                const dbSurgeries = await SupabaseService.fetchSurgeries();
                const dbDefinitions = await SupabaseService.fetchDefinitions();
                
                // If DB is empty, maybe fallback to local or defaults (Migration strategy)
                if (dbSurgeries.length > 0) {
                    setSurgeries(dbSurgeries);
                } else {
                    const localSurgeries = StorageService.loadSurgeries();
                    if (localSurgeries.length > 0) {
                        setSurgeries(localSurgeries);
                        await SupabaseService.saveSurgeries(localSurgeries);
                    }
                }

                if (dbDefinitions.length > 0) {
                    setDefinitions(dbDefinitions);
                } else {
                    if (INITIAL_DEFINITIONS_CSV) {
                        const initialDefs = parseDefinitionsCSV(INITIAL_DEFINITIONS_CSV);
                        setDefinitions(initialDefs);
                        await SupabaseService.saveDefinitions(initialDefs);
                    }
                }
                
                console.log('Dados carregados do Supabase');
            } catch (error) {
                console.error('Falha ao conectar Supabase:', JSON.stringify(error, null, 2));
                setSurgeries(StorageService.loadSurgeries());
                setDefinitions(StorageService.loadDefinitions());
            }
        } else {
            console.error("Supabase client failed to initialize.");
        }

        setIsLoaded(true);
    };

    initializeApp();
  }, []);

  // Sync Helper: Updates UI State and sends to Supabase
  const refreshData = async () => {
      setIsSyncing(true);
      try {
          const dbSurgeries = await SupabaseService.fetchSurgeries();
          const dbDefinitions = await SupabaseService.fetchDefinitions();
          setSurgeries(dbSurgeries);
          setDefinitions(dbDefinitions);
          StorageService.saveSurgeries(dbSurgeries);
          StorageService.saveDefinitions(dbDefinitions);
      } catch (e) {
          console.error("Sync error", e);
          alert("Erro ao sincronizar dados.");
      } finally {
          setIsSyncing(false);
      }
  };

  // --- CRUD Handlers ---

  const handleSaveSurgery = async (surgery: Surgery) => {
    let updatedSurgeries = [...surgeries];
    const index = updatedSurgeries.findIndex(s => s.id === surgery.id);
    
    if (index >= 0) {
        updatedSurgeries[index] = surgery;
    } else {
        updatedSurgeries = [surgery, ...surgeries];
    }
    
    setSurgeries(updatedSurgeries);
    setEditingSurgery(null);

    setIsSyncing(true);
    try {
        await SupabaseService.saveSurgeries([surgery]); 
        StorageService.saveSurgeries(updatedSurgeries); 
    } catch (e) {
        console.error("Save error", e);
        alert("Erro ao salvar no banco de dados.");
    } finally {
        setIsSyncing(false);
    }
  };

  const handleDeleteSurgery = async (id: string) => {
      if (!window.confirm("Confirmar exclusão?")) return;

      const updated = surgeries.filter(s => s.id !== id);
      setSurgeries(updated);

      setIsSyncing(true);
      try {
          await SupabaseService.deleteSurgery(id);
          StorageService.saveSurgeries(updated);
      } catch (e) {
          console.error("Delete error", e);
          alert("Erro ao excluir do banco de dados.");
      } finally {
          setIsSyncing(false);
      }
  };

  const handleEditClick = (surgery: Surgery) => {
      setEditingSurgery(surgery);
      setCurrentView('add_surgery');
  };

  const handleImportLogs = async (newData: Surgery[]) => {
    const updated = [...newData, ...surgeries];
    setSurgeries(updated);
    setCurrentView('dashboard');

    setIsSyncing(true);
    try {
        await SupabaseService.saveSurgeries(newData);
        StorageService.saveSurgeries(updated);
        alert(`${newData.length} registros importados com sucesso.`);
    } catch (e) {
        console.error("Import error", e);
        alert("Erro ao salvar importação no banco.");
    } finally {
        setIsSyncing(false);
    }
  };

  const handleImportDefinitions = async (newDefs: SurgeryDefinition[]) => {
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
      setCurrentView('admin');

      setIsSyncing(true);
      try {
          await SupabaseService.saveDefinitions(merged);
          StorageService.saveDefinitions(merged);
      } catch (e) {
          console.error("Def Import error", e);
      } finally {
          setIsSyncing(false);
      }
  };

  const handleTogglePayment = async (id: string) => {
    const surgeryToUpdate = surgeries.find(s => s.id === id);
    if (!surgeryToUpdate) return;

    const updatedSurgery = { ...surgeryToUpdate, isPaid: !surgeryToUpdate.isPaid };
    
    const updatedList = surgeries.map(s => s.id === id ? updatedSurgery : s);
    setSurgeries(updatedList);

    try {
        await SupabaseService.saveSurgeries([updatedSurgery]);
        StorageService.saveSurgeries(updatedList);
    } catch (e) {
        console.error("Toggle error", e);
    }
  };

  const handleUpdateDefinition = async (updated: SurgeryDefinition) => {
      const newDefs = definitions.map(d => d.id === updated.id ? updated : d);
      setDefinitions(newDefs);
      
      try {
        await SupabaseService.saveDefinitions([updated]);
        StorageService.saveDefinitions(newDefs);
      } catch(e) { console.error(e); }
  };

  const handleAddDefinition = async (newDef: SurgeryDefinition) => {
      const newDefs = [...definitions, newDef];
      setDefinitions(newDefs);
      
      try {
        await SupabaseService.saveDefinitions([newDef]);
        StorageService.saveDefinitions(newDefs);
      } catch(e) { console.error(e); }
  };

  const handleDeleteDefinition = async (id: string) => {
      if (!window.confirm("Excluir definição?")) return;
      const newDefs = definitions.filter(d => d.id !== id);
      setDefinitions(newDefs);
      
      try {
        await SupabaseService.deleteDefinition(id);
        StorageService.saveDefinitions(newDefs);
      } catch(e) { console.error(e); }
  };

  const handleUpdateBudget = (val: number) => {
      setMonthlyBudget(val);
      StorageService.saveBudget(val);
  };

  if (!user) {
    return <Login onLogin={(u) => { setUser(u); setCurrentView('dashboard'); }} />;
  }

  const getViewTitle = () => {
    switch(currentView) {
      case 'dashboard': return 'Painel de Controle';
      case 'list': return 'Lista de Cirurgias';
      case 'analytics': return 'Análises & Gráficos';
      case 'upload': return 'Importar Dados';
      case 'add_surgery': return editingSurgery ? 'Editar Cirurgia' : 'Nova Cirurgia';
      case 'admin': return 'Administração';
      case 'doctors': return 'Visão Médica';
      case 'reports': return 'Relatórios e Recebimentos';
      default: return '';
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar - Passed mobile state */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={(view) => {
            setCurrentView(view);
            if (view !== 'add_surgery') setEditingSurgery(null);
            setIsMobileMenuOpen(false); // Close menu on selection
        }} 
        user={user}
        onLogout={() => setUser(null)}
        onSync={refreshData}
        isSyncing={isSyncing}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 w-full h-screen overflow-y-auto custom-scrollbar flex flex-col">
        
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                    <Menu size={24} />
                </button>
                <h1 className="text-lg font-bold text-slate-800 truncate max-w-[200px]">{getViewTitle()}</h1>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>

        {/* Desktop Header & Content Wrapper */}
        <div className="p-4 md:p-8 flex-1">
            <header className="hidden lg:flex mb-8 justify-between items-center no-print">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 capitalize">{getViewTitle()}</h2>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Online
                </span>
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
            {currentView === 'list' && (
                <SurgeryTable 
                    surgeries={surgeries} 
                    onEdit={handleEditClick}
                    onDelete={handleDeleteSurgery}
                    isAdmin={user.isAdmin}
                />
            )}
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
                    onAdd={handleSaveSurgery} 
                    definitions={definitions}
                    onCancel={() => {
                        setCurrentView('list');
                        setEditingSurgery(null);
                    }}
                    existingSurgeries={surgeries}
                    initialData={editingSurgery}
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
        </div>
      </main>
    </div>
  );
};

export default App;