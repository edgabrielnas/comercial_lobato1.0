
import React from 'react';
import { LayoutDashboard, List, Upload, PlusCircle, Activity, PieChart, Shield, LogOut, Stethoscope, FileText, RefreshCw, DollarSign } from 'lucide-react';
import { ViewMode, User } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  user: User | null;
  onLogout: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, user, onLogout, onSync, isSyncing }) => {
  const navClass = (view: ViewMode) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
      currentView === view
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-slate-600 hover:bg-slate-100'
    }`;

  if (!user) return null;

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 flex flex-col z-10 shadow-sm no-print">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2 text-blue-700 mb-1">
          <Activity size={28} />
          <h1 className="text-xl font-bold tracking-tight">UroScore</h1>
        </div>
        <p className="text-xs text-slate-400 pl-9">Olá, {user.name.split(' ')[0]}</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="mb-4">
            <button
            onClick={() => setCurrentView('add_surgery')}
            className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold shadow-sm transition-all active:scale-95 ${currentView === 'add_surgery' ? 'bg-blue-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
            >
            <PlusCircle size={20} />
            Novo Cadastro
            </button>
        </div>

        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6 px-2">Menu Principal</div>
        
        <div
          className={navClass('dashboard')}
          onClick={() => setCurrentView('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span className="font-medium">Painel Financeiro</span>
        </div>

        <div
          className={navClass('payments')}
          onClick={() => setCurrentView('payments')}
        >
          <DollarSign size={20} />
          <span className="font-medium">Pagamentos</span>
        </div>
        
        <div
          className={navClass('doctors')}
          onClick={() => setCurrentView('doctors')}
        >
          <Stethoscope size={20} />
          <span className="font-medium">Médicos</span>
        </div>

        <div
          className={navClass('reports')}
          onClick={() => setCurrentView('reports')}
        >
          <FileText size={20} />
          <span className="font-medium">Relatórios & Recebimentos</span>
        </div>

        <div
          className={navClass('list')}
          onClick={() => setCurrentView('list')}
        >
          <List size={20} />
          <span className="font-medium">Lista de Cirurgias</span>
        </div>
        <div
          className={navClass('analytics')}
          onClick={() => setCurrentView('analytics')}
        >
          <PieChart size={20} />
          <span className="font-medium">Análises</span>
        </div>

        {user.isAdmin && (
          <>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6 px-2">Administração</div>
            <div
              className={navClass('admin')}
              onClick={() => setCurrentView('admin')}
            >
              <Shield size={20} />
              <span className="font-medium">Configurações</span>
            </div>

            <div
              className={navClass('upload')}
              onClick={() => setCurrentView('upload')}
            >
              <Upload size={20} />
              <span className="font-medium">Importar CSV</span>
            </div>
            
            {/* Sync Actions */}
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
  );
};

export default Sidebar;
