import React, { useState } from 'react';
import {
  TrendingUp, DollarSign, Tag, Calculator, Plus, X,
  Edit3, CheckCircle, AlertTriangle, BarChart2
} from 'lucide-react';
import { Produto, TabelaPreco } from '../../types';
import { mockProdutos, mockTabelasPreco } from '../../data/mockData';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtN = (v: number, d = 2) => v.toLocaleString('pt-BR', { maximumFractionDigits: d, minimumFractionDigits: d });

type Tab = 'margens' | 'tabelas' | 'simulador';

function marginColor(m: number) {
  if (m < 15) return 'text-red-600';
  if (m < 25) return 'text-yellow-600';
  return 'text-green-600';
}

function marginBg(m: number) {
  if (m < 15) return 'bg-red-50';
  if (m < 25) return 'bg-yellow-50';
  return 'bg-green-50';
}

interface ProdutoMarkup {
  id: string;
  markupEdit: number;
  editing: boolean;
}

export default function PrecificacaoView() {
  const [tab, setTab] = useState<Tab>('margens');
  const [showTabelaModal, setShowTabelaModal] = useState(false);

  // Margens state
  const [markups, setMarkups] = useState<Record<string, ProdutoMarkup>>(
    Object.fromEntries(mockProdutos.map(p => [p.id, { id: p.id, markupEdit: p.markup, editing: false }]))
  );

  // Simulador state
  const [simCusto, setSimCusto] = useState('');
  const [simMarkup, setSimMarkup] = useState('35');
  const [simDescMax, setSimDescMax] = useState('10');

  // Batch simulator
  const [batchItems, setBatchItems] = useState([{ nome: '', custo: '', markup: '35' }]);

  // Tabela form
  const [tabelaForm, setTabelaForm] = useState({
    nome: '', tipo: 'varejo', markup: '35', desconto: '0', vigencia: ''
  });

  const toggleEdit = (id: string) => {
    setMarkups(prev => ({ ...prev, [id]: { ...prev[id], editing: !prev[id].editing } }));
  };

  const updateMarkup = (id: string, val: number) => {
    setMarkups(prev => ({ ...prev, [id]: { ...prev[id], markupEdit: val } }));
  };

  const calcPrecoSugerido = (custo: number, markup: number) => custo * (1 + markup / 100);

  const avgMargem = mockProdutos.reduce((s, p) => s + p.margem, 0) / mockProdutos.length;
  const bestProduct = mockProdutos.reduce((a, b) => a.margem > b.margem ? a : b);
  const avgMarkup = mockProdutos.reduce((s, p) => s + p.markup, 0) / mockProdutos.length;

  // Simulator calcs
  const simCustoNum = parseFloat(simCusto) || 0;
  const simMarkupNum = parseFloat(simMarkup) || 0;
  const simDescNum = parseFloat(simDescMax) || 0;
  const simPrecoVenda = calcPrecoSugerido(simCustoNum, simMarkupNum);
  const simPrecoMin = simPrecoVenda * (1 - simDescNum / 100);
  const simLucro = simPrecoVenda - simCustoNum;
  const simMargem = simPrecoVenda > 0 ? (simLucro / simPrecoVenda) * 100 : 0;

  const tabelaTipoBadge: Record<string, string> = {
    varejo:     'bg-blue-100 text-blue-700',
    atacado:    'bg-purple-100 text-purple-700',
    obra:       'bg-orange-100 text-orange-700',
    especial:   'bg-yellow-100 text-yellow-700',
    funcionario:'bg-green-100 text-green-700',
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Precificação</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestão de preços, margens e tabelas</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 size={16} className="text-orange-500" />
            <span className="text-xs text-gray-500 font-medium">Margem Média da Loja</span>
          </div>
          <p className={`text-xl font-bold ${marginColor(avgMargem)}`}>{fmtN(avgMargem)}%</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-green-500" />
            <span className="text-xs text-gray-500 font-medium">Produto Mais Lucrativo</span>
          </div>
          <p className="text-sm font-bold text-gray-900 truncate">{bestProduct.nome}</p>
          <p className="text-xs text-green-600 font-medium">{fmtN(bestProduct.margem)}% margem</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <Tag size={16} className="text-blue-500" />
            <span className="text-xs text-gray-500 font-medium">Markup Médio</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{fmtN(avgMarkup)}%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6 w-fit">
        {[
          { key: 'margens',   label: 'Produtos e Margens' },
          { key: 'tabelas',   label: 'Tabelas de Preço' },
          { key: 'simulador', label: 'Simulador' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as Tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.key ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Produtos e Margens Tab */}
      {tab === 'margens' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Produto', 'Custo Médio', 'Preço Atual', 'Markup Atual', 'Margem Atual', 'Markup (edit)', 'Preço Sugerido', 'Variação', ''].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-3 pr-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mockProdutos.map(p => {
                  const mk = markups[p.id];
                  const precoSugerido = calcPrecoSugerido(p.custoMedio, mk?.markupEdit ?? p.markup);
                  const varPct = ((precoSugerido - p.precoVenda) / p.precoVenda) * 100;
                  const margemSugerida = ((precoSugerido - p.custoMedio) / precoSugerido) * 100;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 pr-3">
                        <p className="font-medium text-gray-800 max-w-[160px] truncate">{p.nome}</p>
                        <p className="text-xs text-gray-400">{p.codigo} • {p.categoria}</p>
                      </td>
                      <td className="py-3 pr-3 text-gray-600">{fmt(p.custoMedio)}</td>
                      <td className="py-3 pr-3 font-semibold text-gray-800">{fmt(p.precoVenda)}</td>
                      <td className="py-3 pr-3 text-gray-600">{fmtN(p.markup)}%</td>
                      <td className={`py-3 pr-3 font-bold ${marginColor(p.margem)}`}>
                        <span className={`px-2 py-0.5 rounded-lg text-xs ${marginBg(p.margem)} ${marginColor(p.margem)}`}>
                          {fmtN(p.margem)}%
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        {mk?.editing ? (
                          <input
                            type="number"
                            value={mk.markupEdit}
                            onChange={e => updateMarkup(p.id, Number(e.target.value))}
                            className="w-20 border border-orange-300 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                            autoFocus
                          />
                        ) : (
                          <span className="text-gray-600">{fmtN(mk?.markupEdit ?? p.markup)}%</span>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        <p className="font-semibold text-orange-500">{fmt(precoSugerido)}</p>
                        <p className={`text-xs ${marginColor(margemSugerida)}`}>Margem: {fmtN(margemSugerida)}%</p>
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`text-xs font-semibold ${varPct > 0 ? 'text-green-600' : varPct < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                          {varPct > 0 ? '+' : ''}{fmtN(varPct)}%
                        </span>
                      </td>
                      <td className="py-3">
                        <button onClick={() => toggleEdit(p.id)} className="text-xs text-orange-500 hover:text-orange-700 flex items-center gap-1">
                          {mk?.editing ? <CheckCircle size={12} /> : <Edit3 size={12} />}
                          {mk?.editing ? 'OK' : 'Editar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center gap-3 text-xs text-gray-500 border-t border-gray-100 pt-3">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-100 border border-red-300 inline-block" /> Margem &lt; 15% — Risco</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-yellow-100 border border-yellow-300 inline-block" /> Margem 15-25% — Atenção</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-100 border border-green-300 inline-block" /> Margem &gt; 25% — Saudável</span>
          </div>
        </div>
      )}

      {/* Tabelas de Preço Tab */}
      {tab === 'tabelas' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowTabelaModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium"
            >
              <Plus size={16} />
              Nova Tabela
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockTabelasPreco.map(tp => (
              <div key={tp.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-orange-200 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{tp.nome}</h3>
                    <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${tabelaTipoBadge[tp.tipo] || 'bg-gray-100 text-gray-600'}`}>
                      {tp.tipo}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tp.ativa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {tp.ativa ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <div className="space-y-1.5 text-sm">
                  {tp.markup !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Markup aplicado:</span>
                      <span className="font-semibold text-green-600">+{tp.markup}%</span>
                    </div>
                  )}
                  {tp.desconto !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Desconto aplicado:</span>
                      <span className="font-semibold text-orange-500">-{tp.desconto}%</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">
                    <span>Vigência: {new Date(tp.dataVigencia + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    {tp.dataExpiracao && <span>Até: {new Date(tp.dataExpiracao + 'T00:00:00').toLocaleDateString('pt-BR')}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simulador Tab */}
      {tab === 'simulador' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Single Product Simulator */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calculator size={18} className="text-orange-500" />
              <h2 className="text-sm font-semibold text-gray-700">Simulador de Produto</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Custo do Produto (R$)</label>
                <input
                  type="number"
                  value={simCusto}
                  onChange={e => setSimCusto(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Markup Desejado (%)</label>
                <input
                  type="number"
                  value={simMarkup}
                  onChange={e => setSimMarkup(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="35"
                />
                <div className="flex gap-2 mt-1.5">
                  {[20, 30, 35, 40, 50].map(v => (
                    <button
                      key={v}
                      onClick={() => setSimMarkup(String(v))}
                      className={`flex-1 py-1 text-xs rounded-lg border transition ${
                        simMarkup === String(v) ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-500 hover:border-orange-300'
                      }`}
                    >
                      {v}%
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Desconto Máximo (%)</label>
                <input
                  type="number"
                  value={simDescMax}
                  onChange={e => setSimDescMax(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="10"
                />
              </div>
            </div>

            {simCustoNum > 0 && (
              <div className="mt-4 space-y-3">
                <div className="border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-orange-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-0.5">Preço de Venda</p>
                      <p className="text-lg font-bold text-orange-500">{fmt(simPrecoVenda)}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-0.5">Preço Mínimo</p>
                      <p className="text-lg font-bold text-red-500">{fmt(simPrecoMin)}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-0.5">Lucro Esperado</p>
                      <p className="text-lg font-bold text-green-600">{fmt(simLucro)}</p>
                    </div>
                    <div className={`rounded-xl p-3 ${marginBg(simMargem)}`}>
                      <p className="text-xs text-gray-500 mb-0.5">Margem Resultante</p>
                      <p className={`text-lg font-bold ${marginColor(simMargem)}`}>{fmtN(simMargem)}%</p>
                    </div>
                  </div>
                </div>
                {simMargem < 15 && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                    <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                    <p className="text-xs text-red-700">Atenção: margem abaixo do mínimo recomendado (15%)</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Batch Simulator */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 size={18} className="text-orange-500" />
                <h2 className="text-sm font-semibold text-gray-700">Simulador em Lote</h2>
              </div>
              <button
                onClick={() => setBatchItems(prev => [...prev, { nome: '', custo: '', markup: '35' }])}
                className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-700"
              >
                <Plus size={12} /> Adicionar
              </button>
            </div>
            <div className="space-y-2 mb-4">
              {batchItems.map((item, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-end">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Produto</label>
                    <input
                      type="text"
                      value={item.nome}
                      onChange={e => setBatchItems(prev => prev.map((x, idx) => idx === i ? { ...x, nome: e.target.value } : x))}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-300"
                      placeholder="Nome"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Custo (R$)</label>
                    <input
                      type="number"
                      value={item.custo}
                      onChange={e => setBatchItems(prev => prev.map((x, idx) => idx === i ? { ...x, custo: e.target.value } : x))}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-300"
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Markup %</label>
                    <input
                      type="number"
                      value={item.markup}
                      onChange={e => setBatchItems(prev => prev.map((x, idx) => idx === i ? { ...x, markup: e.target.value } : x))}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-300"
                    />
                  </div>
                  <button
                    onClick={() => setBatchItems(prev => prev.filter((_, idx) => idx !== i))}
                    disabled={batchItems.length === 1}
                    className="pb-0.5 text-gray-300 hover:text-red-400 disabled:opacity-30"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Produto', 'Custo', 'Markup', 'Preço', 'Margem'].map(h => (
                      <th key={h} className="text-left text-gray-400 pb-1.5 pr-2 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {batchItems.filter(i => i.custo).map((item, i) => {
                    const custo = parseFloat(item.custo) || 0;
                    const mk = parseFloat(item.markup) || 0;
                    const preco = custo * (1 + mk / 100);
                    const margem = preco > 0 ? ((preco - custo) / preco) * 100 : 0;
                    return (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-1.5 pr-2 text-gray-700 font-medium">{item.nome || `Produto ${i + 1}`}</td>
                        <td className="py-1.5 pr-2 text-gray-600">{fmt(custo)}</td>
                        <td className="py-1.5 pr-2 text-gray-600">{fmtN(mk)}%</td>
                        <td className="py-1.5 pr-2 font-bold text-orange-500">{fmt(preco)}</td>
                        <td className={`py-1.5 font-bold ${marginColor(margem)}`}>{fmtN(margem)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Tabela */}
      {showTabelaModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Nova Tabela de Preço</h3>
              <button onClick={() => setShowTabelaModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nome da Tabela</label>
                <input type="text" value={tabelaForm.nome} onChange={e => setTabelaForm(f => ({ ...f, nome: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="Ex: Tabela Obras" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                <select value={tabelaForm.tipo} onChange={e => setTabelaForm(f => ({ ...f, tipo: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                  <option value="varejo">Varejo</option>
                  <option value="atacado">Atacado</option>
                  <option value="obra">Obras/Construtoras</option>
                  <option value="especial">Especial</option>
                  <option value="funcionario">Funcionário</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Markup (%)</label>
                  <input type="number" value={tabelaForm.markup} onChange={e => setTabelaForm(f => ({ ...f, markup: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Desconto (%)</label>
                  <input type="number" value={tabelaForm.desconto} onChange={e => setTabelaForm(f => ({ ...f, desconto: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data de Vigência</label>
                <input type="date" value={tabelaForm.vigencia} onChange={e => setTabelaForm(f => ({ ...f, vigencia: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowTabelaModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={() => setShowTabelaModal(false)} className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">Salvar Tabela</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
