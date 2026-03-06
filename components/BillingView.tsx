import React, { useState } from 'react';
import { PlusCircle, Search, AlertTriangle, CheckCircle, Clock, XCircle, FileText, Trash2, Edit2, X, Save, ChevronDown } from 'lucide-react';
import { MedicalProcedure, BillingStatus, ProcedureType } from '../types';

interface Props {
    procedures: MedicalProcedure[];
    onSave: (p: MedicalProcedure) => void;
    onDelete: (id: string) => void;
}

const TUSS_SUGGESTIONS: Record<string, string> = {
    'consulta': '10101012',
    'cirurgia': '30101036',
    'telemedicina': '10101020',
    'urodinamica': '22010010',
    'cistoscopia': '30609018',
    'biópsia próstata': '33000096',
    'rtup': '30606013',
};

const STATUS_STYLE: Record<BillingStatus, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
    REALIZADO: { bg: 'bg-orange-100', text: 'text-orange-700', icon: <Clock size={12} />, label: 'Realizado' },
    FATURADO: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <FileText size={12} />, label: 'Faturado' },
    PAGO: { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle size={12} />, label: 'Pago' },
    GLOSADO: { bg: 'bg-purple-100', text: 'text-purple-700', icon: <XCircle size={12} />, label: 'Glosado' },
    PENDENTE: { bg: 'bg-slate-100', text: 'text-slate-600', icon: <Clock size={12} />, label: 'Pendente' },
};

const EMPTY: Omit<MedicalProcedure, 'id'> = {
    date: new Date().toISOString().split('T')[0],
    patientIdentifier: '',
    procedureType: 'consulta',
    location: 'consultório',
    tussCode: '',
    procedureName: '',
    healthInsurance: 'particular',
    guideNumber: '',
    tableValue: 0,
    chargedValue: 0,
    receivedValue: 0,
    billingStatus: 'REALIZADO',
    expectedPaymentDate: '',
    billingDate: '',
    paymentDate: '',
    doctorName: '',
    notes: '',
};

