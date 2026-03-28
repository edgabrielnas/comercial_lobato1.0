import React, { useState } from 'react';
import {
  Search, Plus, X, Printer, CheckCircle, Clock,
  FileText, Eye, ArrowRight, Trash2, MapPin, User
} from 'lucide-react';
import { Orcamento, StatusOrcamento, ItemVenda, LocalObra } from '../../types';
import { mockOrcamentos, mockClientes, mockProdutos } from '../../data/mockData';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

type Tab = 'lista' | 'novo';

const statusMeta: Record<StatusOrcamento, { label: string; color: string }> = {
  rascunho:   { label: 'Rascunho',   color: 'bg-gray-100 text-gray-600' },
  enviado:    { label: 'Enviado',    color: 'bg-blue-100 text-blue-700' },
  aprovado:   { label: 'Aprovado',   color: 'bg-green-100 text-green-700' },
  reprovado:  { label: 'Reprovado',  color: 'bg-red-100 text-red-700' },
  expirado:   { label: 'Expirado',   color: 'bg-gray-100 text-gray-500' },
  convertido: { label: 'Convertido', color: 'bg-purple-100 text-purple-700' },
};

export default function OrcamentosView() {
  const [tab, setTab] = useState<Tab>('lista');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [search, setSearch] = useState('');
  const [viewOrc, setViewOrc] = useState<Orcamento | null>(null);

  // Nova Orçamento State
  const [clienteSel, setClienteSel] = useState('');
  const [vendedor, setVendedor] = useState('Carlos Lobato');
  const [localObra, setLocalObra] = useState<LocalObra>({ nome: '', endereco: '', responsavel: '', contato: '' });
  const [itens, setItens] = useState<ItemVenda[]>([]);
  const [prodSearch, setProdSearch] = useState('');
  const [condicaoPag, setCondicaoPag] = useState('À vista');
  const [prazoEntrega, setPrazoEntrega] = useState('5 dias úteis');
  const [validade, setValidade] = useState('30');
  const [descGlobal, setDescGlobal] = useState(0);
  const [frete, setFrete] = useState(0);
  const [obs, setObs] = useState('');

  const filtered = mockOrcamentos.filter(o => {
    const matchSearch = !search || o.numero.toLowerCase().includes(search.toLowerCase()) ||
      o.cliente.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'todos' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const kpis = {
    total: mockOrcamentos.length,
    enviados: mockOrcamentos.filter(o => o.status === 'enviado').length,
    aprovados: mockOrcamentos.filter(o => o.status === 'aprovado').length,
    valorTotal: mockOrcamentos.reduce((s, o) => s + o.total, 0),
  };

  const filteredProds = mockProdutos.filter(p =>
    prodSearch.length >= 1 && (
      p.nome.toLowerCase().includes(prodSearch.toLowerCase()) ||
      p.codigo.toLowerCase().includes(prodSearch.toLowerCase())
    )
  ).slice(0, 6);

  const addItem = (pid: string) => {
    const p = mockProdutos.find(x => x.id === pid);
    if (!p) return;
    const existing = itens.find(i => i.produtoId === pid);
    if (existing) {
      setItens(prev => prev.map(i => i.produtoId === pid
        ? { ...i, quantidade: i.quantidade + 1, total: (i.quantidade + 1) * i.precoUnitario * (1 - i.desconto / 100) }
        : i
      ));
    } else {
      setItens(prev => [...prev, {
        id: `oi-${Date.now()}`,
        produtoId: p.id, produto: p.nome, codigo: p.codigo,
        quantidade: 1, unidade: p.unidade,
        precoUnitario: p.precoVenda, desconto: 0, total: p.precoVenda,
      }]);
    }
    setProdSearch('');
  };

  const updateItem = (id: string, field: 'quantidade' | 'precoUnitario' | 'desconto', val: number) => {
    setItens(prev => prev.map(i => {
      if (i.id !== id) return i;
      const updated = { ...i, [field]: val };
      updated.total = updated.quantidade * updated.precoUnitario * (1 - updated.desconto / 100);
      return updated;
    }));
  };

  const removeItem = (id: string) => setItens(prev => prev.filter(i => i.id !== id));

  const subtotal = itens.reduce((s, i) => s + i.total, 0);
  const total = subtotal - descGlobal + frete;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Proposta comercial para clientes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6 w-fit">
        {[
          { key: 'lista', label: 'Lista' },
          { key: 'novo',  label: 'Novo Orçamento' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as Tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.key ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Lista Tab */}
      {tab === 'lista' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500 font-medium">Total Orçamentos</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{kpis.total}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500 font-medium">Enviados</p>
              <p className="text-xl font-bold text-blue-600 mt-1">{kpis.enviados}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500 font-medium">Aprovados</p>
              <p className="text-xl font-bold text-green-600 mt-1">{kpis.aprovados}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500 font-medium">Valor Total</p>
              <p className="text-xl font-bold text-orange-500 mt-1">{fmt(kpis.valorTotal)}</p>
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
                  placeholder="Buscar orçamento ou cliente..."
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="todos">Todos os Status</option>
                {Object.entries(statusMeta).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Número', 'Cliente', 'Local da Obra', 'Vendedor', 'Data', 'Validade', 'Total', 'Status', 'Ações'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-2 pr-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(o => {
                    const s = statusMeta[o.status];
                    return (
                      <tr key={o.id} className="hover:bg-gray-50 transition">
                        <td className="py-3 pr-3 text-orange-500 font-semibold">{o.numero}</td>
                        <td className="py-3 pr-3 text-gray-700 max-w-[130px] truncate">{o.cliente}</td>
                        <td className="py-3 pr-3 text-gray-500 text-xs max-w-[120px] truncate">{o.localObra?.nome || '—'}</td>
                        <td className="py-3 pr-3 text-gray-500 text-xs">{o.vendedor}</td>
                        <td className="py-3 pr-3 text-gray-500 text-xs">{new Date(o.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                        <td className="py-3 pr-3 text-gray-500 text-xs">{new Date(o.validade + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                        <td className="py-3 pr-3 font-bold text-gray-800">{fmt(o.total)}</td>
                        <td className="py-3 pr-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setViewOrc(o)} className="text-gray-400 hover:text-gray-600"><Eye size={14} /></button>
                            <button className="text-gray-400 hover:text-gray-600"><Printer size={14} /></button>
                            {o.status === 'aprovado' && (
                              <button className="text-xs text-green-600 hover:text-green-800 flex items-center gap-0.5 font-medium">
                                <ArrowRight size={12} />Conv.
                              </button>
                            )}
                          </div>
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

      {/* Novo Orçamento Tab */}
      {tab === 'novo' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {/* Client & Vendor */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Dados do Orçamento</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cliente *</label>
                  <select value={clienteSel} onChange={e => setClienteSel(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                    <option value="">Selecionar cliente...</option>
                    {mockClientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Vendedor</label>
                  <select value={vendedor} onChange={e => setVendedor(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                    <option>Carlos Lobato</option>
                    <option>Ana Lima</option>
                    <option>Pedro Santos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Local da Obra */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-orange-500" />
                <h2 className="text-sm font-semibold text-gray-700">Local da Obra</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nome da Obra</label>
                  <input type="text" value={localObra.nome} onChange={e => setLocalObra(f => ({ ...f, nome: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="Ex: Residencial Verdes Mares" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Endereço</label>
                  <input type="text" value={localObra.endereco} onChange={e => setLocalObra(f => ({ ...f, endereco: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="Rua, número, cidade" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Responsável</label>
                  <input type="text" value={localObra.responsavel} onChange={e => setLocalObra(f => ({ ...f, responsavel: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="Nome do responsável" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Contato</label>
                  <input type="text" value={localObra.contato} onChange={e => setLocalObra(f => ({ ...f, contato: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" placeholder="(00) 00000-0000" />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Itens do Orçamento</h2>
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={prodSearch}
                  onChange={e => setProdSearch(e.target.value)}
                  placeholder="Buscar produto por nome ou código..."
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                {filteredProds.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                    {filteredProds.map(p => (
                      <button key={p.id} onClick={() => addItem(p.id)}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-orange-50 text-left transition border-b border-gray-50 last:border-0">
                        <div>
                          <span className="text-sm font-medium text-gray-800">{p.nome}</span>
                          <span className="text-xs text-gray-400 ml-2">{p.codigo}</span>
                        </div>
                        <span className="text-sm font-bold text-orange-500">{fmt(p.precoVenda)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {itens.length === 0 ? (
                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <FileText size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Adicione produtos ao orçamento</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {['Produto', 'Un', 'Qtd', 'Preço Unit.', 'Desc%', 'Total', ''].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-2 pr-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {itens.map(item => (
                        <tr key={item.id}>
                          <td className="py-2.5 pr-2">
                            <p className="text-xs text-gray-400">{item.codigo}</p>
                            <p className="text-gray-700 font-medium">{item.produto}</p>
                          </td>
                          <td className="py-2.5 pr-2 text-gray-500 text-xs uppercase">{item.unidade}</td>
                          <td className="py-2.5 pr-2">
                            <input type="number" min={1} value={item.quantidade}
                              onChange={e => updateItem(item.id, 'quantidade', Number(e.target.value))}
                              className="w-16 border border-gray-200 rounded px-2 py-1 text-sm text-center" />
                          </td>
                          <td className="py-2.5 pr-2">
                            <input type="number" min={0} value={item.precoUnitario}
                              onChange={e => updateItem(item.id, 'precoUnitario', Number(e.target.value))}
                              className="w-24 border border-gray-200 rounded px-2 py-1 text-sm text-right" />
                          </td>
                          <td className="py-2.5 pr-2">
                            <input type="number" min={0} max={100} value={item.desconto}
                              onChange={e => updateItem(item.id, 'desconto', Number(e.target.value))}
                              className="w-14 border border-gray-200 rounded px-2 py-1 text-sm text-center" />
                          </td>
                          <td className="py-2.5 pr-2 font-bold text-gray-800">{fmt(item.total)}</td>
                          <td className="py-2.5">
                            <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right: Conditions + Totals */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Condições Comerciais</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Forma de Pagamento</label>
                  <input type="text" value={condicaoPag} onChange={e => setCondicaoPag(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Prazo de Entrega</label>
                  <input type="text" value={prazoEntrega} onChange={e => setPrazoEntrega(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Validade (dias)</label>
                  <input type="number" value={validade} onChange={e => setValidade(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Desconto Global (R$)</label>
                  <input type="number" value={descGlobal} onChange={e => setDescGlobal(Number(e.target.value))} min={0}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Frete (R$)</label>
                  <input type="number" value={frete} onChange={e => setFrete(Number(e.target.value))} min={0}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
                  <textarea value={obs} onChange={e => setObs(e.target.value)} rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                    placeholder="Observações gerais..." />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Total do Orçamento</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itens.length} item(s))</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Desconto</span>
                  <span className="text-red-500">- {fmt(descGlobal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frete</span>
                  <span>{fmt(frete)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span className="text-orange-500">{fmt(total)}</span>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <button
                  disabled={!clienteSel || itens.length === 0}
                  className="w-full py-2.5 border border-orange-300 text-orange-500 rounded-lg font-medium hover:bg-orange-50 transition disabled:opacity-40 text-sm"
                >
                  Salvar como Rascunho
                </button>
                <button
                  disabled={!clienteSel || itens.length === 0}
                  className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-40"
                >
                  Enviar Orçamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View/Print Modal */}
      {viewOrc && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <h3 className="font-semibold text-gray-900">{viewOrc.numero}</h3>
                <p className="text-xs text-gray-400">{viewOrc.cliente}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                  <Printer size={14} />
                  Imprimir
                </button>
                {viewOrc.status === 'aprovado' && (
                  <button className="flex items-center gap-1.5 text-sm text-white bg-green-500 hover:bg-green-600 border border-green-500 rounded-lg px-3 py-1.5">
                    <ArrowRight size={14} />
                    Converter para Venda
                  </button>
                )}
                <button onClick={() => setViewOrc(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Cliente</p>
                  <p className="font-medium text-gray-800">{viewOrc.cliente}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Vendedor</p>
                  <p className="font-medium text-gray-800">{viewOrc.vendedor}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Data</p>
                  <p className="font-medium text-gray-800">{new Date(viewOrc.data + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Validade</p>
                  <p className="font-medium text-gray-800">{new Date(viewOrc.validade + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                </div>
                {viewOrc.localObra && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 mb-0.5">Local da Obra</p>
                    <p className="font-medium text-gray-800">{viewOrc.localObra.nome}</p>
                    <p className="text-xs text-gray-500">{viewOrc.localObra.endereco}</p>
                  </div>
                )}
              </div>
              <table className="w-full text-sm border-t border-gray-100 pt-3">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Produto', 'Qtd', 'Preço Unit.', 'Desc%', 'Total'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-2 pr-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {viewOrc.itens.map(item => (
                    <tr key={item.id}>
                      <td className="py-2 pr-3 text-gray-700">{item.produto}</td>
                      <td className="py-2 pr-3 text-gray-500">{item.quantidade} {item.unidade}</td>
                      <td className="py-2 pr-3 text-gray-600">{fmt(item.precoUnitario)}</td>
                      <td className="py-2 pr-3 text-gray-500">{item.desconto}%</td>
                      <td className="py-2 font-bold text-gray-800">{fmt(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right space-y-1 text-sm border-t border-gray-100 pt-3">
                <div className="flex justify-end gap-8 text-gray-500">
                  <span>Subtotal: {fmt(viewOrc.subtotal)}</span>
                </div>
                {viewOrc.desconto > 0 && (
                  <div className="flex justify-end gap-8 text-red-500">
                    <span>Desconto: - {fmt(viewOrc.desconto)}</span>
                  </div>
                )}
                {viewOrc.frete > 0 && (
                  <div className="flex justify-end gap-8 text-gray-500">
                    <span>Frete: {fmt(viewOrc.frete)}</span>
                  </div>
                )}
                <div className="flex justify-end gap-8 text-base font-bold text-orange-500">
                  <span>Total: {fmt(viewOrc.total)}</span>
                </div>
              </div>
              {viewOrc.condicaoPagamento && (
                <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                  <p><span className="font-medium">Pagamento:</span> {viewOrc.condicaoPagamento}</p>
                  {viewOrc.prazoEntrega && <p><span className="font-medium">Entrega:</span> {viewOrc.prazoEntrega}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
