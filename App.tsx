import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { ModuloSistema } from './types';

// Lazy imports — each module is a separate chunk
import FinanceiroView from './components/financeiro/FinanceiroView';
import VendasView from './components/vendas/VendasView';
import PDVView from './components/vendas/PDVView';
import OrcamentosView from './components/orcamentos/OrcamentosView';
import CRMView from './components/crm/CRMView';
import EstoqueView from './components/estoque/EstoqueView';
import ComprasView from './components/compras/ComprasView';
import PrecificacaoView from './components/precificacao/PrecificacaoView';
import RelatoriosView from './components/relatorios/RelatoriosView';

function ConfiguracoesView() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Configurações</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Dados da Empresa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Razão Social', value: 'Comercial Lobato Materiais de Construção LTDA' },
            { label: 'CNPJ', value: '00.000.000/0001-00' },
            { label: 'Endereço', value: 'Rua Principal, 100 - Fortaleza/CE' },
            { label: 'Telefone', value: '(85) 3000-0000' },
            { label: 'Email', value: 'contato@comerciallobato.com.br' },
            { label: 'Site', value: 'www.comerciallobato.com.br' },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs text-slate-500 font-medium">{f.label}</label>
              <input
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50"
                defaultValue={f.value}
              />
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Integração Supabase</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 font-medium">Supabase URL</label>
              <input className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono" placeholder="https://xxx.supabase.co" />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium">Anon Key</label>
              <input className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono" placeholder="eyJ..." type="password" />
            </div>
          </div>
          <button className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
            Conectar ao Supabase
          </button>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">
            Salvar Configurações
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Usuários e Permissões</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 text-slate-500 font-medium">Nome</th>
              <th className="text-left py-2 text-slate-500 font-medium">Email</th>
              <th className="text-left py-2 text-slate-500 font-medium">Perfil</th>
              <th className="text-left py-2 text-slate-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {[
              { nome:'Carlos Lobato', email:'carlos@lobato.com', perfil:'Administrador', ativo:true },
              { nome:'Ana Lima', email:'ana@lobato.com', perfil:'Vendedor', ativo:true },
              { nome:'Pedro Santos', email:'pedro@lobato.com', perfil:'Vendedor', ativo:true },
              { nome:'Fernanda Rocha', email:'fernanda@lobato.com', perfil:'Caixa', ativo:true },
            ].map(u => (
              <tr key={u.email} className="hover:bg-slate-50">
                <td className="py-2 font-medium text-slate-800">{u.nome}</td>
                <td className="py-2 text-slate-500">{u.email}</td>
                <td className="py-2"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{u.perfil}</span></td>
                <td className="py-2"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">Ativo</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="mt-3 px-4 py-2 border border-orange-500 text-orange-500 rounded-lg text-sm font-medium hover:bg-orange-50">
          + Novo Usuário
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
    case 'configuracoes': return <ConfiguracoesView />;
    default:              return <Dashboard />;
  }
}

export default function App() {
  const [modulo, setModulo] = useState<ModuloSistema>('dashboard');

  return (
    <div className="flex min-h-screen bg-slate-50">
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
