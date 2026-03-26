import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart,
  AlertTriangle, Package, Clock, CheckCircle, XCircle,
  ArrowUpRight, ArrowDownRight, Bell, RefreshCw
} from 'lucide-react';
import {
  mockVendas, mockProdutos, mockContasPagar, mockContasReceber,
  mockClientes, dadosVendasMensais, dadosCategoriasVendas, dadosFluxoCaixa
} from '../data/mockData';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtN = (v: number) => v.toLocaleString('pt-BR');

const PIE_COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#3b82f6', '#6366f1'];

const statusVendaLabel: Record<string, { label: string; color: string }> = {
  orcamento:     { label: 'Orçamento',     color: 'bg-gray-100 text-gray-700' },
  aprovado:      { label: 'Aprovado',       color: 'bg-blue-100 text-blue-700' },
  em_separacao:  { label: 'Em Separação',   color: 'bg-yellow-100 text-yellow-700' },
  entregue:      { label: 'Entregue',       color: 'bg-green-100 text-green-700' },
  cancelado:     { label: 'Cancelado',      color: 'bg-red-100 text-red-700' },
  devolvido:     { label: 'Devolvido',      color: 'bg-purple-100 text-purple-700' },
};

export default function Dashboard() {
  const [lastRefresh] = useState(new Date().toLocaleTimeString('pt-BR'));

  // KPI calculations
  const vendasMes = mockVendas.reduce((s, v) => s + v.total, 0);
  const metaMes = dadosVendasMensais[dadosVendasMensais.length - 1].meta;
  const pctMeta = ((vendasMes / metaMes) * 100).toFixed(1);

  const aReceber = mockContasReceber
    .filter(c => c.status === 'aberto')
    .reduce((s, c) => s + c.valor, 0);

  const aPagar = mockContasPagar
    .filter(c => c.status === 'aberto')
    .reduce((s, c) => s + c.valor, 0);

  const clientesAtivos = mockClientes.filter(c => c.status === 'ativo').length;

  // Alerts
  const produtosCriticos = mockProdutos.filter(p => p.estoqueAtual < p.estoqueMinimo);
  const contasVencidas = mockContasPagar.filter(c => c.status === 'vencido');
  const pedidosEmSeparacao = mockVendas.filter(v => v.status === 'em_separacao');

  // Last 5 sales
  const ultimasVendas = [...mockVendas].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5);

  const CustomTooltipCurrency = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-sm">
          <p className="font-semibold text-gray-700 mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }}>
              {p.name}: {fmt(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Visão geral — Março 2026 • Atualizado às {lastRefresh}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium">
          <RefreshCw size={14} />
          Atualizar
        </button>
      </div>

      {/* Alert Banners */}
      {(produtosCriticos.length > 0 || contasVencidas.length > 0) && (
        <div className="space-y-2">
          {produtosCriticos.length > 0 && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">
                <span className="font-bold">{produtosCriticos.length} produto(s)</span> com estoque crítico:{' '}
                {produtosCriticos.map(p => p.nome).join(', ')}
              </p>
              <Bell size={14} className="text-red-400 ml-auto flex-shrink-0" />
            </div>
          )}
          {contasVencidas.length > 0 && (
            <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
              <AlertTriangle size={18} className="text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-yellow-700 font-medium">
                <span className="font-bold">{contasVencidas.length} conta(s) a pagar vencida(s)</span>:{' '}
                {fmt(contasVencidas.reduce((s, c) => s + c.valor, 0))} em atraso
              </p>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vendas do Mês */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">Vendas do Mês</span>
            <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={18} className="text-orange-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(vendasMes)}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${parseFloat(pctMeta) >= 100 ? 'text-green-600' : 'text-orange-500'}`}>
              {parseFloat(pctMeta) >= 100 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {pctMeta}% da meta
            </span>
            <span className="text-xs text-gray-400">({fmt(metaMes)})</span>
          </div>
        </div>

        {/* A Receber */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">A Receber</span>
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <ArrowUpRight size={18} className="text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(aReceber)}</p>
          <p className="text-xs text-gray-400 mt-2">
            {mockContasReceber.filter(c => c.status === 'aberto').length} títulos em aberto
          </p>
        </div>

        {/* A Pagar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">A Pagar</span>
            <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
              <ArrowDownRight size={18} className="text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(aPagar)}</p>
          <p className="text-xs text-red-500 mt-2 font-medium">
            {contasVencidas.length} vencida(s): {fmt(contasVencidas.reduce((s, c) => s + c.valor, 0))}
          </p>
        </div>

        {/* Clientes Ativos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium">Clientes Ativos</span>
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <Users size={18} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmtN(clientesAtivos)}</p>
          <p className="text-xs text-gray-400 mt-2">
            {mockClientes.filter(c => c.status === 'prospecto').length} prospectos em pipeline
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Vendas vs Meta Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Vendas vs Meta (últimos 6 meses)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dadosVendasMensais} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltipCurrency />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="vendas" name="Vendas" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="meta" name="Meta" fill="#fed7aa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vendas por Categoria Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Vendas por Categoria</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={dadosCategoriasVendas}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {dadosCategoriasVendas.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {dadosCategoriasVendas.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-700">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fluxo de Caixa Area Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Fluxo de Caixa — Março 2026</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={dadosFluxoCaixa}>
            <defs>
              <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradSaidas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradSaldo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltipCurrency />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="entradas" name="Entradas" stroke="#22c55e" fill="url(#gradEntradas)" strokeWidth={2} />
            <Area type="monotone" dataKey="saidas" name="Saídas" stroke="#ef4444" fill="url(#gradSaidas)" strokeWidth={2} />
            <Area type="monotone" dataKey="saldo" name="Saldo" stroke="#f97316" fill="url(#gradSaldo)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Últimas Vendas Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Últimas Vendas</h2>
            <span className="text-xs text-orange-500 font-medium cursor-pointer hover:underline">Ver todas →</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 pb-2">Nº</th>
                  <th className="text-left text-xs font-semibold text-gray-400 pb-2">Cliente</th>
                  <th className="text-left text-xs font-semibold text-gray-400 pb-2">Vendedor</th>
                  <th className="text-right text-xs font-semibold text-gray-400 pb-2">Total</th>
                  <th className="text-center text-xs font-semibold text-gray-400 pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ultimasVendas.map(v => {
                  const s = statusVendaLabel[v.status] || { label: v.status, color: 'bg-gray-100 text-gray-600' };
                  return (
                    <tr key={v.id} className="hover:bg-gray-50 transition">
                      <td className="py-2.5 text-orange-500 font-medium">{v.numero}</td>
                      <td className="py-2.5 text-gray-700 max-w-[120px] truncate">{v.cliente}</td>
                      <td className="py-2.5 text-gray-500 text-xs">{v.vendedor}</td>
                      <td className="py-2.5 text-right font-semibold text-gray-800">{fmt(v.total)}</td>
                      <td className="py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Cards */}
        <div className="space-y-3">
          {/* Pedidos em Separação */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock size={18} className="text-yellow-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{pedidosEmSeparacao.length}</p>
                <p className="text-xs text-gray-500">Pedidos em Separação</p>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {pedidosEmSeparacao.slice(0, 2).map(p => (
                <div key={p.id} className="flex justify-between text-xs text-gray-500">
                  <span className="truncate">{p.numero} — {p.cliente}</span>
                  <span className="font-medium text-gray-700 ml-2 flex-shrink-0">{fmt(p.total)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recebimentos Pendentes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {mockContasReceber.filter(c => c.status === 'aberto').length}
                </p>
                <p className="text-xs text-gray-500">Recebimentos Pendentes</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Total: <span className="font-semibold text-gray-700">{fmt(aReceber)}</span>
            </p>
          </div>

          {/* Estoque Crítico */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Package size={18} className="text-red-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{produtosCriticos.length}</p>
                <p className="text-xs text-gray-500">Produtos Estoque Crítico</p>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {produtosCriticos.slice(0, 3).map(p => (
                <div key={p.id} className="flex justify-between text-xs">
                  <span className="text-gray-500 truncate">{p.nome}</span>
                  <span className="text-red-500 font-medium ml-2 flex-shrink-0">{p.estoqueAtual} {p.unidade}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pedidos Compra Aguardando */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingCart size={18} className="text-purple-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">3</p>
                <p className="text-xs text-gray-500">Pedidos de Compra</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              1 confirmado • 1 enviado • 1 recebido
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
