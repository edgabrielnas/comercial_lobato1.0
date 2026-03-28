import React, { useState } from 'react';
import {
  LayoutDashboard, ShoppingCart, FileText, Users, Package,
  Truck, DollarSign, TrendingUp, BarChart2, Settings,
  ChevronLeft, ChevronRight, Monitor, MessageSquare
} from 'lucide-react';
import { ModuloSistema } from '../types';

interface SidebarProps {
  moduloAtivo: ModuloSistema;
  onModuloChange: (modulo: ModuloSistema) => void;
}

interface NavItem {
  id: ModuloSistema;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'COMERCIAL',
    items: [
      { id: 'dashboard',    label: 'Dashboard',      icon: <LayoutDashboard size={18} /> },
      { id: 'vendas',       label: 'Vendas',          icon: <ShoppingCart size={18} /> },
      { id: 'pdv',          label: 'PDV / Caixa',     icon: <Monitor size={18} /> },
      { id: 'orcamentos',   label: 'Orcamentos',      icon: <FileText size={18} /> },
    ],
  },
  {
    label: 'GESTAO',
    items: [
      { id: 'crm',          label: 'CRM',             icon: <Users size={18} /> },
      { id: 'estoque',      label: 'Estoque',         icon: <Package size={18} /> },
      { id: 'compras',      label: 'Compras',         icon: <Truck size={18} /> },
    ],
  },
  {
    label: 'FINANCEIRO',
    items: [
      { id: 'financeiro',   label: 'Financeiro',      icon: <DollarSign size={18} /> },
      { id: 'precificacao', label: 'Precificacao',    icon: <TrendingUp size={18} /> },
    ],
  },
  {
    label: 'INTELIGENCIA',
    items: [
      { id: 'whatsapp',     label: 'WhatsApp Auto',   icon: <MessageSquare size={18} />, badge: 'NOVO' },
      { id: 'relatorios',   label: 'Relatorios & BI', icon: <BarChart2 size={18} /> },
    ],
  },
  {
    label: 'SISTEMA',
    items: [
      { id: 'configuracoes', label: 'Configuracoes',  icon: <Settings size={18} /> },
    ],
  },
];

export default function Sidebar({ moduloAtivo, onModuloChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col bg-[#0a1628] border-r border-blue-900/40 text-white transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } min-h-screen fixed left-0 top-0 z-50`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-blue-900/40">
        {!collapsed && (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
              Comercial / LOBATO
            </span>
            <span className="inline-block w-fit px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-semibold rounded">
              ERP v2.0
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center mx-auto">
            <span className="text-xs font-bold text-blue-400">CL</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-blue-400 transition-colors ml-auto flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-blue-900/40">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">CL</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white leading-tight truncate">Carlos Lobato</p>
            <p className="text-xs text-gray-400 leading-tight">Administrador</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {navGroups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-2' : ''}>
            {!collapsed && (
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold tracking-widest text-blue-900/80 uppercase">
                {group.label}
              </p>
            )}
            {collapsed && gi > 0 && (
              <div className="mx-3 my-1 border-t border-blue-900/40" />
            )}
            {group.items.map((item) => {
              const isActive = moduloAtivo === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onModuloChange(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`relative w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 group
                    ${isActive
                      ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-400'
                      : 'text-gray-400 border-l-2 border-transparent hover:bg-blue-900/30 hover:text-blue-300'
                    }`}
                >
                  <span className={isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-300'}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="flex-1 truncate text-left">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="px-1.5 py-0.5 bg-cyan-400/20 text-cyan-400 text-[9px] font-bold rounded leading-none">
                      {item.badge}
                    </span>
                  )}
                  {collapsed && (
                    <span className="absolute left-full ml-2 px-2 py-1 bg-[#0a1628] border border-blue-800/40 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                      {item.label}
                      {item.badge && (
                        <span className="ml-1 px-1 bg-cyan-400/20 text-cyan-400 text-[9px] font-bold rounded">
                          {item.badge}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-blue-900/40 px-4 py-3">
        {!collapsed ? (
          <p className="text-[10px] text-blue-900 text-center font-medium">
            v2.0 &bull; 40 Anos de Tradicao
          </p>
        ) : (
          <div className="flex justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-900" />
          </div>
        )}
      </div>
    </aside>
  );
}
