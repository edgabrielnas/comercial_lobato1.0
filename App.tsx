import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { ModuloSistema } from './types';

import FinanceiroView from './components/financeiro/FinanceiroView';
import VendasView from './components/vendas/VendasView';
import PDVView from './components/vendas/PDVView';
import OrcamentosView from './components/orcamentos/OrcamentosView';
import CRMView from './components/crm/CRMView';
import EstoqueView from './components/estoque/EstoqueView';
import ComprasView from './components/compras/ComprasView';
import PrecificacaoView from './components/precificacao/PrecificacaoView';
import RelatoriosView from './components/relatorios/RelatoriosView';
import WhatsAppView from './components/whatsapp/WhatsAppView';

function ConfiguracoesView() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Configuracoes</h1>

      <div className="bg-[#0f1f3d]/80 border border-blue-800/30 backdrop-blur-sm rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-300 mb-4">Dados da Empresa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Razao Social', value: 'Comercial Lobato Materiais de Construcao LTDA' },
            { label: 'CNPJ', value: '00.000.000/0001-00' },
            { label: 'Endereco', value: 'Rua Principal, 100 - Fortaleza/CE' },
            { label: 'Telefone', value: '(85) 3000-0000' },
            { label: 'Email', value: 'contato@comerciallobato.com.br' },
            { label: 'Site', value: 'www.comerciallobato.com.br' },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs text-gray-400 font-medium">{f.label}</label>
              <input
                className="mt-1 w-full bg-[#0f1f3d] border border-blue-900/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                defaultValue={f.value}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-blue-900/30">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Integracao Supabase</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 font-medium">Supabase URL</label>
              <input
                className="mt-1 w-full bg-[#0f1f3d] border border-blue-900/50 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="https://xxx.supabase.co"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium">Anon Key</label>
              <input
                className="mt-1 w-full bg-[#0f1f3d] border border-blue-900/50 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="eyJ..."
                type="password"
              />
            </div>
          </div>
          <button className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
            Conectar ao Supabase
          </button>
        </div>

        <div className="mt-4 flex justify-end">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
            Salvar Configuracoes
          </button>
        </div>
      </div>

      <div className="bg-[#0f1f3d]/80 border border-blue-800/30 backdrop-blur-sm rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-300 mb-4">Usuarios e Permissoes</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-blue-900/30">
              <th className="text-left py-2 text-gray-400 font-medium">Nome</th>
              <th className="text-left py-2 text-gray-400 font-medium">Email</th>
              <th className="text-left py-2 text-gray-400 font-medium">Perfil</th>
              <th className="text-left py-2 text-gray-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-900/20">
            {[
              { nome: 'Carlos Lobato',   email: 'carlos@lobato.com',   perfil: 'Administrador', ativo: true },
              { nome: 'Ana Lima',        email: 'ana@lobato.com',       perfil: 'Vendedor',      ativo: true },
              { nome: 'Pedro Santos',    email: 'pedro@lobato.com',     perfil: 'Vendedor',      ativo: true },
              { nome: 'Fernanda Rocha', email: 'fernanda@lobato.com',  perfil: 'Caixa',         ativo: true },
            ].map(u => (
              <tr key={u.email} className="hover:bg-blue-900/20 transition">
                <td className="py-2.5 font-medium text-white">{u.nome}</td>
                <td className="py-2.5 text-gray-400">{u.email}</td>
                <td className="py-2.5">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">{u.perfil}</span>
                </td>
                <td className="py-2.5">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Ativo</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="mt-3 px-4 py-2 border border-blue-600 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-600/20 transition">
          + Novo Usuario
        </button>
      </div>
    </div>
  );
}

function renderModulo(modulo: ModuloSistema) {
  switch (modulo) {
    case 'dashboard':     return <Dashboard />;
    case 'vendas':        return <VendasView />;
    case 'pdv':           return <PDVView />;
    case 'orcamentos':    return <OrcamentosView />;
    case 'crm':           return <CRMView />;
    case 'estoque':       return <EstoqueView />;
    case 'compras':       return <ComprasView />;
    case 'financeiro':    return <FinanceiroView />;
    case 'precificacao':  return <PrecificacaoView />;
    case 'relatorios':    return <RelatoriosView />;
    case 'whatsapp':      return <WhatsAppView />;
    case 'configuracoes': return <ConfiguracoesView />;
    default:              return <Dashboard />;
  }
}

export default function App() {
  const [modulo, setModulo] = useState<ModuloSistema>('dashboard');

  return (
    <div className="flex min-h-screen bg-[#070d1a]">
      <Sidebar moduloAtivo={modulo} onModuloChange={setModulo} />
      <main
        className="flex-1 transition-all duration-300 overflow-y-auto custom-scrollbar"
        style={{ marginLeft: '256px' }}
      >
        <div className="p-6 max-w-screen-2xl">
          {renderModulo(modulo)}
        </div>
      </main>
    </div>
  );
}
