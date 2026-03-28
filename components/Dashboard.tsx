import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package,
  AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight,
  Activity, Zap, Target, Clock
} from 'lucide-react';
import {
  mockVendas, mockClientes, mockProdutos, mockContasPagar, mockContasReceber,
  dadosVendasMensais, dadosCategoriasVendas, dadosFluxoCaixa
} from '../data/mockData';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PIE_COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const statusVendaLabel: Record<string, { label: string; color: string }> = {
  orcamento:    { label: 'Orcamento',    color: 'bg-gray-700/50 text-gray-300' },
  aprovado:     { label: 'Aprovado',     color: 'bg-blue-500/20 text-blue-400' },
  em_separacao: { label: 'Em Separacao', color: 'bg-amber-500/20 text-amber-400' },
  entregue:     { label: 'Entregue',     color: 'bg-emerald-500/20 text-emerald-400' },
  cancelado:    { label: 'Cancelado',    color: 'bg-red-500/20 text-red-400' },
  devolvido:    { label: 'Devolvido',    color: 'bg-purple-500/20 text-purple-400' },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) return (
    <div className="bg-[#0a1628] border border-blue-700/50 rounded-xl p-3 shadow-xl">
      <p className="text-blue-300 text-xs font-semibold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="text-xs">
          {p.name}: {typeof p.value === 'number' && p.value > 1000
            ? p.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : p.value}
        </p>
      ))}
    </div>
  );
  return null;
};

