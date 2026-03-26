import React, { useState } from 'react';
import {
  LayoutDashboard, ShoppingCart, FileText, Users, Package,
  Truck, DollarSign, Tag, BarChart2, Settings, ChevronLeft,
  ChevronRight, Store, TrendingUp, CreditCard, Boxes
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
  color: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard',     label: 'Dashboard',      icon: <LayoutDashboard size={20} />, color: 'text-blue-400' },
  { id: 'vendas',        label: 'Vendas',          icon: <ShoppingCart size={20} />,   color: 'text-green-400' },
  { id: 'pdv',           label: 'PDV / Caixa',     icon: <CreditCard size={20} />,     color: 'text-emerald-400' },
  { id: 'orcamentos',    label: 'Orçamentos',      icon: <FileText size={20} />,       color: 'text-yellow-400' },
  { id: 'crm',           label: 'CRM / Clientes',  icon: <Users size={20} />,          color: 'text-purple-400' },
  { id: 'estoque',       label: 'Estoque',         icon: <Boxes size={20} />,          color: 'text-orange-400' },
  { id: 'compras',       label: 'Compras',         icon: <Truck size={20} />,          color: 'text-cyan-400' },
  { id: 'financeiro',    label: 'Financeiro',      icon: <DollarSign size={20} />,     color: 'text-rose-400' },
  { id: 'precificacao',  label: 'Precificação',    icon: <Tag size={20} />,            color: 'text-indigo-400' },
  { id: 'relatorios',    label: 'Relatórios',      icon: <BarChart2 size={20} />,      color: 'text-teal-400' },
  { id: 'configuracoes', label: 'Configurações',   icon: <Settings size={20} />,       color: 'text-slate-400' },
];

export default function Sidebar({ moduloAtivo, onModuloChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`sidebar-container flex flex-col bg-slate-900 text-white transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } min-h-screen fixed left-0 top-0 z-50 shadow-xl`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
              <Store size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Comercial</p>
              <p className="text-xs font-bold text-orange-400 leading-tight">LOBATO</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center mx-auto">
            <Store size={18} className="text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-800">
          <p className="text-xs text-slate-400">Bem-vindo,</p>
          <p className="text-sm font-semibold text-white">Carlos Lobato</p>
          <span className="text-xs text-orange-400">Administrador</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = moduloAtivo === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onModuloChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 relative group
                ${isActive
                  ? 'bg-orange-500 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-orange-300 rounded-r" />
              )}
              <span className={isActive ? 'text-white' : item.color}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700 p-4">
        {!collapsed ? (
          <div className="text-xs text-slate-500 text-center">
            <p>v1.0.0 • 40 Anos de Tradição</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <TrendingUp size={16} className="text-slate-500" />
          </div>
        )}
      </div>
    </aside>
  );
}
