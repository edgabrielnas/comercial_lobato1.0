import React, { useState } from 'react';
import {
  Search, Plus, X, Truck, Package, CheckCircle,
  Clock, AlertCircle, FileText, ChevronRight
} from 'lucide-react';
import { PedidoCompra, Fornecedor, StatusPedidoCompra, ItemPedidoCompra } from '../../types';
import { mockPedidosCompra, mockFornecedores, mockProdutos } from '../../data/mockData';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

type Tab = 'pedidos' | 'fornecedores' | 'entrada';

const statusMeta: Record<StatusPedidoCompra, { label: string; color: string; icon: React.ReactNode }> = {
  rascunho:          { label: 'Rascunho',          color: 'bg-gray-100 text-gray-600',   icon: <FileText size={12} /> },
  enviado:           { label: 'Enviado',            color: 'bg-blue-100 text-blue-700',   icon: <Truck size={12} /> },
  confirmado:        { label: 'Confirmado',         color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12} /> },
  recebido_parcial:  { label: 'Rec. Parcial',       color: 'bg-orange-100 text-orange-700', icon: <AlertCircle size={12} /> },
  recebido:          { label: 'Recebido',           color: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> },
  cancelado:         { label: 'Cancelado',          color: 'bg-red-100 text-red-700',     icon: <X size={12} /> },
};

interface NovoPedidoItem {
  produtoId: string;
  produto: string;
  quantidade: string;
  precoUnitario: string;
}