export default function Dashboard() {
  const [lastRefresh] = useState(new Date().toLocaleTimeString('pt-BR'));

  // KPI calculations
  const totalVendasMes = mockVendas.reduce((s, v) => s + v.total, 0);
  const totalReceber = mockContasReceber.filter(c => c.status !== 'pago').reduce((s, c) => s + c.valor, 0);
  const totalPagar = mockContasPagar.filter(c => c.status === 'aberto' || c.status === 'vencido').reduce((s, c) => s + c.valor, 0);
  const margemMedia = mockProdutos.reduce((s, p) => s + p.margem, 0) / mockProdutos.length;
  const clientesAtivos = mockClientes.filter(c => c.status === 'ativo').length;
  const ticketMedio = totalVendasMes / mockVendas.length;
  const estoqueCritico = mockProdutos.filter(p => p.estoqueAtual < p.estoqueMinimo).length;
  const contasVencidas = mockContasPagar.filter(c => c.status === 'vencido').length;

  const metaMes = dadosVendasMensais[dadosVendasMensais.length - 1]?.meta ?? 1;
  const pctMeta = ((totalVendasMes / metaMes) * 100).toFixed(1);

  const produtosCriticos = mockProdutos.filter(p => p.estoqueAtual < p.estoqueMinimo);
  const contasVencidasList = mockContasPagar.filter(c => c.status === 'vencido');
  const ultimasVendas = [...mockVendas].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 6);

  return (
    <div className="bg-[#070d1a] min-h-screen p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Executivo</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' '}&bull; Atualizado as {lastRefresh}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            AO VIVO
          </span>
        </div>
      </div>

      {/* Alert Banners */}
      {(produtosCriticos.length > 0 || contasVencidasList.length > 0) && (
        <div className="space-y-2">
          {produtosCriticos.length > 0 && (
            <div className="flex items-center gap-3 bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3">
              <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300 font-medium">
                <span className="font-bold">{produtosCriticos.length} produto(s)</span> com estoque critico:{' '}
                {produtosCriticos.map(p => p.nome).join(', ')}
              </p>
            </div>
          )}
          {contasVencidasList.length > 0 && (
            <div className="flex items-center gap-3 bg-amber-900/20 border border-amber-500/30 rounded-xl px-4 py-3">
              <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
              <p className="text-sm text-amber-300 font-medium">
                <span className="font-bold">{contasVencidasList.length} conta(s) a pagar vencida(s)</span>:{' '}
                {fmt(contasVencidasList.reduce((s, c) => s + c.valor, 0))} em atraso
              </p>
            </div>
          )}
        </div>
      )}

      {/* KPI Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-[#0f1f3d]/80 border border-blue-500/50 backdrop-blur-sm rounded-2xl p-5 shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Vendas do Mes</span>
            <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp size={16} className="text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-cyan-400">{fmt(totalVendasMes)}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${parseFloat(pctMeta) >= 100 ? 'text-emerald-400' : 'text-blue-400'}`}>
              {parseFloat(pctMeta) >= 100 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {pctMeta}% da meta
            </span>
            <span className="text-xs text-gray-500">({fmt(metaMes)})</span>
          </div>
        </div>

        <div className="bg-[#0f1f3d]/80 border border-blue-800/30 backdrop-blur-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">A Receber</span>
            <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <ArrowUpRight size={16} className="text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-400">{fmt(totalReceber)}</p>
          <p className="text-xs text-gray-500 mt-2">
            {mockContasReceber.filter(c => c.status !== 'pago').length} titulos em aberto
          </p>
        </div>

        <div className="bg-[#0f1f3d]/80 border border-blue-800/30 backdrop-blur-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">A Pagar</span>
            <div className="w-9 h-9 bg-red-500/10 rounded-xl flex items-center justify-center">
              <ArrowDownRight size={16} className="text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-400">{fmt(totalPagar)}</p>
          <p className="text-xs text-red-400/70 mt-2 font-medium">
            {contasVencidas} vencida(s)
          </p>
        </div>

        <div className="bg-[#0f1f3d]/80 border border-blue-800/30 backdrop-blur-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Margem Media</span>
            <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Target size={16} className="text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{margemMedia.toFixed(1)}%</p>
          <div className="mt-2 h-1.5 bg-blue-900/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
              style={{ width: `${Math.min(margemMedia, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        <div className="bg-[#0f1f3d]/60 border border-blue-800/30 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{clientesAtivos}</p>
            <p className="text-xs text-gray-400">Clientes Ativos</p>
          </div>
        </div>

        <div className="bg-[#0f1f3d]/60 border border-blue-800/30 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <Activity size={18} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{fmt(ticketMedio)}</p>
            <p className="text-xs text-gray-400">Ticket Medio</p>
          </div>
        </div>

        <div className="bg-[#0f1f3d]/60 border border-blue-800/30 rounded-xl p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${estoqueCritico > 0 ? 'bg-red-500/15' : 'bg-emerald-500/15'}`}>
            <Package size={18} className={estoqueCritico > 0 ? 'text-red-400' : 'text-emerald-400'} />
          </div>
          <div>
            <p className={`text-lg font-bold ${estoqueCritico > 0 ? 'text-red-400' : 'text-white'}`}>{estoqueCritico}</p>
            <p className="text-xs text-gray-400">Estoque Critico</p>
          </div>
        </div>

        <div className="bg-[#0f1f3d]/60 border border-blue-800/30 rounded-xl p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${contasVencidas > 0 ? 'bg-amber-500/15' : 'bg-emerald-500/15'}`}>
            <Clock size={18} className={contasVencidas > 0 ? 'text-amber-400' : 'text-emerald-400'} />
          </div>
          <div>
            <p className={`text-lg font-bold ${contasVencidas > 0 ? 'text-amber-400' : 'text-white'}`}>{contasVencidas}</p>
            <p className="text-xs text-gray-400">Contas Vencidas</p>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2 bg-[#0f1f3d]/60 border border-blue-800/30 backdrop-blur-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-300">Vendas vs Meta (ultimos 6 meses)</h2>
            <span className="text-xs text-blue-400 font-medium">R$ mil</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dadosVendasMensais} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f40" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
              <Bar dataKey="vendas" name="Vendas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="meta" name="Meta" fill="#0e7490" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0f1f3d]/60 border border-blue-800/30 backdrop-blur-sm rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Vendas por Categoria</h2>
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
              <Tooltip
                formatter={(v: any) => `${v}%`}
                contentStyle={{ background: '#0a1628', border: '1px solid #1d4ed840', borderRadius: 12, color: '#e5e7eb', fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {dadosCategoriasVendas.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-gray-400">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-300">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fluxo de Caixa */}
      <div className="bg-[#0f1f3d]/60 border border-blue-800/30 backdrop-blur-sm rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Fluxo de Caixa - Marco 2026</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={dadosFluxoCaixa}>
            <defs>
              <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradSaidas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradSaldo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f40" />
            <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            <Area type="monotone" dataKey="entradas" name="Entradas" stroke="#06b6d4" fill="url(#gradEntradas)" strokeWidth={2} />
            <Area type="monotone" dataKey="saidas" name="Saidas" stroke="#ef4444" fill="url(#gradSaidas)" strokeWidth={2} />
            <Area type="monotone" dataKey="saldo" name="Saldo" stroke="#3b82f6" fill="url(#gradSaldo)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Ultimas Vendas + Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2 bg-[#0f1f3d]/60 border border-blue-800/30 backdrop-blur-sm rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-300">Ultimas Vendas</h2>
            <span className="text-xs text-blue-400 font-medium cursor-pointer hover:text-cyan-400 transition">
              Ver todas
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-900/30">
                  <th className="text-left text-xs font-semibold text-gray-500 pb-2">N</th>
                  <th className="text-left text-xs font-semibold text-gray-500 pb-2">Cliente</th>
                  <th className="text-left text-xs font-semibold text-gray-500 pb-2">Vendedor</th>
                  <th className="text-right text-xs font-semibold text-gray-500 pb-2">Total</th>
                  <th className="text-center text-xs font-semibold text-gray-500 pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/20">
                {ultimasVendas.map(v => {
                  const s = statusVendaLabel[v.status] || { label: v.status, color: 'bg-gray-700/50 text-gray-300' };
                  return (
                    <tr key={v.id} className="hover:bg-blue-900/20 transition">
                      <td className="py-2.5 text-blue-400 font-medium text-xs">{v.numero}</td>
                      <td className="py-2.5 text-gray-300 max-w-[110px] truncate">{v.cliente}</td>
                      <td className="py-2.5 text-gray-500 text-xs">{v.vendedor}</td>
                      <td className="py-2.5 text-right font-semibold text-cyan-400">{fmt(v.total)}</td>
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

        <div className="space-y-3">

          <div className="bg-[#0f1f3d]/60 border border-blue-800/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-amber-500/15 rounded-xl flex items-center justify-center">
                <Clock size={16} className="text-amber-400" />
              </div>
              <div>
                <p className="text-base font-bold text-white">
                  {mockVendas.filter(v => v.status === 'em_separacao').length}
                </p>
                <p className="text-xs text-gray-400">Pedidos em Separacao</p>
              </div>
            </div>
            <div className="space-y-1">
              {mockVendas.filter(v => v.status === 'em_separacao').slice(0, 2).map(p => (
                <div key={p.id} className="flex justify-between text-xs text-gray-500">
                  <span className="truncate">{p.numero} - {p.cliente}</span>
                  <span className="font-medium text-gray-300 ml-2 flex-shrink-0">{fmt(p.total)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0f1f3d]/60 border border-blue-800/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-500/15 rounded-xl flex items-center justify-center">
                <DollarSign size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-base font-bold text-white">
                  {mockContasReceber.filter(c => c.status !== 'pago').length}
                </p>
                <p className="text-xs text-gray-400">Recebimentos Pendentes</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Total: <span className="font-semibold text-blue-400">{fmt(totalReceber)}</span>
            </p>
          </div>

          <div className="bg-[#0f1f3d]/60 border border-blue-800/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-red-500/15 rounded-xl flex items-center justify-center">
                <Package size={16} className="text-red-400" />
              </div>
              <div>
                <p className="text-base font-bold text-white">{produtosCriticos.length}</p>
                <p className="text-xs text-gray-400">Estoque Critico</p>
              </div>
            </div>
            <div className="space-y-1">
              {produtosCriticos.slice(0, 3).map(p => (
                <div key={p.id} className="flex justify-between text-xs">
                  <span className="text-gray-500 truncate">{p.nome}</span>
                  <span className="text-red-400 font-medium ml-2 flex-shrink-0">{p.estoqueAtual} {p.unidade}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0f1f3d]/60 border border-blue-800/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-cyan-500/15 rounded-xl flex items-center justify-center">
                <ShoppingCart size={16} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-base font-bold text-white">3</p>
                <p className="text-xs text-gray-400">Pedidos de Compra</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              1 confirmado &bull; 1 enviado &bull; 1 recebido
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
