import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, Plus,
  CheckCircle, XCircle, Clock, Filter, X, FileText
} from 'lucide-react';
import { ContaPagar, ContaReceber, StatusConta } from '../../types';
import {
  mockContasPagar, mockContasReceber, dadosFluxoCaixa
} from '../../data/mockData';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const statusBadge: Record<StatusConta, string> = {
  aberto:    'bg-yellow-100 text-yellow-700',
  pago:      'bg-green-100 text-green-700',
  vencido:   'bg-red-100 text-red-700',
  cancelado: 'bg-gray-100 text-gray-500',
  parcial:   'bg-blue-100 text-blue-700',
};

const statusLabel: Record<StatusConta, string> = {
  aberto: 'Aberto', pago: 'Pago', vencido: 'Vencido', cancelado: 'Cancelado', parcial: 'Parcial'
};

type Tab = 'pagar' | 'receber' | 'fluxo' | 'dre';

interface NovaContaForm {
  descricao: string;
  valor: string;
  vencimento: string;
  tipo: 'pagar' | 'receber';
  fornecedor: string;
}

export default function FinanceiroView() {
  const [tab, setTab] = useState<Tab>('pagar');
  const [filterPagar, setFilterPagar] = useState<string>('todos');
  const [filterReceber, setFilterReceber] = useState<string>('todos');
  const [showModal, setShowModal] = useState(false);
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>(mockContasPagar);
  const [contasReceber] = useState<ContaReceber[]>(mockContasReceber);
  const [form, setForm] = useState<NovaContaForm>({ descricao: '', valor: '', vencimento: '', tipo: 'pagar', fornecedor: '' });

  const filteredPagar = filterPagar === 'todos'
    ? contasPagar
    : contasPagar.filter(c => c.status === filterPagar);

  const filteredReceber = filterReceber === 'todos'
    ? contasReceber
    : contasReceber.filter(c => c.status === filterReceber);

  const totalAbertoPagar = contasPagar.filter(c => c.status === 'aberto').reduce((s, c) => s + c.valor, 0);
  const totalVencidoPagar = contasPagar.filter(c => c.status === 'vencido').reduce((s, c) => s + c.valor, 0);
  const totalPagoMes = contasPagar.filter(c => c.status === 'pago').reduce((s, c) => s + c.valor, 0);

  const totalAbertoReceber = contasReceber.filter(c => c.status === 'aberto').reduce((s, c) => s + c.valor, 0);
  const totalRecebidoMes = contasReceber.filter(c => c.status === 'pago').reduce((s, c) => s + (c.valorRecebido ?? c.valor), 0);
  const totalEmAtrasoCR = contasReceber.filter(c => c.status === 'vencido').reduce((s, c) => s + c.valor, 0);

  const marcarPago = (id: string) => {
    setContasPagar(prev => prev.map(c =>
      c.id === id ? { ...c, status: 'pago' as StatusConta, dataPagamento: new Date().toISOString().split('T')[0] } : c
    ));
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pagar',   label: 'Contas a Pagar' },
    { key: 'receber', label: 'Contas a Receber' },
    { key: 'fluxo',   label: 'Fluxo de Caixa' },
    { key: 'dre',     label: 'DRE' },
  ];

  const dreData = [
    { descricao: 'Receita Bruta de Vendas', valor: 82600, tipo: 'receita' },
    { descricao: '(-) Devoluções e Descontos', valor: -1200, tipo: 'deducao' },
    { descricao: '(-) Impostos sobre Vendas (SIMPLES ~4.8%)', valor: -3965, tipo: 'deducao' },
    { descricao: '= Receita Líquida', valor: 77435, tipo: 'total' },
    { descricao: '(-) Custo das Mercadorias Vendidas (CMV)', valor: -56800, tipo: 'deducao' },
    { descricao: '= Lucro Bruto', valor: 20635, tipo: 'total' },
    { descricao: '(-) Despesas com Vendas', valor: -3200, tipo: 'deducao' },
    { descricao: '(-) Despesas Administrativas', valor: -5800, tipo: 'deducao' },
    { descricao: '(-) Aluguel', valor: -8500, tipo: 'deducao' },
    { descricao: '(-) Folha de Pagamento', valor: -22800, tipo: 'deducao' },
    { descricao: '(-) Utilidades (Energia, Telefone)', valor: -2500, tipo: 'deducao' },
    { descricao: '= EBITDA', valor: -22165, tipo: 'total' },
    { descricao: '(-) Depreciação e Amortização', valor: -1200, tipo: 'deducao' },
    { descricao: '= EBIT', valor: -23365, tipo: 'total' },
    { descricao: '(-) Despesas Financeiras', valor: -850, tipo: 'deducao' },
    { descricao: '(+) Receitas Financeiras', valor: 320, tipo: 'receita' },
    { descricao: '= Lucro Líquido', valor: -23895, tipo: 'resultado' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
          <p className="font-semibold text-gray-700 mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }}>{p.name}: {fmt(p.value)}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestão financeira completa</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium"
        >
          <Plus size={16} />
          Nova Conta
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6 w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.key ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contas a Pagar */}
      {tab === 'pagar' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} className="text-yellow-500" />
                <span className="text-xs text-gray-500 font-medium">Em Aberto</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{fmt(totalAbertoPagar)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={16} className="text-red-500" />
                <span className="text-xs text-gray-500 font-medium">Vencidas</span>
              </div>
              <p className="text-xl font-bold text-red-600">{fmt(totalVencidoPagar)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-xs text-gray-500 font-medium">Pagas no Mês</span>
              </div>
              <p className="text-xl font-bold text-green-600">{fmt(totalPagoMes)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Contas a Pagar</h2>
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-gray-400" />
                <select
                  value={filterPagar}
                  onChange={e => setFilterPagar(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  <option value="todos">Todos</option>
                  <option value="aberto">Aberto</option>
                  <option value="pago">Pago</option>
                  <option value="vencido">Vencido</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Descrição', 'Fornecedor', 'Tipo', 'Valor', 'Vencimento', 'Status', 'Ações'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-2 pr-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredPagar.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 pr-3 text-gray-700 font-medium max-w-[200px] truncate">{c.descricao}</td>
                      <td className="py-3 pr-3 text-gray-500 text-xs">{c.fornecedor || '—'}</td>
                      <td className="py-3 pr-3 text-gray-500 text-xs capitalize">{c.tipo}</td>
                      <td className="py-3 pr-3 font-semibold text-gray-800">{fmt(c.valor)}</td>
                      <td className="py-3 pr-3 text-gray-500 text-xs">{new Date(c.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                      <td className="py-3 pr-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[c.status]}`}>
                          {statusLabel[c.status]}
                        </span>
                      </td>
                      <td className="py-3">
                        {c.status !== 'pago' && (
                          <button
                            onClick={() => marcarPago(c.id)}
                            className="text-xs text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
                          >
                            <CheckCircle size={12} />
                            Pagar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Contas a Receber */}
      {tab === 'receber' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-blue-500" />
                <span className="text-xs text-gray-500 font-medium">A Receber</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{fmt(totalAbertoReceber)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-xs text-gray-500 font-medium">Recebido no Mês</span>
              </div>
              <p className="text-xl font-bold text-green-600">{fmt(totalRecebidoMes)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={16} className="text-red-500" />
                <span className="text-xs text-gray-500 font-medium">Em Atraso</span>
              </div>
              <p className="text-xl font-bold text-red-600">{fmt(totalEmAtrasoCR)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Contas a Receber</h2>
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-gray-400" />
                <select
                  value={filterReceber}
                  onChange={e => setFilterReceber(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  <option value="todos">Todos</option>
                  <option value="aberto">Aberto</option>
                  <option value="pago">Pago</option>
                  <option value="vencido">Vencido</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Descrição', 'Cliente', 'Parcela', 'Valor', 'Vencimento', 'Status'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-2 pr-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredReceber.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 pr-3 text-gray-700 font-medium max-w-[200px] truncate">{c.descricao}</td>
                      <td className="py-3 pr-3 text-gray-500 text-xs">{c.cliente || '—'}</td>
                      <td className="py-3 pr-3 text-gray-500 text-xs">{c.parcela || '—'}</td>
                      <td className="py-3 pr-3 font-semibold text-gray-800">{fmt(c.valor)}</td>
                      <td className="py-3 pr-3 text-gray-500 text-xs">{new Date(c.dataVencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[c.status]}`}>
                          {statusLabel[c.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Fluxo de Caixa */}
      {tab === 'fluxo' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Fluxo de Caixa — Março 2026</h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dadosFluxoCaixa}>
                <defs>
                  <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gSaldo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="entradas" name="Entradas" stroke="#22c55e" fill="url(#gE)" strokeWidth={2} />
                <Area type="monotone" dataKey="saidas" name="Saídas" stroke="#ef4444" fill="url(#gS)" strokeWidth={2} />
                <Area type="monotone" dataKey="saldo" name="Saldo Acumulado" stroke="#f97316" fill="url(#gSaldo)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Resumo por Período</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Data', 'Entradas', 'Saídas', 'Saldo do Dia', 'Saldo Acumulado'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dadosFluxoCaixa.map((d, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-2.5 pr-4 text-gray-600 font-medium">{d.dia}</td>
                    <td className="py-2.5 pr-4 text-green-600 font-medium">{fmt(d.entradas)}</td>
                    <td className="py-2.5 pr-4 text-red-500 font-medium">{fmt(d.saidas)}</td>
                    <td className={`py-2.5 pr-4 font-medium ${d.entradas - d.saidas >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {fmt(d.entradas - d.saidas)}
                    </td>
                    <td className="py-2.5 text-orange-500 font-bold">{fmt(d.saldo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DRE */}
      {tab === 'dre' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">Demonstração do Resultado do Exercício</h2>
              <p className="text-xs text-gray-400 mt-0.5">Março/2026 — Comercial Lobato</p>
            </div>
            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5">
              <FileText size={14} />
              Imprimir
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 pb-3">Descrição</th>
                <th className="text-right text-xs font-semibold text-gray-500 pb-3">Março/2026</th>
                <th className="text-right text-xs font-semibold text-gray-500 pb-3">% Receita</th>
              </tr>
            </thead>
            <tbody>
              {dreData.map((row, i) => {
                const isTotal = row.tipo === 'total' || row.tipo === 'resultado';
                const isResult = row.tipo === 'resultado';
                const pct = ((row.valor / 82600) * 100).toFixed(1);
                return (
                  <tr key={i} className={`border-b border-gray-50 ${isTotal ? 'bg-gray-50' : ''}`}>
                    <td className={`py-2.5 pl-${row.tipo === 'deducao' ? '4' : '0'} ${isResult ? 'font-bold text-gray-900' : isTotal ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                      {row.descricao}
                    </td>
                    <td className={`py-2.5 text-right font-${isTotal || isResult ? 'bold' : 'medium'} ${
                      isResult ? (row.valor >= 0 ? 'text-green-600' : 'text-red-600') :
                      row.valor < 0 ? 'text-red-500' : 'text-gray-700'
                    }`}>
                      {fmt(row.valor)}
                    </td>
                    <td className="py-2.5 text-right text-xs text-gray-400">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nova Conta */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Nova Conta</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                <div className="flex gap-2">
                  {(['pagar', 'receber'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setForm(f => ({ ...f, tipo: t }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                        form.tipo === t ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {t === 'pagar' ? 'A Pagar' : 'A Receber'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
                <input
                  type="text"
                  value={form.descricao}
                  onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="Ex: Fornecedor XYZ - NF 12345"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{form.tipo === 'pagar' ? 'Fornecedor' : 'Cliente'}</label>
                <input
                  type="text"
                  value={form.fornecedor}
                  onChange={e => setForm(f => ({ ...f, fornecedor: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="Nome do fornecedor/cliente"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    value={form.valor}
                    onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Vencimento</label>
                  <input
                    type="date"
                    value={form.vencimento}
                    onChange={e => setForm(f => ({ ...f, vencimento: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
