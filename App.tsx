import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SurgeryTable from './components/SurgeryTable';
import ImportView from './components/ImportView';
import AnalyticsView from './components/AnalyticsView';
import AddSurgeryView from './components/AddSurgeryView';
import { AdminView } from './components/AdminView';
import ReportsView from './components/ReportsView';
import Login from './components/Login';
import BillingView from './components/BillingView';
import InsuranceView from './components/InsuranceView';
import InvoicesView from './components/InvoicesView';
import CashFlowView from './components/CashFlowView';
import AlertsView from './components/AlertsView';
import PersonalFinanceView from './components/PersonalFinanceView';
import { Surgery, ViewMode, User, SurgeryDefinition, SupabaseConfig, MedicalProcedure, HealthInsurance, Gloss, InvoiceNFSe, MedicalExpense, PersonalFinance } from './types';
import { INITIAL_DEFINITIONS_CSV, parseDefinitionsCSV } from './utils/csvHelper';
import { StorageService } from './services/storageService';
import { SupabaseService } from './services/supabaseService';
import { FinanceService } from './services/financeService';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);

    // — Data State (Cirurgias) —
    const [surgeries, setSurgeries] = useState<Surgery[]>([]);
    const [definitions, setDefinitions] = useState<SurgeryDefinition[]>([]);
    const [monthlyBudget, setMonthlyBudget] = useState<number>(0);

    // — Data State (Módulos Financeiros) —
    const [procedures, setProcedures] = useState<MedicalProcedure[]>([]);
    const [insurances, setInsurances] = useState<HealthInsurance[]>([]);
    const [glosses, setGlosses] = useState<Gloss[]>([]);
    const [invoices, setInvoices] = useState<InvoiceNFSe[]>([]);
    const [expenses, setExpenses] = useState<MedicalExpense[]>([]);
    const [personalFinance, setPersonalFinance] = useState<PersonalFinance[]>([]);

    const [currentView, setCurrentView] = useState<ViewMode>('login');
    const [isLoaded, setIsLoaded] = useState(false);
    const [editingSurgery, setEditingSurgery] = useState<Surgery | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Alertas urgentes (badge na sidebar)
    const urgentAlerts = useMemo(
        () => FinanceService.generateAlerts(procedures, glosses, invoices).filter(a => a.level === 'urgent').length,
        [procedures, glosses, invoices]
    );

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        const initializeApp = async () => {
            const loadedBudget = StorageService.loadBudget();
            setMonthlyBudget(loadedBudget);

            let loadedSupabaseConfig = StorageService.loadSupabaseConfig();
            const client = SupabaseService.initialize(loadedSupabaseConfig || undefined);

            if (client) {
                try {
                    const dbSurgeries = await SupabaseService.fetchSurgeries();
                    const dbDefinitions = await SupabaseService.fetchDefinitions();

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

                    // Carregar módulos financeiros (tolerante a erro se tabelas ainda não existirem)
                    const loadFinance = async () => {
                        try {
                            const [dbProcs, dbIns, dbGlosses, dbInvoices, dbExp, dbPF] = await Promise.all([
                                FinanceService.fetchProcedures(),
                                FinanceService.fetchInsurances(),
                                FinanceService.fetchGlosses(),
                                FinanceService.fetchInvoices(),
                                FinanceService.fetchExpenses(),
                                FinanceService.fetchPersonalFinance(),
                            ]);
                            setProcedures(dbProcs);
                            setInsurances(dbIns);
                            setGlosses(dbGlosses);
                            setInvoices(dbInvoices);
                            setExpenses(dbExp);
                            setPersonalFinance(dbPF);
                        } catch (e) {
                            console.warn('Módulos financeiros ainda não configurados no banco:', e);
                        }
                    };
                    loadFinance();

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

    // ── Sync ─────────────────────────────────────────────────────────────────
    const refreshData = async () => {
        setIsSyncing(true);
        try {
            const dbSurgeries = await SupabaseService.fetchSurgeries();
            const dbDefinitions = await SupabaseService.fetchDefinitions();
            setSurgeries(dbSurgeries);
            setDefinitions(dbDefinitions);
            StorageService.saveSurgeries(dbSurgeries);
            StorageService.saveDefinitions(dbDefinitions);
            // Recarregar módulos financeiros
            const [dbProcs, dbIns, dbGlosses, dbInvoices, dbExp, dbPF] = await Promise.all([
                FinanceService.fetchProcedures(),
                FinanceService.fetchInsurances(),
                FinanceService.fetchGlosses(),
                FinanceService.fetchInvoices(),
                FinanceService.fetchExpenses(),
                FinanceService.fetchPersonalFinance(),
            ]);
            setProcedures(dbProcs);
            setInsurances(dbIns);
            setGlosses(dbGlosses);
            setInvoices(dbInvoices);
            setExpenses(dbExp);
            setPersonalFinance(dbPF);
        } catch (e) {
            console.error("Sync error", e);
            alert("Erro ao sincronizar dados.");
        } finally {
            setIsSyncing(false);
        }
    };

    // ── Handlers Cirurgias ────────────────────────────────────────────────────
    const handleSaveSurgery = async (surgery: Surgery) => {
        let updatedSurgeries = [...surgeries];
        const index = updatedSurgeries.findIndex(s => s.id === surgery.id);
        if (index >= 0) { updatedSurgeries[index] = surgery; }
        else { updatedSurgeries = [surgery, ...surgeries]; }
        setSurgeries(updatedSurgeries);
        setEditingSurgery(null);
        setIsSyncing(true);
        try {
            await SupabaseService.saveSurgeries([surgery]);
            StorageService.saveSurgeries(updatedSurgeries);
        } catch (e) { console.error("Save error", e); alert("Erro ao salvar no banco de dados."); }
        finally { setIsSyncing(false); }
    };

    const handleDeleteSurgery = async (id: string) => {
        if (!window.confirm("Confirmar exclusão?")) return;
        const updated = surgeries.filter(s => s.id !== id);
        setSurgeries(updated);
        setIsSyncing(true);
        try {
            await SupabaseService.deleteSurgery(id);
            StorageService.saveSurgeries(updated);
        } catch (e) { console.error("Delete error", e); }
        finally { setIsSyncing(false); }
    };

    const handleEditClick = (surgery: Surgery) => { setEditingSurgery(surgery); setCurrentView('add_surgery'); };

    const handleImportLogs = async (newData: Surgery[]) => {
        // Filtrar registros com data inválida antes de enviar
        const validData = newData.filter(s => {
            if (!s.date) return false;
            const d = new Date(s.date);
            return !isNaN(d.getTime());
        });
        const invalidCount = newData.length - validData.length;

        if (validData.length === 0) {
            alert('Nenhum registro válido encontrado. Verifique se as datas estão no formato DD/MM/AAAA ou AAAA-MM-DD.');
            return;
        }

        const updated = [...validData, ...surgeries];
        setSurgeries(updated);
        setCurrentView('list');
        setIsSyncing(true);
        try {
            await SupabaseService.saveSurgeries(validData);
            StorageService.saveSurgeries(updated);
            const msg = invalidCount > 0
                ? `✅ ${validData.length} registros importados.\n⚠️ ${invalidCount} registros ignorados (data inválida).`
                : `✅ ${validData.length} registros importados com sucesso!`;
            alert(msg);
        } catch (e: any) {
            console.error('Import error:', e);
            // Mesmo com erro no banco, os dados já estão em memória
            alert(`Os dados foram carregados em memória, mas houve um erro ao salvar no banco:\n${e?.message || JSON.stringify(e)}\n\nVerifique o console para detalhes.`);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleImportDefinitions = async (newDefs: SurgeryDefinition[]) => {
        const merged = [...definitions];
        newDefs.forEach(nd => {
            const idx = merged.findIndex(md => md.name === nd.name);
            if (idx >= 0) { merged[idx] = nd; } else { merged.push(nd); }
        });
        setDefinitions(merged);
        setCurrentView('admin');
        setIsSyncing(true);
        try {
            await SupabaseService.saveDefinitions(merged);
            StorageService.saveDefinitions(merged);
        } catch (e) { console.error("Def Import error", e); }
        finally { setIsSyncing(false); }
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
        } catch (e) { console.error("Toggle error", e); }
    };

    const handleUpdateDefinition = async (updated: SurgeryDefinition) => {
        const newDefs = definitions.map(d => d.id === updated.id ? updated : d);
        setDefinitions(newDefs);
        try { await SupabaseService.saveDefinitions([updated]); StorageService.saveDefinitions(newDefs); }
        catch (e) { console.error(e); }
    };

    const handleAddDefinition = async (newDef: SurgeryDefinition) => {
        const newDefs = [...definitions, newDef];
        setDefinitions(newDefs);
        try { await SupabaseService.saveDefinitions([newDef]); StorageService.saveDefinitions(newDefs); }
        catch (e) { console.error(e); }
    };

    const handleDeleteDefinition = async (id: string) => {
        if (!window.confirm("Excluir definição?")) return;
        const newDefs = definitions.filter(d => d.id !== id);
        setDefinitions(newDefs);
        try { await SupabaseService.deleteDefinition(id); StorageService.saveDefinitions(newDefs); }
        catch (e) { console.error(e); }
    };

    const handleUpdateBudget = (val: number) => { setMonthlyBudget(val); StorageService.saveBudget(val); };

    // ── Handlers Módulos Financeiros ──────────────────────────────────────────

    const handleSaveProcedure = async (p: MedicalProcedure) => {
        const updated = procedures.some(x => x.id === p.id)
            ? procedures.map(x => x.id === p.id ? p : x)
            : [p, ...procedures];
        setProcedures(updated);
        try { await FinanceService.saveProcedure(p); } catch (e) { console.warn('Supabase finance save:', e); }
    };

    const handleDeleteProcedure = async (id: string) => {
        setProcedures(prev => prev.filter(p => p.id !== id));
        try { await FinanceService.deleteProcedure(id); } catch (e) { console.warn(e); }
    };

    const handleSaveInsurance = async (ins: HealthInsurance) => {
        const updated = insurances.some(x => x.id === ins.id)
            ? insurances.map(x => x.id === ins.id ? ins : x)
            : [ins, ...insurances];
        setInsurances(updated);
        try { await FinanceService.saveInsurance(ins); } catch (e) { console.warn(e); }
    };

    const handleSaveGloss = async (g: Gloss) => {
        const updated = glosses.some(x => x.id === g.id)
            ? glosses.map(x => x.id === g.id ? g : x)
            : [g, ...glosses];
        setGlosses(updated);
        try { await FinanceService.saveGloss(g); } catch (e) { console.warn(e); }
    };

    const handleDeleteGloss = async (id: string) => {
        setGlosses(prev => prev.filter(g => g.id !== id));
        try { await FinanceService.deleteGloss(id); } catch (e) { console.warn(e); }
    };

    const handleSaveInvoice = async (inv: InvoiceNFSe) => {
        const updated = invoices.some(x => x.id === inv.id)
            ? invoices.map(x => x.id === inv.id ? inv : x)
            : [inv, ...invoices];
        setInvoices(updated);
        try { await FinanceService.saveInvoice(inv); } catch (e) { console.warn(e); }
    };

    const handleDeleteInvoice = async (id: string) => {
        setInvoices(prev => prev.filter(i => i.id !== id));
        try { await FinanceService.deleteInvoice(id); } catch (e) { console.warn(e); }
    };

    const handleSaveExpense = async (exp: MedicalExpense) => {
        const updated = expenses.some(x => x.id === exp.id)
            ? expenses.map(x => x.id === exp.id ? exp : x)
            : [exp, ...expenses];
        setExpenses(updated);
        try { await FinanceService.saveExpense(exp); } catch (e) { console.warn(e); }
    };

    const handleDeleteExpense = async (id: string) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
        try { await FinanceService.deleteExpense(id); } catch (e) { console.warn(e); }
    };

    const handleSavePersonalFinance = async (pf: PersonalFinance) => {
        const updated = personalFinance.some(x => x.id === pf.id)
            ? personalFinance.map(x => x.id === pf.id ? pf : x)
            : [pf, ...personalFinance];
        setPersonalFinance(updated);
        try { await FinanceService.savePersonalFinance(pf); } catch (e) { console.warn(e); }
    };

    if (!user) {
        return <Login onLogin={(u) => { setUser(u); setCurrentView('dashboard'); }} />;
    }

    const getViewTitle = () => {
        switch (currentView) {
            case 'dashboard': return 'Painel de Controle';
            case 'list': return 'Lista de Cirurgias';
            case 'analytics': return 'Análises & Gráficos';
            case 'upload': return 'Importar Dados';
            case 'add_surgery': return editingSurgery ? 'Editar Cirurgia' : 'Nova Cirurgia';
            case 'admin': return 'Administração';
            case 'doctors': return 'Visão Médica';
            case 'reports': return 'Relatórios e Recebimentos';
            case 'billing': return 'Produção Médica';
            case 'insurance': return 'Convênios & Glosas';
            case 'invoices': return 'Notas Fiscais (NFS-e)';
            case 'cashflow': return 'Fluxo de Caixa';
            case 'alerts': return 'Alertas & Pendências';
            case 'personal': return 'Financeiro Pessoal';
            default: return '';
        }
    };

    if (!isLoaded) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            <Sidebar
                currentView={currentView}
                setCurrentView={(view) => {
                    setCurrentView(view);
                    if (view !== 'add_surgery') setEditingSurgery(null);
                    setIsMobileMenuOpen(false);
                }}
                user={user}
                onLogout={() => setUser(null)}
                onSync={refreshData}
                isSyncing={isSyncing}
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                urgentAlerts={urgentAlerts}
            />

            <main className="flex-1 lg:ml-64 w-full h-screen overflow-y-auto custom-scrollbar flex flex-col">

                {/* Mobile Header */}
                <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                            <Menu size={24} />
                        </button>
                        <h1 className="text-lg font-bold text-slate-800 truncate max-w-[200px]">{getViewTitle()}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {urgentAlerts > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{urgentAlerts} alertas</span>}
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                </div>

                {/* Desktop Header & Content */}
                <div className="p-4 md:p-8 flex-1">
                    <header className="hidden lg:flex mb-8 justify-between items-center no-print">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 capitalize">{getViewTitle()}</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            {urgentAlerts > 0 && (
                                <button onClick={() => setCurrentView('alerts')} className="flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold animate-pulse hover:animate-none hover:bg-red-600 transition-colors">
                                    🔴 {urgentAlerts} alerta{urgentAlerts > 1 ? 's' : ''} urgente{urgentAlerts > 1 ? 's' : ''}
                                </button>
                            )}
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Online
                            </span>
                            <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                                Hoje: {new Date().toLocaleDateString('pt-BR')}
                            </div>
                        </div>
                    </header>

                    {/* Views originais */}
                    {(currentView === 'dashboard' || currentView === 'doctors') && (
                        <Dashboard surgeries={surgeries} monthlyBudget={monthlyBudget} />
                    )}
                    {currentView === 'list' && (
                        <SurgeryTable surgeries={surgeries} onEdit={handleEditClick} onDelete={handleDeleteSurgery} isAdmin={user.isAdmin} />
                    )}
                    {currentView === 'analytics' && <AnalyticsView surgeries={surgeries} />}
                    {currentView === 'reports' && (
                        <ReportsView surgeries={surgeries} monthlyBudget={monthlyBudget} onTogglePayment={handleTogglePayment} />
                    )}
                    {currentView === 'add_surgery' && (
                        <AddSurgeryView onAdd={handleSaveSurgery} definitions={definitions} onCancel={() => { setCurrentView('list'); setEditingSurgery(null); }} existingSurgeries={surgeries} initialData={editingSurgery} />
                    )}
                    {currentView === 'upload' && (
                        <ImportView onImportLogs={handleImportLogs} onImportDefinitions={handleImportDefinitions} existingDefinitions={definitions} onCancel={() => setCurrentView('dashboard')} />
                    )}
                    {currentView === 'admin' && user.isAdmin && (
                        <AdminView definitions={definitions} onUpdateDefinition={handleUpdateDefinition} onAddDefinition={handleAddDefinition} onDeleteDefinition={handleDeleteDefinition} monthlyBudget={monthlyBudget} onUpdateBudget={handleUpdateBudget} />
                    )}
                    {currentView === 'admin' && !user.isAdmin && (
                        <div className="p-8 text-center text-slate-500">Acesso negado. Contate o administrador.</div>
                    )}

                    {/* ── Views dos Módulos Financeiros ── */}
                    {currentView === 'billing' && (
                        <BillingView procedures={procedures} onSave={handleSaveProcedure} onDelete={handleDeleteProcedure} />
                    )}
                    {currentView === 'insurance' && (
                        <InsuranceView insurances={insurances} glosses={glosses} onSaveInsurance={handleSaveInsurance} onSaveGloss={handleSaveGloss} onDeleteGloss={handleDeleteGloss} />
                    )}
                    {currentView === 'invoices' && (
                        <InvoicesView invoices={invoices} procedures={procedures} onSave={handleSaveInvoice} onDelete={handleDeleteInvoice} />
                    )}
                    {currentView === 'cashflow' && (
                        <CashFlowView procedures={procedures} expenses={expenses} onSaveExpense={handleSaveExpense} onDeleteExpense={handleDeleteExpense} />
                    )}
                    {currentView === 'alerts' && (
                        <AlertsView procedures={procedures} glosses={glosses} invoices={invoices} />
                    )}
                    {currentView === 'personal' && (
                        <PersonalFinanceView personalFinance={personalFinance} onSave={handleSavePersonalFinance} />
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;