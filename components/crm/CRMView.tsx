import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  Search, Plus, X, Phone, Mail, MessageCircle, Users,
  TrendingUp, DollarSign, Star, Filter, Calendar, User,
  MapPin, Building2, Tag
} from 'lucide-react';
import { Cliente, OportunidadeCRM, ContatoCRM, SegmentoCliente, StatusCliente } from '../../types';
import {
  mockClientes, mockOportunidades, mockContatos
} from '../../data/mockData';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

type Tab = 'clientes' | 'oportunidades' | 'contatos' | 'funil';

const segmentoColors: Record<SegmentoCliente, string> = {
  particular:   'bg-blue-100 text-blue-700',
  construtora:  'bg-purple-100 text-purple-700',
  empreiteira:  'bg-orange-100 text-orange-700',
  revenda:      'bg-green-100 text-green-700',
  prefeitura:   'bg-yellow-100 text-yellow-700',
  outros:       'bg-gray-100 text-gray-600',
};

const statusClienteColors: Record<StatusCliente, string> = {
  ativo:     'bg-green-100 text-green-700',
  inativo:   'bg-gray-100 text-gray-500',
  prospecto: 'bg-blue-100 text-blue-600',
  bloqueado: 'bg-red-100 text-red-700',
};

const etapaOrder = ['lead', 'qualificado', 'proposta', 'negociacao', 'fechado_ganho', 'fechado_perdido'] as const;
const etapaLabel: Record<string, string> = {
  lead: 'Lead', qualificado: 'Qualificado', proposta: 'Proposta',
  negociacao: 'Negociação', fechado_ganho: 'Ganho', fechado_perdido: 'Perdido'
};
const etapaColors: Record<string, string> = {
  lead: 'bg-gray-100 text-gray-600', qualificado: 'bg-blue-100 text-blue-700',
  proposta: 'bg-yellow-100 text-yellow-700', negociacao: 'bg-orange-100 text-orange-700',
  fechado_ganho: 'bg-green-100 text-green-700', fechado_perdido: 'bg-red-100 text-red-700'
};

const contatoIcon: Record<string, React.ReactNode> = {
  ligacao:   <Phone size={14} className="text-blue-500" />,
  email:     <Mail size={14} className="text-purple-500" />,
  whatsapp:  <MessageCircle size={14} className="text-green-500" />,
  visita:    <MapPin size={14} className="text-orange-500" />,
  reuniao:   <Users size={14} className="text-indigo-500" />,
  orcamento: <Star size={14} className="text-yellow-500" />,
};

const COLORS = ['#6b7280', '#3b82f6', '#eab308', '#f97316', '#22c55e', '#ef4444'];