const BillingView: React.FC<Props> = ({ procedures, onSave, onDelete }) => {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<MedicalProcedure | null>(null);
    const [form, setForm] = useState<Omit<MedicalProcedure, 'id'>>(EMPTY);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<BillingStatus | 'TODOS'>('TODOS');

    const now = new Date();

    // Alertas automáticos: REALIZADO há mais de 48h
    const unfilled = procedures.filter(p => {
        if (p.billingStatus !== 'REALIZADO') return false;
        const hours = (now.getTime() - new Date(p.date).getTime()) / 3_600_000;
        return hours > 48;
    });

    const filtered = procedures.filter(p => {
        const matchSearch =
            p.patientIdentifier.toLowerCase().includes(search.toLowerCase()) ||
            p.procedureName.toLowerCase().includes(search.toLowerCase()) ||
            p.healthInsurance.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'TODOS' || p.billingStatus === filterStatus;
        return matchSearch && matchStatus;
    });

    const openNew = () => {
        setEditing(null);
        setForm(EMPTY);
        setShowForm(true);
    };

    const openEdit = (p: MedicalProcedure) => {
        setEditing(p);
        setForm({ ...p });
        setShowForm(true);
    };

    const handleSubmit = () => {
        if (!form.patientIdentifier || !form.procedureName) return alert('Preencha paciente e procedimento.');
        const proc: MedicalProcedure = { ...form, id: editing?.id || `proc-${Date.now()}` };
        onSave(proc);
        setShowForm(false);
    };

    const setField = (k: keyof typeof form, v: any) => setForm(prev => ({ ...prev, [k]: v }));

    const statusTotals = (['REALIZADO', 'FATURADO', 'PAGO', 'GLOSADO', 'PENDENTE'] as BillingStatus[]).map(s => ({
        status: s,
        count: procedures.filter(p => p.billingStatus === s).length,
        value: procedures.filter(p => p.billingStatus === s).reduce((a, p) => a + p.chargedValue, 0),
    }));

    return (
        <div className="space-y-6">
            {/* Alertas urgentes */}
            {unfilled.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={18} className="text-amber-600" />
                        <span className="font-bold text-amber-800">⚠️ {unfilled.length} conta(s) NÃO FATURADA(s) — Risco de perda financeira</span>
                    </div>
                    <div className="space-y-1">
                        {unfilled.map(p => {
                            const h = Math.floor((now.getTime() - new Date(p.date).getTime()) / 3_600_000);
                            return (
                                <div key={p.id} className="flex items-center justify-between bg-amber-100 rounded-lg px-3 py-2 text-sm">
                                    <span className="text-amber-800 font-medium">{p.procedureName} — {p.patientIdentifier} — {new Date(p.date).toLocaleDateString('pt-BR')}</span>
                                    <div className="flex gap-2 items-center">
                                        <span className="text-amber-600 text-xs">{h}h sem faturar</span>
                                        <button onClick={() => openEdit(p)} className="text-xs bg-amber-600 text-white px-2 py-1 rounded-md hover:bg-amber-700">Faturar</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Cards de resumo por status */}
            <div className="grid grid-cols-5 gap-3">
                {statusTotals.map(({ status, count, value }) => {
                    const s = STATUS_STYLE[status];
                    return (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(prev => prev === status ? 'TODOS' : status)}
                            className={`rounded-xl p-3 text-left border-2 transition-all ${filterStatus === status ? 'border-blue-500 shadow-md' : 'border-transparent'} ${s.bg}`}
                        >
                            <div className={`text-xs font-bold flex items-center gap-1 mb-1 ${s.text}`}>
                                {s.icon} {s.label}
                            </div>
                            <div className={`text-lg font-bold ${s.text}`}>{count}</div>
                            <div className={`text-xs ${s.text} opacity-80`}>R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</div>
                        </button>
                    );
                })}
            </div>

            {/* Controles */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="relative flex-1 max-w-xs">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar paciente, procedimento..."
                        className="pl-9 pr-3 py-2 w-full border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>
                <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                    <PlusCircle size={16} /> Novo Procedimento
                </button>
            </div>

            {/* Tabela */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                {['Data', 'Paciente', 'Procedimento', 'Convênio', 'Cobrado', 'Status', 'Ações'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">Nenhum procedimento encontrado</td></tr>
                            ) : filtered.map(p => {
                                const s = STATUS_STYLE[p.billingStatus];
                                return (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-slate-600">{new Date(p.date).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">{p.patientIdentifier}</td>
                                        <td className="px-4 py-3">
                                            <div className="text-slate-800">{p.procedureName}</div>
                                            {p.tussCode && <div className="text-xs text-slate-400">TUSS: {p.tussCode}</div>}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{p.healthInsurance}</td>
                                        <td className="px-4 py-3 font-semibold text-slate-800">R$ {p.chargedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
                                                {s.icon} {s.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <button onClick={() => openEdit(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md"><Edit2 size={14} /></button>
                                                <button onClick={() => window.confirm('Excluir?') && onDelete(p.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de formulário */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800">{editing ? 'Editar Procedimento' : 'Novo Procedimento'}</h3>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Data *</label>
                                    <input type="date" value={form.date} onChange={e => setField('date', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Paciente (iniciais + nasc.) *</label>
                                    <input placeholder="Ex: M.S. 15/03/1985" value={form.patientIdentifier} onChange={e => setField('patientIdentifier', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nome do Procedimento *</label>
                                    <input
                                        placeholder="Ex: Cistoscopia diagnóstica"
                                        value={form.procedureName}
                                        onChange={e => {
                                            setField('procedureName', e.target.value);
                                            const key = e.target.value.toLowerCase();
                                            const found = Object.entries(TUSS_SUGGESTIONS).find(([k]) => key.includes(k));
                                            if (found) setField('tussCode', found[1]);
                                        }}
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Código TUSS/CBHPM</label>
                                    <input placeholder="Ex: 30609018" value={form.tussCode || ''} onChange={e => setField('tussCode', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo</label>
                                    <select value={form.procedureType} onChange={e => setField('procedureType', e.target.value as ProcedureType)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                                        <option value="consulta">Consulta</option>
                                        <option value="cirurgia">Cirurgia</option>
                                        <option value="ambulatorial">Ambulatorial</option>
                                        <option value="telemedicina">Telemedicina</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Local</label>
                                    <input value={form.location} onChange={e => setField('location', e.target.value)} placeholder="consultório / hospital" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Convênio</label>
                                    <input value={form.healthInsurance} onChange={e => setField('healthInsurance', e.target.value)} placeholder="particular / Unimed..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Valor Tabela (R$)</label>
                                    <input type="number" step="0.01" value={form.tableValue} onChange={e => setField('tableValue', Number(e.target.value))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Valor Cobrado (R$)</label>
                                    <input type="number" step="0.01" value={form.chargedValue} onChange={e => setField('chargedValue', Number(e.target.value))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Valor Recebido (R$)</label>
                                    <input type="number" step="0.01" value={form.receivedValue} onChange={e => setField('receivedValue', Number(e.target.value))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Status *</label>
                                    <select value={form.billingStatus} onChange={e => setField('billingStatus', e.target.value as BillingStatus)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                                        {(Object.keys(STATUS_STYLE) as BillingStatus[]).map(s => <option key={s} value={s}>{STATUS_STYLE[s].label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Número da Guia</label>
                                    <input value={form.guideNumber || ''} onChange={e => setField('guideNumber', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Data Faturamento</label>
                                    <input type="date" value={form.billingDate || ''} onChange={e => setField('billingDate', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Prazo Pagamento Previsto</label>
                                    <input type="date" value={form.expectedPaymentDate || ''} onChange={e => setField('expectedPaymentDate', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Data Pagamento Efetivo</label>
                                    <input type="date" value={form.paymentDate || ''} onChange={e => setField('paymentDate', e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Observações</label>
                                <textarea value={form.notes || ''} onChange={e => setField('notes', e.target.value)} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                            <button onClick={handleSubmit} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                                <Save size={14} /> Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingView;