export default function ComprasView() {
  const [tab, setTab] = useState<Tab>('pedidos');
  const [showNovoPedidoModal, setShowNovoPedidoModal] = useState(false);
  const [showFornecedorModal, setShowFornecedorModal] = useState(false);
  const [showEntradaNFModal, setShowEntradaNFModal] = useState<PedidoCompra | null>(null);
  const [selectedPC, setSelectedPC] = useState('');

  const [novoPedido, setNovoPedido] = useState({
    fornecedor: '',
    condicaoPagamento: '30/60/90',
    frete: '0',
    observacoes: '',
    itens: [] as NovoPedidoItem[],
  });

  const [fornForm, setFornForm] = useState({
    razaoSocial: '', nomeFantasia: '', cnpj: '', telefone: '',
    contato: '', prazoEntrega: '5', condicaoPagamento: '30'
  });

  const [entradaNF, setEntradaNF] = useState({ nf: '', itensQtd: {} as Record<string, string> });

  const totalPedidos = mockPedidosCompra.reduce((s, p) => s + p.total, 0);
  const pedidosAbertos = mockPedidosCompra.filter(p => ['enviado', 'confirmado', 'recebido_parcial'].includes(p.status)).length;

  const addItemPedido = () => {
    setNovoPedido(f => ({
      ...f,
      itens: [...f.itens, { produtoId: '', produto: '', quantidade: '1', precoUnitario: '0' }]
    }));
  };

  const updateItemPedido = (i: number, field: keyof NovoPedidoItem, val: string) => {
    setNovoPedido(f => {
      const itens = [...f.itens];
      if (field === 'produtoId') {
        const prod = mockProdutos.find(p => p.id === val);
        itens[i] = { ...itens[i], produtoId: val, produto: prod?.nome || '', precoUnitario: String(prod?.custoUltimo || 0) };
      } else {
        itens[i] = { ...itens[i], [field]: val };
      }
      return { ...f, itens };
    });
  };

  const removeItemPedido = (i: number) => {
    setNovoPedido(f => ({ ...f, itens: f.itens.filter((_, idx) => idx !== i) }));
  };

  const calcTotalNovoPedido = () => {
    const sub = novoPedido.itens.reduce((s, i) => s + Number(i.quantidade) * Number(i.precoUnitario), 0);
    return sub + Number(novoPedido.frete);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compras</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestão de pedidos de compra e fornecedores</p>
        </div>
        <div className="flex gap-2">
          {tab === 'fornecedores' && (
            <button
              onClick={() => setShowFornecedorModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium"
            >
              <Plus size={16} />
              Novo Fornecedor
            </button>
          )}
          {tab === 'pedidos' && (
            <button
              onClick={() => setShowNovoPedidoModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium"
            >
              <Plus size={16} />
              Novo Pedido
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6 w-fit">
        {[
          { key: 'pedidos', label: 'Pedidos de Compra' },
          { key: 'fornecedores', label: 'Fornecedores' },
          { key: 'entrada', label: 'Entrada NF' },
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

      {/* Pedidos Tab */}
      {tab === 'pedidos' && (
        <div className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <Package size={16} className="text-orange-500" />
                <span className="text-xs text-gray-500 font-medium">Total Pedidos</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{fmt(totalPedidos)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} className="text-yellow-500" />
                <span className="text-xs text-gray-500 font-medium">Em Aberto</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{pedidosAbertos}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-xs text-gray-500 font-medium">Recebidos</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {mockPedidosCompra.filter(p => p.status === 'recebido').length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Número', 'Fornecedor', 'Comprador', 'Emissão', 'Previsão', 'Itens', 'Total', 'Status', 'NF', ''].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-2 pr-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mockPedidosCompra.map(pc => {
                  const s = statusMeta[pc.status];
                  return (
                    <tr key={pc.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 pr-3 text-orange-500 font-semibold">{pc.numero}</td>
                      <td className="py-3 pr-3 text-gray-700 max-w-[140px] truncate">{pc.fornecedor}</td>
                      <td className="py-3 pr-3 text-gray-500 text-xs">{pc.comprador}</td>
                      <td className="py-3 pr-3 text-gray-500 text-xs">{new Date(pc.dataEmissao + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                      <td className="py-3 pr-3 text-gray-500 text-xs">{new Date(pc.dataPrevisao + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                      <td className="py-3 pr-3 text-gray-500 text-xs">{pc.itens.length}</td>
                      <td className="py-3 pr-3 font-bold text-gray-800">{fmt(pc.total)}</td>
                      <td className="py-3 pr-3">
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium w-fit ${s.color}`}>
                          {s.icon}{s.label}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-gray-400 text-xs">{pc.notaFiscal || '—'}</td>
                      <td className="py-3">
                        {pc.status !== 'recebido' && (
                          <button
                            onClick={() => { setShowEntradaNFModal(pc); setTab('entrada'); }}
                            className="text-xs text-blue-500 hover:text-blue-700"
                          >
                            Receber
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fornecedores Tab */}
      {tab === 'fornecedores' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Razão Social', 'Fantasia', 'CNPJ', 'Telefone', 'Contato', 'Prazo', 'Cond. Pagto', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-2 pr-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mockFornecedores.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 pr-3 text-gray-800 font-medium">{f.razaoSocial}</td>
                    <td className="py-3 pr-3 text-gray-600">{f.nomeFantasia}</td>
                    <td className="py-3 pr-3 text-gray-500 text-xs">{f.cnpj}</td>
                    <td className="py-3 pr-3 text-gray-500 text-xs">{f.telefone}</td>
                    <td className="py-3 pr-3 text-gray-500 text-xs">{f.contato || '—'}</td>
                    <td className="py-3 pr-3 text-gray-500 text-xs">{f.prazoEntrega}d</td>
                    <td className="py-3 pr-3 text-gray-500 text-xs">{f.condicaoPagamento}</td>
                    <td className="py-3 pr-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${f.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {f.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Entrada NF Tab */}
      {tab === 'entrada' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 max-w-2xl">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Entrada de Nota Fiscal</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pedido de Compra</label>
              <select
                value={selectedPC}
                onChange={e => setSelectedPC(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="">Selecionar pedido...</option>
                {mockPedidosCompra.filter(p => p.status !== 'recebido').map(pc => (
                  <option key={pc.id} value={pc.id}>{pc.numero} — {pc.fornecedor}</option>
                ))}
              </select>
            </div>
            {selectedPC && (() => {
              const pc = mockPedidosCompra.find(p => p.id === selectedPC);
              if (!pc) return null;
              return (
                <>
                  <div className="bg-orange-50 rounded-xl p-3">
                    <p className="text-sm font-semibold text-gray-800">{pc.fornecedor}</p>
                    <p className="text-xs text-gray-500">Pedido: {pc.numero} • {fmt(pc.total)}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Número da Nota Fiscal</label>
                    <input
                      type="text"
                      value={entradaNF.nf}
                      onChange={e => setEntradaNF(f => ({ ...f, nf: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                      placeholder="NF XXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Conferência de Itens</label>
                    <div className="space-y-2">
                      {pc.itens.map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{item.produto}</p>
                            <p className="text-xs text-gray-500">Pedido: {item.quantidade} {item.unidade} • {fmt(item.precoUnitario)}/un</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500">Recebido:</label>
                            <input
                              type="number"
                              value={entradaNF.itensQtd[item.id] ?? item.quantidade}
                              onChange={e => setEntradaNF(f => ({ ...f, itensQtd: { ...f.itensQtd, [item.id]: e.target.value } }))}
                              className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center"
                              min={0}
                              max={item.quantidade}
                            />
                            <span className="text-xs text-gray-400">{item.unidade}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    disabled={!entradaNF.nf}
                    className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-40"
                  >
                    Confirmar Entrada e Atualizar Estoque
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal Novo Pedido */}
      {showNovoPedidoModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-900">Novo Pedido de Compra</h3>
              <button onClick={() => setShowNovoPedidoModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fornecedor *</label>
                  <select
                    value={novoPedido.fornecedor}
                    onChange={e => setNovoPedido(f => ({ ...f, fornecedor: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    <option value="">Selecionar...</option>
                    {mockFornecedores.map(f => <option key={f.id} value={f.id}>{f.nomeFantasia}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Condição de Pagamento</label>
                  <input
                    type="text"
                    value={novoPedido.condicaoPagamento}
                    onChange={e => setNovoPedido(f => ({ ...f, condicaoPagamento: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="30/60/90 dias"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Frete (R$)</label>
                  <input
                    type="number"
                    value={novoPedido.frete}
                    onChange={e => setNovoPedido(f => ({ ...f, frete: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Observações</label>
                  <input
                    type="text"
                    value={novoPedido.observacoes}
                    onChange={e => setNovoPedido(f => ({ ...f, observacoes: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="Observações..."
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-600">Itens do Pedido</label>
                  <button
                    onClick={addItemPedido}
                    className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-700"
                  >
                    <Plus size={12} /> Adicionar Item
                  </button>
                </div>
                {novoPedido.itens.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                    Clique em "Adicionar Item" para incluir produtos
                  </div>
                )}
                {novoPedido.itens.map((item, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 mb-2 items-end">
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Produto</label>
                      <select
                        value={item.produtoId}
                        onChange={e => updateItemPedido(i, 'produtoId', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                      >
                        <option value="">Selecionar produto...</option>
                        {mockProdutos.map(p => <option key={p.id} value={p.id}>{p.nome} ({p.codigo})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Qtd</label>
                      <input
                        type="number"
                        value={item.quantidade}
                        onChange={e => updateItemPedido(i, 'quantidade', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        min={1}
                      />
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Preço Unit.</label>
                        <input
                          type="number"
                          value={item.precoUnitario}
                          onChange={e => updateItemPedido(i, 'precoUnitario', e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                      </div>
                      <button onClick={() => removeItemPedido(i)} className="pb-2 text-red-400 hover:text-red-600">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {novoPedido.itens.length > 0 && (
                  <div className="flex justify-end mt-3">
                    <div className="text-right text-sm">
                      <p className="text-gray-500">Subtotal: {fmt(novoPedido.itens.reduce((s, i) => s + Number(i.quantidade) * Number(i.precoUnitario), 0))}</p>
                      <p className="text-gray-500">Frete: {fmt(Number(novoPedido.frete))}</p>
                      <p className="font-bold text-gray-900">Total: {fmt(calcTotalNovoPedido())}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowNovoPedidoModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={() => setShowNovoPedidoModal(false)} className="flex-1 py-2 border border-orange-300 text-orange-500 rounded-lg text-sm font-medium hover:bg-orange-50">Salvar Rascunho</button>
              <button onClick={() => setShowNovoPedidoModal(false)} className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">Enviar Pedido</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Fornecedor */}
      {showFornecedorModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Novo Fornecedor</h3>
              <button onClick={() => setShowFornecedorModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: 'Razão Social *', key: 'razaoSocial', placeholder: 'Empresa LTDA' },
                { label: 'Nome Fantasia', key: 'nomeFantasia', placeholder: 'Fantasia' },
                { label: 'CNPJ', key: 'cnpj', placeholder: '00.000.000/0001-00' },
                { label: 'Telefone', key: 'telefone', placeholder: '(00) 0000-0000' },
                { label: 'Contato', key: 'contato', placeholder: 'Nome do contato' },
                { label: 'Condição de Pagamento', key: 'condicaoPagamento', placeholder: '30/60' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                  <input
                    type="text"
                    value={(fornForm as any)[field.key]}
                    onChange={e => setFornForm(f => ({ ...f, [field.key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Prazo de Entrega (dias)</label>
                <input
                  type="number"
                  value={fornForm.prazoEntrega}
                  onChange={e => setFornForm(f => ({ ...f, prazoEntrega: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  min={1}
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowFornecedorModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={() => setShowFornecedorModal(false)} className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
