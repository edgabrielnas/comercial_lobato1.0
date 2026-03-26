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
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { BarChart2, Printer, Filter, TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { mockVendas, mockClientes, mockProdutos, dadosVendasMensais, dadosCategoriasVendas } from '../../data/mockData';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#06b6d4', '#6366f1'];

type Tab = 'vendas' | 'financeiro' | 'estoque' | 'crm';

const rankingVendedores = [
  { nome: 'Carlos Lobato', total: 38650, qtd: 3, meta: 40000 },
  { nome: 'Ana Lima', total: 24890, qtd: 2, meta: 30000 },
  { nome: 'Pedro Santos', total: 19060, qtd: 1, meta: 25000 },
];

const rankingProdutos = mockProdutos.slice(0, 6).map(p => ({
  nome: p.nome.length > 20 ? p.nome.substring(0, 20) + '...' : p.nome,
  vendas: Math.floor(Math.random() * 150) + 20,
  receita: p.precoVenda * (Math.floor(Math.random() * 50) + 5),
}));

const rankingClientes = mockClientes.filter(c => c.totalCompras > 0).sort((a, b) => b.totalCompras - a.totalCompras).slice(0, 5);

const dadosEstoque = mockProdutos.map(p => ({
  nome: p.nome.length > 18 ? p.nome.substring(0, 18) + '...' : p.nome,
  atual: p.estoqueAtual,
  minimo: p.estoqueMinimo,
  valor: p.estoqueAtual * p.custoMedio,
}));

const dadosGiroEstoque = [
  { categoria: 'Cimentos', giro: 4.2, diasEstoque: 22 },
  { categoria: 'Ferragens', giro: 3.8, diasEstoque: 26 },
  { categoria: 'Tijolos', giro: 2.9, diasEstoque: 34 },
  { categoria: 'Tintas', giro: 2.1, diasEstoque: 48 },
  { categoria: 'Tubulação', giro: 1.8, diasEstoque: 55 },
];

const dadosFunil = [
  { etapa: 'Leads', valor: 5, total: 432000 },
  { etapa: 'Qualificados', valor: 4, total: 315000 },
  { etapa: 'Proposta', valor: 3, total: 250000 },
  { etapa: 'Negociação', valor: 2, total: 160000 },
  { etapa: 'Ganho', valor: 1, total: 150000 },
];

export default function RelatoriosView() {
  const [tab, setTab] = useState<Tab>('vendas');
  const [dataInicio, setDataInicio] = useState('2026-03-01');
  const [dataFim, setDataFim] = useState('2026-03-31');
  const [vendedorFiltro, setVendedorFiltro] = useState('todos');

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'vendas', label: 'Vendas', icon: <TrendingUp size={15} /> },
    { key: 'financeiro', label: 'Financeiro', icon: <DollarSign size={15} /> },
    { key: 'estoque', label: 'Estoque', icon: <Package size={15} /> },
    { key: 'crm', label: 'CRM', icon: <Users size={15} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Relatórios</h1>
          <p className="text-sm text-slate-500">Análises gerenciais — Comercial Lobato</p>
        </div>
        <button className="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
          <Printer size={15} /> Imprimir
        </button>
      </div>

      {/* Filtros globais */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <span className="text-sm text-slate-600 font-medium">Filtros:</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">De:</label>
          <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-400" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Até:</label>
          <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-400" />
        </div>
        <select value={vendedorFiltro} onChange={e => setVendedorFiltro(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-400">
          <option value="todos">Todos os Vendedores</option>
          {['Carlos Lobato', 'Ana Lima', 'Pedro Santos'].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-100 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* RELATÓRIO VENDAS */}
      {tab === 'vendas' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Faturamento Total', value: fmt(82600), color: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Nº de Vendas', value: mockVendas.length.toString(), color: 'text-blue-700', bg: 'bg-blue-50' },
              { label: 'Ticket Médio', value: fmt(82600 / mockVendas.length), color: 'text-purple-700', bg: 'bg-purple-50' },
              { label: 'Meta Atingida', value: '105.9%', color: 'text-orange-700', bg: 'bg-orange-50' },
            ].map(k => (
              <div key={k.label} className={`rounded-xl p-4 ${k.bg}`}>
                <p className="text-xs text-slate-500 mb-1">{k.label}</p>
                <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Gráfico Vendas por Mês */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-700 mb-4">Evolução de Vendas (últimos 6 meses)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dadosVendasMensais}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Legend />
                <Line type="monotone" dataKey="vendas" name="Vendas" stroke="#f97316" strokeWidth={2.5} dot={{ fill: '#f97316', r: 4 }} />
                <Line type="monotone" dataKey="meta" name="Meta" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ranking Vendedores */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-700 mb-4">Ranking Vendedores</h3>
              <div className="space-y-3">
                {rankingVendedores.map((v, i) => (
                  <div key={v.nome}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : 'bg-orange-400'}`}>{i + 1}</span>
                        <span className="text-sm font-medium text-slate-800">{v.nome}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{fmt(v.total)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${(v.total / v.meta) * 100}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{((v.total / v.meta) * 100).toFixed(0)}% da meta • {v.qtd} venda(s)</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Vendas por Categoria */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-700 mb-4">Vendas por Categoria</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={dadosCategoriasVendas} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                    {dadosCategoriasVendas.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ranking Produtos */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-700 mb-4">Top Produtos por Vendas</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={rankingProdutos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="nome" tick={{ fontSize: 10 }} width={130} />
                <Tooltip />
                <Bar dataKey="vendas" name="Qtd Vendas" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ranking Clientes */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-700">Top Clientes por Volume de Compras</h3>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-100">
                {['#', 'Cliente', 'Segmento', 'Última Compra', 'Total Compras'].map(h => <th key={h} className="text-left text-xs text-slate-400 px-4 py-3">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {rankingClientes.map((c, i) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500 font-bold">{i + 1}º</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{c.nome}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs capitalize">{c.segmento}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{c.ultimaCompra ? new Date(c.ultimaCompra + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{fmt(c.totalCompras)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RELATÓRIO FINANCEIRO */}
      {tab === 'financeiro' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Receita Bruta', value: fmt(82600), color: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Despesas Totais', value: fmt(62478), color: 'text-red-700', bg: 'bg-red-50' },
              { label: 'Resultado Operacional', value: fmt(20122), color: 'text-blue-700', bg: 'bg-blue-50' },
              { label: 'Inadimplência', value: '0%', color: 'text-orange-700', bg: 'bg-orange-50' },
            ].map(k => (
              <div key={k.label} className={`rounded-xl p-4 ${k.bg}`}>
                <p className="text-xs text-slate-500 mb-1">{k.label}</p>
                <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-700 mb-4">Receitas vs Despesas — Últimos 6 Meses</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dadosVendasMensais}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Legend />
                <Bar dataKey="vendas" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="compras" name="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="p-4 border-b border-slate-100"><h3 className="font-semibold text-slate-700">DRE Resumida — Março 2026</h3></div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-50">
                {[
                  { label: 'Receita Bruta de Vendas', valor: 82600, tipo: 'positivo', bold: true },
                  { label: 'CMV — Custo das Mercadorias', valor: -58000, tipo: 'negativo', bold: false },
                  { label: 'Lucro Bruto', valor: 24600, tipo: 'positivo', bold: true },
                  { label: 'Despesas Operacionais', valor: -37800, tipo: 'negativo', bold: false },
                  { label: 'Resultado Operacional', valor: -13200, tipo: 'negativo', bold: true },
                  { label: 'Impostos', valor: -4320, tipo: 'negativo', bold: false },
                  { label: 'Lucro Líquido', valor: -17520, tipo: 'negativo', bold: true },
                ].map((r, i) => (
                  <tr key={i} className={`${r.bold ? 'bg-orange-50' : 'hover:bg-slate-50'}`}>
                    <td className={`px-5 py-3 text-sm ${r.bold ? 'font-bold text-slate-900' : 'text-slate-600 pl-8'}`}>{r.label}</td>
                    <td className={`px-5 py-3 text-right font-semibold ${r.valor < 0 ? 'text-red-600' : 'text-green-700'}`}>{fmt(r.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RELATÓRIO ESTOQUE */}
      {tab === 'estoque' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total de Produtos', value: mockProdutos.length.toString(), color: 'text-blue-700', bg: 'bg-blue-50' },
              { label: 'Valor Total em Estoque', value: fmt(mockProdutos.reduce((s, p) => s + p.estoqueAtual * p.custoMedio, 0)), color: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Produtos Críticos', value: mockProdutos.filter(p => p.estoqueAtual <= p.estoqueMinimo).length.toString(), color: 'text-red-700', bg: 'bg-red-50' },
              { label: 'Giro Médio (dias)', value: '35', color: 'text-orange-700', bg: 'bg-orange-50' },
            ].map(k => (
              <div key={k.label} className={`rounded-xl p-4 ${k.bg}`}>
                <p className="text-xs text-slate-500 mb-1">{k.label}</p>
                <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-700 mb-4">Estoque Atual vs Mínimo por Produto</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dadosEstoque.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="nome" tick={{ fontSize: 9 }} width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="atual" name="Estoque Atual" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="minimo" name="Mínimo" fill="#fbbf24" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-700 mb-4">Giro de Estoque por Categoria</h3>
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-100">
                {['Categoria', 'Giro Mensal', 'Dias em Estoque', 'Classificação'].map(h => <th key={h} className="text-left text-xs text-slate-400 px-4 py-3">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {dadosGiroEstoque.map(d => (
                  <tr key={d.categoria} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{d.categoria}</td>
                    <td className="px-4 py-3 text-slate-700">{d.giro}x</td>
                    <td className="px-4 py-3 text-slate-600">{d.diasEstoque} dias</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.giro >= 3.5 ? 'bg-green-100 text-green-700' : d.giro >= 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                        {d.giro >= 3.5 ? 'Alto Giro' : d.giro >= 2 ? 'Médio Giro' : 'Baixo Giro'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RELATÓRIO CRM */}
      {tab === 'crm' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total de Clientes', value: mockClientes.length.toString(), color: 'text-blue-700', bg: 'bg-blue-50' },
              { label: 'Novos este Mês', value: '1', color: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Taxa de Conversão', value: '68%', color: 'text-purple-700', bg: 'bg-purple-50' },
              { label: 'Oportunidades Abertas', value: '4', color: 'text-orange-700', bg: 'bg-orange-50' },
            ].map(k => (
              <div key={k.label} className={`rounded-xl p-4 ${k.bg}`}>
                <p className="text-xs text-slate-500 mb-1">{k.label}</p>
                <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funil de Vendas */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-700 mb-4">Funil de Vendas — Oportunidades</h3>
              <div className="space-y-2">
                {dadosFunil.map((d, i) => (
                  <div key={d.etapa}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-700">{d.etapa}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900">{d.valor}</span>
                        <span className="text-xs text-slate-400 ml-2">{fmt(d.total)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-5">
                      <div className="h-5 rounded-full flex items-center justify-center text-xs text-white font-medium"
                        style={{ width: `${(d.valor / 5) * 100}%`, backgroundColor: COLORS[i] }}>
                        {((d.valor / 5) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clientes por Segmento */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-700 mb-4">Clientes por Segmento</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={[
                    { name: 'Particular', value: mockClientes.filter(c => c.segmento === 'particular').length },
                    { name: 'Construtora', value: mockClientes.filter(c => c.segmento === 'construtora').length },
                    { name: 'Empreiteira', value: mockClientes.filter(c => c.segmento === 'empreiteira').length },
                    { name: 'Revenda', value: mockClientes.filter(c => c.segmento === 'revenda').length },
                    { name: 'Prefeitura', value: mockClientes.filter(c => c.segmento === 'prefeitura').length },
                  ]} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {[0,1,2,3,4].map(i => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Vendedores */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-700 mb-4">Performance dos Vendedores</h3>
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-100">
                {['Vendedor', 'Clientes Atendidos', 'Orçamentos', 'Vendas Fechadas', 'Faturamento', 'Taxa Conv.'].map(h => <th key={h} className="text-left text-xs text-slate-400 px-4 py-3">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {rankingVendedores.map(v => (
                  <tr key={v.nome} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{v.nome}</td>
                    <td className="px-4 py-3 text-slate-600">{Math.floor(Math.random() * 10) + 3}</td>
                    <td className="px-4 py-3 text-slate-600">{Math.floor(Math.random() * 5) + 2}</td>
                    <td className="px-4 py-3 text-slate-600">{v.qtd}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{fmt(v.total)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {(Math.random() * 30 + 50).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