export default function CRMView() {
  const [tab, setTab] = useState<Tab>('clientes');
  const [search, setSearch] = useState('');
  const [filterSeg, setFilterSeg] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showOportModal, setShowOportModal] = useState(false);

  const [clienteForm, setClienteForm] = useState({
    nome: '', cpf: '', cnpj: '', telefone: '', email: '',
    segmento: 'particular' as SegmentoCliente, limiteCredito: '', logradouro: '',
    bairro: '', cidade: '', estado: 'CE'
  });
  const [oportForm, setOportForm] = useState({
    titulo: '', cliente: '', valor: '', probabilidade: '50',
    etapa: 'lead', vendedor: 'Carlos Lobato', dataFechamento: ''
  });

  const filteredClientes = mockClientes.filter(c => {
    const matchSearch = !search || c.nome.toLowerCase().includes(search.toLowerCase()) ||
      (c.cpf || c.cnpj || '').includes(search) || c.telefone.includes(search);
    const matchSeg = filterSeg === 'todos' || c.segmento === filterSeg;
    const matchStatus = filterStatus === 'todos' || c.status === filterStatus;
    return matchSearch && matchSeg && matchStatus;
  });

  const kpiClientes = {
    total: mockClientes.length,
    ativos: mockClientes.filter(c => c.status === 'ativo').length,
    totalCompras: mockClientes.reduce((s, c) => s + c.totalCompras, 0),
    limiteTotal: mockClientes.reduce((s, c) => s + c.limiteCredito, 0),
  };

  const funilData = etapaOrder.slice(0, 5).map(e => ({
    name: etapaLabel[e],
    count: mockOportunidades.filter(o => o.etapa === e).length,
    valor: mockOportunidades.filter(o => o.etapa === e).reduce((s, o) => s + o.valor, 0),
  }));

  const tabs = [
    { key: 'clientes',       label: 'Clientes' },
    { key: 'oportunidades',  label: 'Oportunidades' },
    { key: 'contatos',       label: 'Contatos' },
    { key: 'funil',          label: 'Funil' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestão de clientes e relacionamento</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowOportModal(true)}
            className="flex items-center gap-2 px-3 py-2 border border-orange-300 text-orange-500 rounded-lg hover:bg-orange-50 transition text-sm font-medium"
          >
            <Plus size={14} />
            Oportunidade
          </button>
          <button
            onClick={() => setShowClienteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium"
          >
            <Plus size={14} />
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6 w-fit">
        {tabs.map(t => (
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

      {/* Clientes Tab */}
      {tab === 'clientes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: <Users size={16} className="text-orange-500" />, label: 'Total Clientes', value: String(kpiClientes.total), bg: 'bg-orange-50' },
              { icon: <Star size={16} className="text-green-500" />, label: 'Ativos', value: String(kpiClientes.ativos), bg: 'bg-green-50' },
              { icon: <DollarSign size={16} className="text-blue-500" />, label: 'Total Compras', value: fmt(kpiClientes.totalCompras), bg: 'bg-blue-50' },
              { icon: <TrendingUp size={16} className="text-purple-500" />, label: 'Limite Crédito', value: fmt(kpiClientes.limiteTotal), bg: 'bg-purple-50' },
            ].map((k, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className={`w-8 h-8 ${k.bg} rounded-lg flex items-center justify-center mb-2`}>{k.icon}</div>
                <p className="text-xs text-gray-500 font-medium">{k.label}</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">{k.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar cliente..."
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <select value={filterSeg} onChange={e => setFilterSeg(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                <option value="todos">Todos Segmentos</option>
                <option value="particular">Particular</option>
                <option value="construtora">Construtora</option>
                <option value="empreiteira">Empreiteira</option>
                <option value="revenda">Revenda</option>
                <option value="prefeitura">Prefeitura</option>
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                <option value="todos">Todos Status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="prospecto">Prospecto</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Nome', 'CPF/CNPJ', 'Telefone', 'Segmento', 'Status', 'Limite', 'Última Compra', 'Total Compras'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-2 pr-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredClientes.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 transition">
                      <td className="py-3 pr-3">
                        <p className="font-medium text-gray-800">{c.nome}</p>
                        {c.razaoSocial && <p className="text-xs text-gray-400">{c.razaoSocial}</p>}
                      </td>
                      <td className="py-3 pr-3 text-gray-500 text-xs">{c.cpf || c.cnpj || '—'}</td>
                      <td className="py-3 pr-3 text-gray-500 text-xs">{c.telefone}</td>
                      <td className="py-3 pr-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${segmentoColors[c.segmento]}`}>
                          {c.segmento}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClienteColors[c.status]}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-gray-600 text-xs">{fmt(c.limiteCredito)}</td>
                      <td className="py-3 pr-3 text-gray-500 text-xs">
                        {c.ultimaCompra ? new Date(c.ultimaCompra + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="py-3 font-semibold text-gray-700">{fmt(c.totalCompras)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Oportunidades Tab — Kanban */}
      {tab === 'oportunidades' && (
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-4">
            {etapaOrder.map(etapa => {
              const ops = mockOportunidades.filter(o => o.etapa === etapa);
              const totalVal = ops.reduce((s, o) => s + o.valor, 0);
              return (
                <div key={etapa} className="w-72 flex-shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${etapaColors[etapa]}`}>
                        {etapaLabel[etapa]}
                      </span>
                      <span className="bg-gray-200 text-gray-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {ops.length}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{fmt(totalVal)}</span>
                  </div>
                  <div className="space-y-3 min-h-[200px]">
                    {ops.map(op => {
                      const cliente = mockClientes.find(c => c.id === op.clienteId);
                      return (
                        <div key={op.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-orange-300 hover:shadow-md transition cursor-pointer">
                          <p className="font-semibold text-gray-800 text-sm leading-tight mb-2">{op.titulo}</p>
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <User size={10} />{cliente?.nome || '—'}
                          </p>
                          <p className="text-lg font-bold text-orange-500">{fmt(op.valor)}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <div className="w-full bg-gray-200 rounded-full h-1.5 w-16">
                                <div
                                  className="bg-orange-400 h-1.5 rounded-full"
                                  style={{ width: `${op.probabilidade}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 ml-1">{op.probabilidade}%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                            <span>{op.vendedor}</span>
                            <span className="flex items-center gap-1">
                              <Calendar size={10} />
                              {new Date(op.dataFechamentoPrevisto + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {ops.length === 0 && (
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400">
                        <p className="text-xs">Sem oportunidades</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contatos Tab */}
      {tab === 'contatos' && (
        <div className="space-y-3">
          {mockContatos.map(ct => {
            const cliente = mockClientes.find(c => c.id === ct.clienteId);
            return (
              <div key={ct.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {contatoIcon[ct.tipo]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-800 text-sm">{cliente?.nome || ct.clienteId}</p>
                    <span className="text-xs text-gray-400">
                      {new Date(ct.dataContato + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 capitalize mb-1 flex items-center gap-1">
                    {ct.tipo} • {ct.vendedor}
                  </p>
                  <p className="text-sm text-gray-700">{ct.descricao}</p>
                  {ct.resultado && (
                    <p className="text-xs text-green-600 mt-1 font-medium">Resultado: {ct.resultado}</p>
                  )}
                  {ct.proximoContato && (
                    <p className="text-xs text-blue-500 mt-0.5 flex items-center gap-1">
                      <Calendar size={10} />
                      Próximo contato: {new Date(ct.proximoContato + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Funil Tab */}
      {tab === 'funil' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Oportunidades por Etapa (Qtd)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={funilData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} width={90} />
                <Tooltip />
                <Bar dataKey="count" name="Qtd" radius={[0, 4, 4, 0]}>
                  {funilData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Valor por Etapa</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={funilData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} width={90} />
                <Tooltip formatter={(v: any) => fmt(v)} />
                <Bar dataKey="valor" name="Valor" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Resumo do Funil de Vendas</h2>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
              {etapaOrder.map((etapa, i) => {
                const ops = mockOportunidades.filter(o => o.etapa === etapa);
                return (
                  <div key={etapa} className="text-center p-3 rounded-xl bg-gray-50">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${etapaColors[etapa]}`}>
                      {etapaLabel[etapa]}
                    </span>
                    <p className="text-2xl font-bold text-gray-800 mt-2">{ops.length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{fmt(ops.reduce((s, o) => s + o.valor, 0))}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Cliente */}
      {showClienteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-900">Novo Cliente</h3>
              <button onClick={() => setShowClienteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nome / Razão Social *</label>
                  <input
                    type="text"
                    value={clienteForm.nome}
                    onChange={e => setClienteForm(f => ({ ...f, nome: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="Nome do cliente"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">CPF</label>
                  <input
                    type="text"
                    value={clienteForm.cpf}
                    onChange={e => setClienteForm(f => ({ ...f, cpf: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={clienteForm.cnpj}
                    onChange={e => setClienteForm(f => ({ ...f, cnpj: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="00.000.000/0001-00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Telefone *</label>
                  <input
                    type="text"
                    value={clienteForm.telefone}
                    onChange={e => setClienteForm(f => ({ ...f, telefone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={clienteForm.email}
                    onChange={e => setClienteForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Segmento</label>
                  <select
                    value={clienteForm.segmento}
                    onChange={e => setClienteForm(f => ({ ...f, segmento: e.target.value as SegmentoCliente }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    <option value="particular">Particular</option>
                    <option value="construtora">Construtora</option>
                    <option value="empreiteira">Empreiteira</option>
                    <option value="revenda">Revenda</option>
                    <option value="prefeitura">Prefeitura</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Limite de Crédito (R$)</label>
                  <input
                    type="number"
                    value={clienteForm.limiteCredito}
                    onChange={e => setClienteForm(f => ({ ...f, limiteCredito: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="0,00"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Endereço</label>
                  <input
                    type="text"
                    value={clienteForm.logradouro}
                    onChange={e => setClienteForm(f => ({ ...f, logradouro: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="Rua, Av., número..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={clienteForm.cidade}
                    onChange={e => setClienteForm(f => ({ ...f, cidade: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="Fortaleza"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                  <select
                    value={clienteForm.estado}
                    onChange={e => setClienteForm(f => ({ ...f, estado: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowClienteModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={() => setShowClienteModal(false)} className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">Salvar Cliente</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Oportunidade */}
      {showOportModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Nova Oportunidade</h3>
              <button onClick={() => setShowOportModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Título *</label>
                <input
                  type="text"
                  value={oportForm.titulo}
                  onChange={e => setOportForm(f => ({ ...f, titulo: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="Descrição da oportunidade"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cliente</label>
                <select
                  value={oportForm.cliente}
                  onChange={e => setOportForm(f => ({ ...f, cliente: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  <option value="">Selecionar cliente...</option>
                  {mockClientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    value={oportForm.valor}
                    onChange={e => setOportForm(f => ({ ...f, valor: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Probabilidade %</label>
                  <input
                    type="number"
                    value={oportForm.probabilidade}
                    onChange={e => setOportForm(f => ({ ...f, probabilidade: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    min={0} max={100}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Etapa</label>
                  <select
                    value={oportForm.etapa}
                    onChange={e => setOportForm(f => ({ ...f, etapa: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    {etapaOrder.map(e => <option key={e} value={e}>{etapaLabel[e]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Vendedor</label>
                  <select
                    value={oportForm.vendedor}
                    onChange={e => setOportForm(f => ({ ...f, vendedor: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    <option>Carlos Lobato</option>
                    <option>Ana Lima</option>
                    <option>Pedro Santos</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Data de Fechamento Prevista</label>
                <input
                  type="date"
                  value={oportForm.dataFechamento}
                  onChange={e => setOportForm(f => ({ ...f, dataFechamento: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setShowOportModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={() => setShowOportModal(false)} className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
