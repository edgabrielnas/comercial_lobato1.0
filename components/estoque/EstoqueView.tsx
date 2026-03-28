import React, { useState } from 'react';
import {
  Search, Plus, X, AlertTriangle, CheckCircle, Package,
  TrendingUp, DollarSign, Filter, ArrowUp, ArrowDown, RotateCcw
} from 'lucide-react';
import { Produto, MovimentacaoEstoque } from '../../types';
import { mockProdutos, mockMovimentacoes } from '../../data/mockData';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtN = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

type Tab = 'produtos' | 'movimentacoes' | 'alertas';

function stockColor(p: Produto): string {
  if (p.estoqueAtual < p.estoqueMinimo) return 'text-red-600 bg-red-50';
  if (p.estoqueAtual < p.estoqueMinimo * 1.5) return 'text-yellow-600 bg-yellow-50';
  return 'text-green-600 bg-green-50';
}

function stockBadge(p: Produto): string {
  if (p.estoqueAtual < p.estoqueMinimo) return 'Crítico';
  if (p.estoqueAtual < p.estoqueMinimo * 1.5) return 'Baixo';
  return 'Normal';
}

const movTipoBadge: Record<string, string> = {
  entrada:      'bg-green-100 text-green-700',
  saida:        'bg-red-100 text-red-700',
  ajuste:       'bg-yellow-100 text-yellow-700',
  devolucao:    'bg-blue-100 text-blue-700',
  transferencia:'bg-purple-100 text-purple-700',
};
const movTipoIcon: Record<string, React.ReactNode> = {
  entrada:   <ArrowDown size={14} className="text-green-500" />,
  saida:     <ArrowUp size={14} className="text-red-500" />,
  ajuste:    <RotateCcw size={14} className="text-yellow-500" />,
  devolucao: <ArrowDown size={14} className="text-blue-500" />,
  transferencia: <RotateCcw size={14} className="text-purple-500" />,
};

