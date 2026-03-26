import React, { useState } from 'react';
import {
  Search, Filter, Plus, Printer, X, Trash2, ShoppingBag,
  TrendingUp, DollarSign, Package
} from 'lucide-react';
import { Venda, StatusVenda, ItemVenda, FormaPagamento } from '../../types';
import { mockVendas, mockClientes, mockProdutos } from '../../data/mockData';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const statusMeta: Record<StatusVenda, { label: string; color: string }> = {
  orcamento:    { label: 'Orçamento',    color: 'bg-gray-100 text-gray-600' },
  aprovado:     { label: 'Aprovado',     color: 'bg-blue-100 text-blue-700' },
  em_separacao: { label: 'Em Separação', color: 'bg-yellow-100 text-yellow-700' },
  entregue:     { label: 'Entregue',     color: 'bg-green-100 text-green-700' },
  cancelado:    { label: 'Cancelado',    color: 'bg-red-100 text-red-700' },
  devolvido:    { label: 'Devolvido',    color: 'bg-purple-100 text-purple-700' },
};

interface CartItem extends ItemVenda {}

export default function VendasView() {
  const [tab, setTab] = useState<'pedidos' | 'nova'>('pedidos');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Nova venda state
  const [clienteSel, setClienteSel] = useState('');
  const [vendedor, setVendedor] = useState('Carlos Lobato');
  const [tipoEntrega, setTipoEntrega] = useState<'retirada' | 'entrega'>('retirada');
  const [formaPag, setFormaPag] = useState<FormaPagamento>('dinheiro');
  const [parcelas, setParcelas] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [produtoSearch, setProdutoSearch] = useState('');
  const [obs, setObs] = useState('');
  const [descGlobal, setDescGlobal] = useState(0);
  const [frete, setFrete] = useState(0);

  const filtered = mockVendas.filter(v => {
    const matchSearch = !search || v.numero.toLowerCase().includes(search.toLowerCase()) ||
      (v.cliente || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'todos' || v.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalVendido = mockVendas.reduce((s, v) => s + v.total, 0);
  const ticketMedio = mockVendas.length > 0 ? totalVendido / mockVendas.length : 0;

  const cartSubtotal = cartItems.reduce((s, i) => s + i.total, 0);
  const cartTotal = cartSubtotal - descGlobal + frete;

  const addProduct = (pid: string) => {
    const p = mockProdutos.find(x => x.id === pid);
    if (!p) return;
    const existing = cartItems.find(i => i.produtoId === pid);
    if (existing) {
      setCartItems(prev => prev.map(i => i.produtoId === pid
        ? { ...i, quantidade: i.quantidade + 1, total: (i.quantidade + 1) * i.precoUnitario * (1 - i.desconto / 100) }
        : i
      ));
    } else {
      setCartItems(prev => [...prev, {
        id: `ci-${Date.now()}`,
        produtoId: p.id,
        produto: p.nome,
        codigo: p.codigo,
        quantidade: 1,
        unidade: p.unidade,
        precoUnitario: p.precoVenda,
        desconto: 0,
        total: p.precoVenda,
      }]);
    }
    setProdutoSearch('');
  };

  const updateCartItem = (id: string, qty: number, desc: number) => {
    setCartItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const total = qty * i.precoUnitario * (1 - desc / 100);
      return { ...i, quantidade: qty, desconto: desc, total };
    }));
  };

  const removeCartItem = (id: string) => setCartItems(prev => prev.filter(i => i.id !== id));

  const filteredProds = mockProdutos.filter(p =>
    produtoSearch && (
      p.nome.toLowerCase().includes(produtoSearch.toLowerCase()) ||
      p.codigo.toLowerCase().includes(produtoSearch.toLowerCase())
    )
  ).slice(0, 6);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestão de pedidos e vendas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6 w-fit">
        {[{ key: 'pedidos', label: 'Pedidos' }, { key: 'nova', label: 'Nova Venda' }].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.key ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pedidos' && (
        <div className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-orange-500" />
                <span className="text-xs text-gray-500 font-medium">Total Vendido</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{fmt(totalVendido)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag size={16} className="text-blue-500" />
                <span className="text-xs text-gray-500 font-medium">Qtd Vendas</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{mockVendas.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={16} className="text-green-500" />
                <span className="text-xs text-gray-500 font-medium">Ticket Médio</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{fmt(ticketMedio)}</p>
            </div>
          </div>

          {/* Filters + Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar pedido ou cliente..."
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="orcamento">Orçamento</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="em_separacao">Em Separação</option>
                  <option value="entregue">Entregue</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <button className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50">
                <Printer size={14} />
                Exportar
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Nº Pedido', 'Cliente', 'Vendedor', 'Data', 'Itens', 'Total', 'Pagamento', 'Status', 'Ações'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-2 pr-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(v => {
                    const s = statusMeta[v.status];
                    return (
                      <tr key={v.id} className="hover:bg-gray-50 transition">
                        <td className="py-3 pr-3 text-orange-500 font-semibold">{v.numero}</td>
                        <td className="py-3 pr-3 text-gray-700 max-w-[140px] truncate">{v.cliente || 'Consumidor Final'}</td>
                        <td className="py-3 pr-3 text-gray-500 text-xs">{v.vendedor}</td>
                        <td className="py-3 pr-3 text-gray-500 text-xs">{new Date(v.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                        <td className="py-3 pr-3 text-gray-500 text-xs">{v.itens.length} item(s)</td>
                        <td className="py-3 pr-3 font-bold text-gray-800">{fmt(v.total)}</td>
                        <td className="py-3 pr-3 text-gray-500 text-xs capitalize">{v.formaPagamento.replace('_', ' ')}</td>
                        <td className="py-3 pr-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
                        </td>
                        <td className="py-3">
                          <button className="text-xs text-gray-400 hover:text-gray-600">
                            <Printer size={14} />
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

      {tab === 'nova' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Client + Products */}
          <div className="lg:col-span-2 space-y-4">
            {/* Client & Vendor */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Dados da Venda</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cliente</label>
                  <select
                    value={clienteSel}
                    onChange={e => setClienteSel(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    <option value="">Consumidor Final</option>
                    {mockClientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Vendedor</label>
                  <select
                    value={vendedor}
                    onChange={e => setVendedor(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    <option>Carlos Lobato</option>
                    <option>Ana Lima</option>
                    <option>Pedro Santos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de Entrega</label>
                  <div className="flex gap-2">
                    {(['retirada', 'entrega'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setTipoEntrega(t)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${
                          tipoEntrega === t ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {t === 'retirada' ? 'Retirada' : 'Entrega'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
                  <input
                    type="text"
                    value={obs}
                    onChange={e => setObs(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="Observações da venda..."
                  />
                </div>
              </div>
            </div>

            {/* Product Search */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Adicionar Produtos</h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={produtoSearch}
                  onChange={e => setProdutoSearch(e.target.value)}
                  placeholder="Buscar por nome ou código..."
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                {filteredProds.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                    {filteredProds.map(p => (
                      <button
                        key={p.id}
                        onClick={() => addProduct(p.id)}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-orange-50 text-left transition border-b border-gray-50 last:border-0"
                      >
                        <div>
                          <span className="text-sm font-medium text-gray-800">{p.nome}</span>
                          <span className="text-xs text-gray-400 ml-2">{p.codigo}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-orange-500">{fmt(p.precoVenda)}</p>
                          <p className="text-xs text-gray-400">Estoque: {p.estoqueAtual} {p.unidade}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Items */}
              <div className="mt-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Package size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Nenhum produto adicionado</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {['Produto', 'Qtd', 'Preço Unit.', 'Desc%', 'Total', ''].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-2 pr-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {cartItems.map(item => (
                        <tr key={item.id}>
                          <td className="py-2 pr-2 text-gray-700 max-w-[160px] truncate">
                            <span className="block text-xs text-gray-400">{item.codigo}</span>
                            {item.produto}
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              type="number"
                              min={1}
                              value={item.quantidade}
                              onChange={e => updateCartItem(item.id, Number(e.target.value), item.desconto)}
                              className="w-16 border border-gray-200 rounded px-2 py-1 text-sm text-center"
                            />
                          </td>
                          <td className="py-2 pr-2 text-gray-600">{fmt(item.precoUnitario)}</td>
                          <td className="py-2 pr-2">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={item.desconto}
                              onChange={e => updateCartItem(item.id, item.quantidade, Number(e.target.value))}
                              className="w-16 border border-gray-200 rounded px-2 py-1 text-sm text-center"
                            />
                          </td>
                          <td className="py-2 pr-2 font-bold text-gray-800">{fmt(item.total)}</td>
                          <td className="py-2">
                            <button onClick={() => removeCartItem(item.id)} className="text-red-400 hover:text-red-600">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Right: Payment + Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Pagamento</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Forma de Pagamento</label>
                  <select
                    value={formaPag}
                    onChange={e => setFormaPag(e.target.value as FormaPagamento)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    <option value="dinheiro">Dinheiro</option>
                    <option value="pix">PIX</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="boleto">Boleto</option>
                    <option value="crediario">Crediário</option>
                    <option value="transferencia">Transferência</option>
                  </select>
                </div>
                {(formaPag === 'cartao_credito' || formaPag === 'boleto' || formaPag === 'crediario') && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Parcelas</label>
                    <select
                      value={parcelas}
                      onChange={e => setParcelas(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    >
                      {[1,2,3,4,5,6,10,12].map(n => (
                        <option key={n} value={n}>{n}x {n > 1 ? fmt(cartTotal / n) : ''}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Desconto Global (R$)</label>
                  <input
                    type="number"
                    value={descGlobal}
                    onChange={e => setDescGlobal(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Frete (R$)</label>
                  <input
                    type="number"
                    value={frete}
                    onChange={e => setFrete(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    min={0}
                  />
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Resumo</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{fmt(cartSubtotal)}</span>
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
                  <span className="text-orange-500">{fmt(cartTotal)}</span>
                </div>
              </div>
              <button
                disabled={cartItems.length === 0}
                className="w-full mt-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Finalizar Venda
              </button>
              <button
                disabled={cartItems.length === 0}
                className="w-full mt-2 py-2.5 border border-orange-300 text-orange-500 rounded-lg font-medium hover:bg-orange-50 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
              >
                Salvar como Orçamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
