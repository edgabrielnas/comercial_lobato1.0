import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Printer, Filter, TrendingUp, DollarSign, Package,
  Users, BarChart2, Calendar, Download
} from 'lucide-react';
import {
  mockVendas, mockClientes, mockProdutos, mockContasPagar, mockContasReceber,
  dadosVendasMensais, dadosCategoriasVendas, dadosFluxoCaixa, mockOportunidades
} from '../../data/mockData';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtN = (v: number, d = 1) => v.toLocaleString('pt-BR', { maximumFractionDigits: d });

type Tab = 'vendas' | 'financeiro' | 'estoque' | 'crm';

const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6', '#ef4444'];

export default function RelatoriosView() {
  const [tab, setTab] = useState<Tab>('vendas');
  const [dtInicio, setDtInicio] = useState('2026-03-01');
  const [dtFim, setDtFim] = useState('2026-03-31');
  const [filtroVendedor, setFiltroVendedor] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');

  const vendedores = [...new Set(mockVendas.map(v => v.vendedor))];
  const categorias = [...new Set(mockProdutos.map(p => p.categoria || 'Outros'))];

  const vendasFiltradas = mockVendas.filter(v => {
    const matchVend = filtroVendedor === 'todos' || v.vendedor === filtroVendedor;
    return matchVend;
  });

  const rankingVendedores = vendedores.map(vend => ({
    vendedor: vend,
    total: mockVendas.filter(v => v.vendedor === vend).reduce((s, v) => s + v.total, 0),
    qtd: mockVendas.filter(v => v.vendedor === vend).length,
  })).sort((a, b) => b.total - a.total);

  const rankingProdutos = mockProdutos.map(p => ({
    nome: p.nome.substring(0, 22),
    estoque: p.estoqueAtual,
    receita: p.estoqueAtual * p.precoVenda,
    margem: p.margem,
  })).sort((a, b) => b.receita - a.receita).slice(0, 8);

  const rankingClientes = mockClientes.map(c => ({
    nome: c.nome.substring(0, 20),
    total: c.totalCompras,
    segmento: c.segmento,
  })).sort((a, b) => b.total - a.total).slice(0, 6);

  const totalReceitaBruta = dadosVendasMensais.reduce((s, d) => s + d.vendas, 0);
  const totalComPras = dadosVendasMensais.reduce((s, d) => s + d.compras, 0);
  const totalAPagar = mockContasPagar.filter(c => c.status === 'aberto').reduce((s, c) => s + c.valor, 0);
  const totalPago = mockContasPagar.filter(c => c.status === 'pago').reduce((s, c) => s + c.valor, 0);
  const inadimplencia = mockContasReceber.filter(c => c.status === 'vencido').reduce((s, c) => s + c.valor, 0);

  const totalValorEstoque = mockProdutos.reduce((s, p) => s + p.estoqueAtual * p.custoMedio, 0);
  const produtosAbaixoMin = mockProdutos.filter(p => p.estoqueAtual < p.estoqueMinimo).length;

  const valorPorCategoria = [...new Set(mockProdutos.map(p => p.categoria))].map(cat => ({
    name: cat,
    valor: mockProdutos.filter(p => p.categoria === cat).reduce((s, p) => s + p.estoqueAtual * p.custoMedio, 0),
  })).sort((a, b) => b.valor - a.valor);

  const etapas = ['lead', 'qualificado', 'proposta', 'negociacao', 'fechado_ganho'];
  const etapaLabel: Record<string, string> = {
    lead: 'Lead', qualificado: 'Qualificado', proposta: 'Proposta',
    negociacao: 'Negociação', fechado_ganho: 'Ganho'
  };
  const funilCRM = etapas.map(e => ({
    name: etapaLabel[e],
    qtd: mockOportunidades.filter(o => o.etapa === e).length,
    valor: mockOportunidades.filter(o => o.etapa === e).reduce((s, o) => s + o.valor, 0),
  }));

  const novosClientesMes = mockClientes.filter(c => c.dataCadastro >= '2026-03-01').length;
  const taxaConversao = mockOportunidades.filter(o => o.etapa === 'fechado_ganho').length / mockOportunidades.length * 100;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-xs">
          <p className="font-semibold text-gray-700 mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.value > 1000 ? fmt(p.value) : p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-sm text-gray-500 mt-0.5">Análises e indicadores de desempenho</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Download size={14} />Exportar
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <Printer size={14} />Imprimir
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <label className="text-xs text-gray-500 font-medium">De:</label>
            <input type="date" value={dtInicio} onChange={e => setDtInicio(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">Até:</label>
            <input type="date" value={dtFim} onChange={e => setDtFim(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select value={filtroVendedor} onChange={e => setFiltroVendedor(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
              <option value="todos">Todos Vendedores</option>
              {vendedores.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
            <option value="todos">Todas Categorias</option>
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6 w-fit">
        {[
          { key: 'vendas', label: 'Vendas', icon: <TrendingUp size={14} /> },
          { key: 'financeiro', label: 'Financeiro', icon: <DollarSign size={14} /> },
          { key: 'estoque', label: 'Estoque', icon: <Package size={14} /> },
          { key: 'crm', label: 'CRM', icon: <Users size={14} /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as Tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t.key ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === 'vendas' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Receita Total', value: fmt(vendasFiltradas.reduce((s, v) => s + v.total, 0)), color: 'text-orange-500' },
              { label: 'Qtd Vendas', value: String(vendasFiltradas.length), color: 'text-blue-500' },
              { label: 'Ticket Médio', value: fmt(vendasFiltradas.length > 0 ? vendasFiltradas.reduce((s, v) => s + v.total, 0) / vendasFiltradas.length : 0), color: 'text-green-600' },
              { label: 'Maior Venda', value: fmt(Math.max(...vendasFiltradas.map(v => v.total), 0)), color: 'text-purple-500' },
            ].map((k, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-500 font-medium mb-1">{k.label}</p>
                <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Vendas por Período (6 meses)</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dadosVendasMensais}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="vendas" name="Vendas" fill="#f97316" radius={[4,4,0,0]} />
                  <Bar dataKey="meta" name="Meta" fill="#fed7aa" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Vendas por Categoria</h2>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={dadosCategoriasVendas} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                    {dadosCategoriasVendas.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => `${v}%`} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Ranking Vendedores</h2>
              <div className="space-y-3">
                {rankingVendedores.map((v, i) => (
                  <div key={v.vendedor} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{i+1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-800">{v.vendedor}</span>
                        <span className="font-bold text-orange-500">{fmt(v.total)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${(v.total / rankingVendedores[0].total) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{v.qtd} venda(s)</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Ranking Clientes</h2>
              <div className="space-y-2">
                {rankingClientes.map((c, i) => (
                  <div key={c.nome} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 w-5">{i+1}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{c.nome}</p>
                        <p className="text-xs text-gray-400 capitalize">{c.segmento}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-700 text-sm">{fmt(c.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'financeiro' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Receita 6 meses', value: fmt(totalReceitaBruta), color: 'text-orange-500' },
              { label: 'Total Compras', value: fmt(totalComPras), color: 'text-blue-500' },
              { label: 'Contas a Pagar', value: fmt(totalAPagar), color: 'text-red-500' },
              { label: 'Inadimplência', value: fmt(inadimplencia), color: 'text-red-600' },
            ].map((k, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-500 font-medium mb-1">{k.label}</p>
                <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Vendas vs Compras (6 meses)</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dadosVendasMensais}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="vendas" name="Vendas" fill="#f97316" radius={[4,4,0,0]} />
                  <Bar dataKey="compras" name="Compras" fill="#3b82f6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Fluxo de Caixa — Março</h2>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={dadosFluxoCaixa}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="entradas" name="Entradas" stroke="#22c55e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="saidas" name="Saídas" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="saldo" name="Saldo" stroke="#f97316" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">DRE Resumida — Março/2026</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-400 pb-2">Indicador</th>
                  <th className="text-right text-xs font-semibold text-gray-400 pb-2">Valor</th>
                  <th className="text-right text-xs font-semibold text-gray-400 pb-2">% Rec. Bruta</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { desc: 'Receita Bruta de Vendas', valor: 82600 },
                  { desc: 'Receita Líquida', valor: 77435 },
                  { desc: 'CMV', valor: -56800 },
                  { desc: 'Lucro Bruto', valor: 20635 },
                  { desc: 'Despesas Operacionais Totais', valor: -43800 },
                  { desc: 'EBITDA', valor: -23165 },
                  { desc: 'Lucro Líquido', valor: -23895 },
                ].map((row, i) => (
                  <tr key={i} className={`border-b border-gray-50 ${[1,3,5,6].includes(i) ? 'bg-gray-50 font-semibold' : ''}`}>
                    <td className="py-2.5 text-gray-700">{row.desc}</td>
                    <td className={`py-2.5 text-right font-medium ${row.valor >= 0 ? 'text-gray-800' : 'text-red-500'}`}>{fmt(row.valor)}</td>
                    <td className="py-2.5 text-right text-xs text-gray-400">{fmtN((row.valor / 82600) * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'estoque' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Valor Total Estoque', value: fmt(totalValorEstoque), color: 'text-orange-500' },
              { label: 'Total Produtos', value: String(mockProdutos.length), color: 'text-blue-500' },
              { label: 'Abaixo do Mínimo', value: String(produtosAbaixoMin), color: 'text-red-600' },
              { label: 'Margem Média', value: `${fmtN(mockProdutos.reduce((s, p) => s + p.margem, 0) / mockProdutos.length)}%`, color: 'text-green-600' },
            ].map((k, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-500 font-medium mb-1">{k.label}</p>
                <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Valor por Categoria</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={valorPorCategoria} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#6b7280' }} width={100} />
                  <Tooltip formatter={(v: any) => fmt(v)} />
                  <Bar dataKey="valor" name="Valor" radius={[0,4,4,0]}>
                    {valorPorCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Estoque vs Mínimo</h2>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {mockProdutos.map(p => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-gray-700 font-medium truncate max-w-[140px]">{p.nome}</span>
                        <span className={`font-bold ${p.estoqueAtual < p.estoqueMinimo ? 'text-red-500' : 'text-green-600'}`}>
                          {p.estoqueAtual}/{p.estoqueMinimo}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${p.estoqueAtual < p.estoqueMinimo ? 'bg-red-400' : 'bg-green-400'}`}
                          style={{ width: `${Math.min(100, (p.estoqueAtual / p.estoqueMaximo) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Produtos Abaixo do Estoque Mínimo</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Produto', 'Categoria', 'Estoque Atual', 'Estoque Mínimo', 'Déficit', 'Valor Reposição'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-2 pr-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockProdutos.filter(p => p.estoqueAtual < p.estoqueMinimo).map(p => (
                  <tr key={p.id} className="border-b border-red-50 bg-red-50/30">
                    <td className="py-2 pr-3 font-medium text-gray-800">{p.nome}</td>
                    <td className="py-2 pr-3 text-gray-500 text-xs">{p.categoria}</td>
                    <td className="py-2 pr-3 font-bold text-red-600">{p.estoqueAtual} {p.unidade}</td>
                    <td className="py-2 pr-3 text-gray-600">{p.estoqueMinimo} {p.unidade}</td>
                    <td className="py-2 pr-3 font-semibold text-orange-500">{p.estoqueMinimo - p.estoqueAtual} {p.unidade}</td>
                    <td className="py-2 font-semibold text-gray-700">{fmt((p.estoqueMaximo - p.estoqueAtual) * p.custoUltimo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'crm' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Clientes', value: String(mockClientes.length), color: 'text-orange-500' },
              { label: 'Novos (Março)', value: String(novosClientesMes), color: 'text-blue-500' },
              { label: 'Oportunidades', value: String(mockOportunidades.length), color: 'text-purple-500' },
              { label: 'Taxa Conversão', value: `${fmtN(taxaConversao)}%`, color: 'text-green-600' },
            ].map((k, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-500 font-medium mb-1">{k.label}</p>
                <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Funil de Conversão (Qtd)</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={funilCRM} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} width={90} />
                  <Tooltip />
                  <Bar dataKey="qtd" name="Oportunidades" fill="#f97316" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Valor por Etapa do Funil</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={funilCRM}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => fmt(v)} />
                  <Bar dataKey="valor" name="Valor" radius={[4,4,0,0]}>
                    {funilCRM.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Performance Vendedores — CRM</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Vendedor', 'Clientes', 'Oportunidades', 'Pipeline', 'Fechamentos', 'Tx Conv.'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-2 pr-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendedores.map(vend => {
                  const ops = mockOportunidades.filter(o => o.vendedor === vend);
                  const fechados = ops.filter(o => o.etapa === 'fechado_ganho');
                  const pipeline = ops.filter(o => !['fechado_ganho','fechado_perdido'].includes(o.etapa)).reduce((s, o) => s + o.valor, 0);
                  const clientes = mockClientes.filter(c => c.vendedorResponsavel === vend).length;
                  return (
                    <tr key={vend} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 font-medium text-gray-800">{vend}</td>
                      <td className="py-2.5 text-gray-600">{clientes}</td>
                      <td className="py-2.5 text-gray-600">{ops.length}</td>
                      <td className="py-2.5 font-semibold text-orange-500">{fmt(pipeline)}</td>
                      <td className="py-2.5 text-green-600 font-medium">{fechados.length}</td>
                      <td className="py-2.5">{ops.length > 0 ? fmtN((fechados.length / ops.length) * 100) : 0}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
