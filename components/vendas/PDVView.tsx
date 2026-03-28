import React, { useState, useRef } from 'react';
import {
  Search, Plus, Minus, Trash2, X, DollarSign,
  CreditCard, Smartphone, FileText, Users, CheckCircle,
  ShoppingCart, Package
} from 'lucide-react';
import { Produto, ItemVenda, FormaPagamento } from '../../types';
import { mockProdutos, mockClientes } from '../../data/mockData';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface CartItem extends ItemVenda {
  descItem: number;
}

const formasPag: { key: FormaPagamento; label: string; icon: React.ReactNode }[] = [
  { key: 'dinheiro',       label: 'Dinheiro',  icon: <DollarSign size={16} /> },
  { key: 'pix',            label: 'PIX',       icon: <Smartphone size={16} /> },
  { key: 'cartao_credito', label: 'Crédito',   icon: <CreditCard size={16} /> },
  { key: 'cartao_debito',  label: 'Débito',    icon: <CreditCard size={16} /> },
  { key: 'boleto',         label: 'Boleto',    icon: <FileText size={16} /> },
  { key: 'crediario',      label: 'Crediário', icon: <FileText size={16} /> },
];

export default function PDVView() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [formaPag, setFormaPag] = useState<FormaPagamento>('dinheiro');
  const [parcelas, setParcelas] = useState(1);
  const [clienteSel, setClienteSel] = useState('');
  const [valorRecebido, setValorRecebido] = useState('');
  const [finalizado, setFinalizado] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredProds = mockProdutos.filter(p =>
    search.length >= 1 && (
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo.toLowerCase().includes(search.toLowerCase())
    )
  );

  const subtotal = cart.reduce((s, i) => s + i.total, 0);
  const totalCart = subtotal;
  const troco = formaPag === 'dinheiro' && valorRecebido
    ? Math.max(0, parseFloat(valorRecebido.replace(',', '.')) - totalCart)
    : 0;

  const addToCart = (prod: Produto) => {
    setCart(prev => {
      const existing = prev.find(i => i.produtoId === prod.id);
      if (existing) {
        return prev.map(i => i.produtoId === prod.id
          ? { ...i, quantidade: i.quantidade + 1, total: (i.quantidade + 1) * i.precoUnitario * (1 - i.descItem / 100) }
          : i
        );
      }
      return [...prev, {
        id: `pdv-${Date.now()}`,
        produtoId: prod.id,
        produto: prod.nome,
        codigo: prod.codigo,
        quantidade: 1,
        unidade: prod.unidade,
        precoUnitario: prod.precoVenda,
        desconto: 0,
        descItem: 0,
        total: prod.precoVenda,
      }];
    });
    setSearch('');
    searchRef.current?.focus();
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev
      .map(i => {
        if (i.id !== id) return i;
        const qty = Math.max(1, i.quantidade + delta);
        return { ...i, quantidade: qty, total: qty * i.precoUnitario * (1 - i.descItem / 100) };
      })
    );
  };

  const setQty = (id: string, qty: number) => {
    if (qty < 1) return;
    setCart(prev => prev.map(i => i.id !== id ? i : {
      ...i, quantidade: qty, total: qty * i.precoUnitario * (1 - i.descItem / 100)
    }));
  };

  const setDescItem = (id: string, desc: number) => {
    const d = Math.min(100, Math.max(0, desc));
    setCart(prev => prev.map(i => i.id !== id ? i : {
      ...i, descItem: d, desconto: d, total: i.quantidade * i.precoUnitario * (1 - d / 100)
    }));
  };

  const removeItem = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart = () => { setCart([]); setFinalizado(false); setValorRecebido(''); };

  const finalize = () => {
    if (cart.length === 0) return;
    setFinalizado(true);
  };

  if (finalizado) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Venda Finalizada!</h2>
          <p className="text-gray-500 text-sm mb-4">Total: <span className="font-bold text-orange-500 text-lg">{fmt(totalCart)}</span></p>
          {formaPag === 'dinheiro' && valorRecebido && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Recebido:</span>
                <span className="font-semibold">{fmt(parseFloat(valorRecebido.replace(',', '.')))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Troco:</span>
                <span className="font-bold text-green-600">{fmt(troco)}</span>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Imprimir Cupom
            </button>
            <button
              onClick={clearCart}
              className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
            >
              Nova Venda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* Left Panel — Products */}
      <div className="flex-1 flex flex-col bg-gray-50 border-r border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-gray-900">PDV — Caixa</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users size={14} />
              <select
                value={clienteSel}
                onChange={e => setClienteSel(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="">Consumidor Final</option>
                {mockClientes.filter(c => c.status === 'ativo').map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome ou código do produto..."
              autoFocus
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-gray-50"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {search ? (
            filteredProds.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Package size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Nenhum produto encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredProds.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className={`bg-white rounded-xl border-2 p-3 text-left hover:border-orange-400 hover:shadow-md transition group ${
                      p.estoqueAtual === 0 ? 'opacity-50 cursor-not-allowed' : 'border-gray-200'
                    }`}
                    disabled={p.estoqueAtual === 0}
                  >
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-2 group-hover:bg-orange-100 transition">
                      <Package size={18} className="text-orange-400" />
                    </div>
                    <p className="text-xs text-gray-400">{p.codigo}</p>
                    <p className="text-sm font-semibold text-gray-800 leading-tight mt-0.5 line-clamp-2">{p.nome}</p>
                    <p className="text-orange-500 font-bold mt-1">{fmt(p.precoVenda)}</p>
                    <p className="text-xs text-gray-400">Estoque: {p.estoqueAtual} {p.unidade}</p>
                  </button>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-16 text-gray-400">
              <Search size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Digite para buscar produtos</p>
              <p className="text-xs mt-1">Busque por nome ou código de barras</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel — Cart + Payment */}
      <div className="w-96 flex flex-col bg-white border-l border-gray-200 shadow-lg overflow-hidden">
        {/* Cart Header */}
        <div className="bg-orange-500 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} />
            <span className="font-semibold">Carrinho</span>
            <span className="bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {cart.reduce((s, i) => s + i.quantidade, 0)}
            </span>
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-orange-200 hover:text-white text-xs flex items-center gap-1">
              <X size={12} /> Limpar
            </button>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
              <ShoppingCart size={40} className="opacity-30 mb-3" />
              <p className="text-sm font-medium">Carrinho vazio</p>
              <p className="text-xs mt-1 text-center">Busque produtos ao lado para adicionar</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {cart.map(item => (
                <div key={item.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400">{item.codigo}</p>
                      <p className="text-sm font-medium text-gray-800 truncate">{item.produto}</p>
                      <p className="text-xs text-gray-500">{fmt(item.precoUnitario)} / {item.unidade}</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 ml-2 flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center"
                      >
                        <Minus size={12} />
                      </button>
                      <input
                        type="number"
                        value={item.quantidade}
                        onChange={e => setQty(item.id, Number(e.target.value))}
                        className="w-12 text-center border border-gray-200 rounded-lg py-1 text-sm font-semibold"
                        min={1}
                      />
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-7 h-7 bg-orange-100 hover:bg-orange-200 rounded-lg flex items-center justify-center text-orange-500"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={item.descItem}
                          onChange={e => setDescItem(item.id, Number(e.target.value))}
                          className="w-14 border border-gray-200 rounded-lg py-1 px-2 text-xs text-center"
                          placeholder="Desc%"
                          min={0}
                          max={100}
                        />
                        <span className="text-xs text-gray-400">%</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-20 text-right">{fmt(item.total)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Section */}
        <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Total</span>
            <span className="text-2xl font-extrabold text-orange-500">{fmt(totalCart)}</span>
          </div>

          {/* Payment methods */}
          <div className="grid grid-cols-3 gap-1.5">
            {formasPag.map(f => (
              <button
                key={f.key}
                onClick={() => setFormaPag(f.key)}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-medium border transition ${
                  formaPag === f.key
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                }`}
              >
                {f.icon}
                {f.label}
              </button>
            ))}
          </div>

          {/* Parcelas for card */}
          {(formaPag === 'cartao_credito' || formaPag === 'boleto' || formaPag === 'crediario') && (
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Parcelas</label>
              <select
                value={parcelas}
                onChange={e => setParcelas(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                {[1,2,3,4,5,6,10,12].map(n => (
                  <option key={n} value={n}>{n}x {n > 1 ? `de ${fmt(totalCart / n)}` : '(à vista)'}</option>
                ))}
              </select>
            </div>
          )}

          {/* Troco for dinheiro */}
          {formaPag === 'dinheiro' && (
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Valor Recebido (R$)</label>
              <input
                type="text"
                value={valorRecebido}
                onChange={e => setValorRecebido(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="0,00"
              />
              {valorRecebido && (
                <div className="flex justify-between items-center mt-1.5 bg-green-50 rounded-lg px-3 py-1.5">
                  <span className="text-xs text-green-700 font-medium">Troco:</span>
                  <span className="text-sm font-bold text-green-700">{fmt(troco)}</span>
                </div>
              )}
            </div>
          )}

          {/* Quick amount buttons */}
          {formaPag === 'dinheiro' && (
            <div className="grid grid-cols-4 gap-1">
              {[50, 100, 200, 500].map(v => (
                <button
                  key={v}
                  onClick={() => setValorRecebido(String(v))}
                  className="py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition"
                >
                  R${v}
                </button>
              ))}
            </div>
          )}

          {/* Finalize */}
          <button
            onClick={finalize}
            disabled={cart.length === 0}
            className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-bold text-base hover:bg-orange-600 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-orange-200"
          >
            Finalizar Venda {cart.length > 0 ? `— ${fmt(totalCart)}` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