export default function EstoqueView() {
  const [tab, setTab] = useState<Tab>('produtos');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('todos');
  const [showProdModal, setShowProdModal] = useState(false);
  const [showAjusteModal, setShowAjusteModal] = useState<Produto | null>(null);
  const [ajusteQty, setAjusteQty] = useState('');
  const [ajusteMotivo, setAjusteMotivo] = useState('');

  const [prodForm, setProdForm] = useState({
    codigo: '', nome: '', categoria: '', unidade: 'un',
    custoMedio: '', precoVenda: '', estoqueAtual: '', estoqueMinimo: '', estoqueMaximo: '',
    localArmazenamento: '', markup: '', ncm: ''
  });

  const categorias = [...new Set(mockProdutos.map(p => p.categoria || 'Outros'))];

  const filteredProdutos = mockProdutos.filter(p => {
    const matchSearch = !search || p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'todos' || p.categoria === filterCat;
    return matchSearch && matchCat;
  });

  const criticos = mockProdutos.filter(p => p.estoqueAtual < p.estoqueMinimo);
  const totalValorEstoque = mockProdutos.reduce((s, p) => s + p.estoqueAtual * p.custoMedio, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estoque</h1>
          <p className="text-sm text-gray-500 mt-0.5">Controle de produtos e movimentações</p>
        </div>
        <button
          onClick={() => setShowProdModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium"
        >
          <Plus size={16} />
          Novo Produto
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6 w-fit">
        {[
          { key: 'produtos',       label: 'Produtos' },
          { key: 'movimentacoes',  label: 'Movimentações' },
          { key: 'alertas',        label: `Alertas (${criticos.length})` },
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

      {/* Produtos Tab */}
      {tab === 'produtos' && (
        <div className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <Package size={16} className="text-orange-500" />
                <span className="text-xs text-gray-500 font-medium">Total Produtos</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{mockProdutos.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={16} className="text-green-500" />
                <span className="text-xs text-gray-500 font-medium">Valor do Estoque</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{fmt(totalValorEstoque)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={16} className="text-red-500" />
                <span className="text-xs text-gray-500 font-medium">Produtos Críticos</span>
              </div>
              <p className="text-xl font-bold text-red-600">{criticos.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar produto..."
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-gray-400" />
                <select
                  value={filterCat}
                  onChange={e => setFilterCat(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  <option value="todos">Todas Categorias</option>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Código', 'Produto', 'Categoria', 'Un', 'Custo Médio', 'Preço Venda', 'Markup', 'Margem', 'Estoque', 'Mín/Máx', 'Local', 'Status', ''].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-2 pr-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProdutos.map(p => {
                    const sc = stockColor(p);
                    const sb = stockBadge(p);
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition">
                        <td className="py-3 pr-3 text-orange-500 font-medium text-xs">{p.codigo}</td>
                        <td className="py-3 pr-3 text-gray-800 font-medium max-w-[160px]">
                          <span className="line-clamp-2">{p.nome}</span>
                        </td>
                        <td className="py-3 pr-3 text-gray-500 text-xs">{p.categoria}</td>
                        <td className="py-3 pr-3 text-gray-500 text-xs uppercase">{p.unidade}</td>
                        <td className="py-3 pr-3 text-gray-600 text-xs">{fmt(p.custoMedio)}</td>
                        <td className="py-3 pr-3 font-semibold text-gray-800">{fmt(p.precoVenda)}</td>
                        <td className="py-3 pr-3 text-gray-600 text-xs">{fmtN(p.markup)}%</td>
                        <td className={`py-3 pr-3 text-xs font-medium ${p.margem >= 25 ? 'text-green-600' : p.margem >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {fmtN(p.margem)}%
                        </td>
                        <td className="py-3 pr-3">
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${sc}`}>
                            {fmtN(p.estoqueAtual)} {p.unidade}
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-gray-400 text-xs">{p.estoqueMinimo}/{p.estoqueMaximo}</td>
                        <td className="py-3 pr-3 text-gray-400 text-xs">{p.localArmazenamento || '—'}</td>
                        <td className="py-3 pr-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            sb === 'Crítico' ? 'bg-red-100 text-red-700' :
                            sb === 'Baixo' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>{sb}</span>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => setShowAjusteModal(p)}
                            className="text-xs text-blue-500 hover:text-blue-700 whitespace-nowrap"
                          >
                            Ajustar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Movimentações Tab */}
      {tab === 'movimentacoes' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Movimentações de Estoque</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Tipo', 'Produto', 'Quantidade', 'Motivo', 'Documento', 'Data', 'Responsável', 'Ant.', 'Post.'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-2 pr-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mockMovimentacoes.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-1.5">
                        {movTipoIcon[m.tipo]}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${movTipoBadge[m.tipo]}`}>
                          {m.tipo}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-gray-700 font-medium max-w-[160px] truncate">{m.produto}</td>
                    <td className={`py-3 pr-3 font-bold ${m.tipo === 'saida' ? 'text-red-500' : m.tipo === 'ajuste' ? 'text-yellow-600' : 'text-green-600'}`}>
                      {m.tipo === 'saida' ? '-' : m.tipo === 'ajuste' && m.quantidade < 0 ? '' : '+'}{m.quantidade}
                    </td>
                    <td className="py-3 pr-3 text-gray-500 text-xs max-w-[150px] truncate">{m.motivo}</td>
                    <td className="py-3 pr-3 text-gray-400 text-xs">{m.documentoRef || '—'}</td>
                    <td className="py-3 pr-3 text-gray-500 text-xs">{new Date(m.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 pr-3 text-gray-500 text-xs">{m.responsavel}</td>
                    <td className="py-3 pr-3 text-gray-400 text-xs">{m.estoqueAnterior}</td>
                    <td className="py-3 text-gray-700 font-medium text-xs">{m.estoquePosterior}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alertas Tab */}
      {tab === 'alertas' && (
        <div className="space-y-4">
          {criticos.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
              <CheckCircle size={40} className="mx-auto text-green-400 mb-3" />
              <p className="text-gray-500 font-medium">Nenhum produto com estoque crítico</p>
            </div>
          ) : (
            <>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">
                  {criticos.length} produto(s) abaixo do estoque mínimo. Realize pedidos de reposição.
                </p>
              </div>
              <div className="grid gap-3">
                {criticos.map(p => {
                  const deficit = p.estoqueMinimo - p.estoqueAtual;
                  const sugestaoCompra = p.estoqueMaximo - p.estoqueAtual;
                  return (
                    <div key={p.id} className="bg-white rounded-xl border border-red-100 shadow-sm p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">{p.codigo}</span>
                            <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">CRÍTICO</span>
                          </div>
                          <p className="font-semibold text-gray-800 mt-1">{p.nome}</p>
                          <p className="text-xs text-gray-500">{p.categoria} • {p.localArmazenamento}</p>
                        </div>
                        <button className="text-sm text-orange-500 hover:text-orange-700 font-medium border border-orange-200 rounded-lg px-3 py-1.5">
                          Pedir Compra
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-3 mt-3">
                        <div className="bg-red-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500">Atual</p>
                          <p className="font-bold text-red-600">{p.estoqueAtual} {p.unidade}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500">Mínimo</p>
                          <p className="font-bold text-gray-700">{p.estoqueMinimo} {p.unidade}</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500">Déficit</p>
                          <p className="font-bold text-orange-600">{deficit} {p.unidade}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-gray-500">Sugestão Compra</p>
                          <p className="font-bold text-green-600">{sugestaoCompra} {p.unidade}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Valor estimado de reposição: <span className="font-semibold text-gray-600">{fmt(sugestaoCompra * p.custoUltimo)}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal Novo Produto */}
      {showProdModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-900">Novo Produto</h3>
              <button onClick={() => setShowProdModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Código *</label>
                  <input type="text" value={prodForm.codigo} onChange={e => setProdForm(f => ({ ...f, codigo: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="CIM001" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">NCM</label>
                  <input type="text" value={prodForm.ncm} onChange={e => setProdForm(f => ({ ...f, ncm: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="0000.00.00" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nome do Produto *</label>
                  <input type="text" value={prodForm.nome} onChange={e => setProdForm(f => ({ ...f, nome: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="Nome completo do produto" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Categoria</label>
                  <select value={prodForm.categoria} onChange={e => setProdForm(f => ({ ...f, categoria: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                    <option value="">Selecionar...</option>
                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Unidade</label>
                  <select value={prodForm.unidade} onChange={e => setProdForm(f => ({ ...f, unidade: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                    {['un','cx','kg','mt','m2','m3','lt','sc','pc','rl','fd','pç'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Custo Médio (R$)</label>
                  <input type="number" value={prodForm.custoMedio} onChange={e => setProdForm(f => ({ ...f, custoMedio: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="0,00" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Preço de Venda (R$)</label>
                  <input type="number" value={prodForm.precoVenda} onChange={e => setProdForm(f => ({ ...f, precoVenda: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="0,00" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Estoque Atual</label>
                  <input type="number" value={prodForm.estoqueAtual} onChange={e => setProdForm(f => ({ ...f, estoqueAtual: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Estoque Mínimo</label>
                  <input type="number" value={prodForm.estoqueMinimo} onChange={e => setProdForm(f => ({ ...f, estoqueMinimo: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Estoque Máximo</label>
                  <input type="number" value={prodForm.estoqueMaximo} onChange={e => setProdForm(f => ({ ...f, estoqueMaximo: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Local de Armazenamento</label>
                  <input type="text" value={prodForm.localArmazenamento} onChange={e => setProdForm(f => ({ ...f, localArmazenamento: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="Galpão A, Loja..." />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowProdModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={() => setShowProdModal(false)} className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">Salvar Produto</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajuste de Estoque */}
      {showAjusteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Ajuste de Estoque</h3>
              <button onClick={() => setShowAjusteModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-orange-50 rounded-xl p-3">
                <p className="font-semibold text-gray-800">{showAjusteModal.nome}</p>
                <p className="text-sm text-gray-500">Estoque atual: <span className="font-bold text-orange-500">{showAjusteModal.estoqueAtual} {showAjusteModal.unidade}</span></p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade (use negativo para baixa)</label>
                <input
                  type="number"
                  value={ajusteQty}
                  onChange={e => setAjusteQty(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="Ex: +10 ou -5"
                />
                {ajusteQty && (
                  <p className="text-xs mt-1 text-gray-500">
                    Novo estoque: <span className="font-bold text-orange-500">
                      {showAjusteModal.estoqueAtual + Number(ajusteQty)} {showAjusteModal.unidade}
                    </span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Motivo *</label>
                <select
                  value={ajusteMotivo}
                  onChange={e => setAjusteMotivo(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  <option value="">Selecionar motivo...</option>
                  <option value="Inventário">Inventário</option>
                  <option value="Quebra/Avaria">Quebra/Avaria</option>
                  <option value="Furto">Furto</option>
                  <option value="Doação">Doação</option>
                  <option value="Devolução">Devolução</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowAjusteModal(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button
                onClick={() => setShowAjusteModal(null)}
                disabled={!ajusteQty || !ajusteMotivo}
                className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-40"
              >
                Confirmar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
