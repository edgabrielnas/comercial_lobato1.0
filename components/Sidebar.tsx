import React from 'react';
import {
  LayoutDashboard, List, Upload, PlusCircle, Activity, PieChart, Shield, LogOut,
  Stethoscope, FileText, RefreshCw, X, ClipboardList, Building2, Receipt,
  TrendingUp, Bell, User, DollarSign
} from 'lucide-react';
import { ViewMode, User as UserType } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  user: UserType | null;
  onLogout: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  urgentAlerts?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, user, onLogout, onSync, isSyncing, isOpen, onClose, urgentAlerts = 0 }) => {
  const navClass = (view: ViewMode) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${currentView === view
      ? 'bg-blue-600 text-white shadow-md'
      : 'text-slate-600 hover:bg-slate-100'
    }`;

  if (!user) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed lg:static top-0 left-0 h-full w-64 bg-white border-r border-slate-200 
        flex flex-col z-40 shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out no-print
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <Activity size={28} />
              <h1 className="text-xl font-bold tracking-tight">UroScore</h1>
            </div>
            <p className="text-xs text-slate-400 pl-9">Olá, {user.name.split(' ')[0]}</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="mb-4">
            <button
              onClick={() => setCurrentView('add_surgery')}
              className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold shadow-sm transition-all active:scale-95 ${currentView === 'add_surgery' ? 'bg-blue-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
            >
              <PlusCircle size={20} />
              Novo Cadastro
            </button>
          </div>

          {/* Menu Principal original */}
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4 px-2">Cirurgias</div>

          <div className={navClass('dashboard')} onClick={() => setCurrentView('dashboard')}>
            <LayoutDashboard size={20} />
            <span className="font-medium">Painel</span>
          </div>

          <div className={navClass('doctors')} onClick={() => setCurrentView('doctors')}>
            <Stethoscope size={20} />
            <span className="font-medium">Médicos</span>
          </div>

          <div className={navClass('reports')} onClick={() => setCurrentView('reports')}>
            <FileText size={20} />
            <span className="font-medium">Relatórios</span>
          </div>

          <div className={navClass('list')} onClick={() => setCurrentView('list')}>
            <List size={20} />
            <span className="font-medium">Lista de Cirurgias</span>
          </div>
          <div className={navClass('analytics')} onClick={() => setCurrentView('analytics')}>
            <PieChart size={20} />
            <span className="font-medium">Análises</span>
          </div>

          {/* ── MÓDULOS FINANCEIROS ── */}
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6 px-2">Gestão Financeira</div>

          <div className={navClass('alerts')} onClick={() => setCurrentView('alerts')}>
            <div className="relative">
              <Bell size={20} />
              {urgentAlerts > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{urgentAlerts > 9 ? '9+' : urgentAlerts}</span>
              )}
            </div>
            <span className="font-medium">Alertas</span>
            {urgentAlerts > 0 && <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{urgentAlerts}</span>}
          </div>

          <div className={navClass('billing')} onClick={() => setCurrentView('billing')}>
            <ClipboardList size={20} />
            <span className="font-medium">Produção Médica</span>
          </div>

          <div className={navClass('insurance')} onClick={() => setCurrentView('insurance')}>
            <Building2 size={20} />
            <span className="font-medium">Convênios & Glosas</span>
          </div>

          <div className={navClass('invoices')} onClick={() => setCurrentView('invoices')}>
            <Receipt size={20} />
            <span className="font-medium">Notas Fiscais</span>
          </div>

          <div className={navClass('cashflow')} onClick={() => setCurrentView('cashflow')}>
            <TrendingUp size={20} />
            <span className="font-medium">Fluxo de Caixa</span>
          </div>

          <div className={navClass('personal')} onClick={() => setCurrentView('personal')}>
            <User size={20} />
            <span className="font-medium">Financeiro Pessoal</span>
          </div>

          {user.isAdmin && (
            <>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6 px-2">Administração</div>
              <div className={navClass('admin')} onClick={() => setCurrentView('admin')}>
                <Shield size={20} />
                <span className="font-medium">Configurações</span>
              </div>

              <div className={navClass('upload')} onClick={() => setCurrentView('upload')}>
                <Upload size={20} />
                <span className="font-medium">Importar CSV</span>
              </div>

              <div className="mt-4 px-2 space-y-2">
                <button
                  onClick={onSync}
                  disabled={isSyncing}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                >
                  <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                  {isSyncing ? 'Atualizando...' : 'Atualizar Dados'}
                </button>
              </div>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer text-slate-500 hover:bg-red-50 hover:text-red-600 w-full"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;