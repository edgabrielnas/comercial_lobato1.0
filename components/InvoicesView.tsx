import React, { useState, useMemo } from 'react';
import { PlusCircle, CheckCircle, X, Save, FileText, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import { InvoiceNFSe, InvoiceStatus, ServiceType, MedicalProcedure } from '../types';

interface Props {
    invoices: InvoiceNFSe[];
    procedures: MedicalProcedure[];
    onSave: (inv: InvoiceNFSe) => void;
    onDelete: (id: string) => void;
}

const ISS_BY_CITY: Record<string, number> = {
    'São Paulo': 2, 'Rio de Janeiro': 2.5, 'Fortaleza': 2, 'Curitiba': 2,
    'Manaus': 2, 'Recife': 2, 'Belo Horizonte': 2, 'Porto Alegre': 2, 'Salvador': 3,
};

const EMPTY: Omit<InvoiceNFSe, 'id'> = {
    serviceType: 'médico', recipientType: 'pf', recipientDocument: '', recipientName: '',
    city: 'São Paulo', grossValue: 0, issRate: 2, issWithheld: false, irWithheld: false,
    inssWithheld: false, netValue: 0, status: 'PENDENTE', competenceMonth: new Date().toISOString().slice(0, 7), notes: '',
};

const STATUS_STYLE: Record<InvoiceStatus, { bg: string; text: string }> = {
    PENDENTE: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    EMITIDA: { bg: 'bg-green-100', text: 'text-green-700' },
    CANCELADA: { bg: 'bg-red-100', text: 'text-red-700' },
};

const InvoicesView: React.FC<Props> = ({ invoices, procedures, onSave, onDelete }) => {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<InvoiceNFSe | null>(null);
    const [form, setForm] = useState<Omit<InvoiceNFSe, 'id'>>(EMPTY);
    const [filterStatus, setFilterStatus] = useState<InvoiceStatus | 'TODOS'>('TODOS');

    // Procedimentos PAGO sem NF emitida
    const paidWithoutInvoice = useMemo(() =>
        procedures.filter(p =>
            p.billingStatus === 'PAGO' &&
            !invoices.some(inv => inv.procedureId === p.id && inv.status === 'EMITIDA')
        ), [procedures, invoices]);

    const calcNet = (f: Omit<InvoiceNFSe, 'id'>) => {
        let net = f.grossValue;
        if (f.issWithheld) net -= f.grossValue * (f.issRate / 100);
        if (f.irWithheld) net -= f.grossValue * 0.015; // 1.5% IR padrão médico
        if (f.inssWithheld) net -= f.grossValue * 0.11;
        return Math.max(net, 0);
    };

    const setField = (k: keyof typeof form, v: any) => {
        setForm(prev => {
            const next = { ...prev, [k]: v };
            if (k === 'city') next.issRate = ISS_BY_CITY[v] ?? 2;
            next.netValue = calcNet(next);
            return next;
        });
    };

    const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
    const openEdit = (inv: InvoiceNFSe) => { setEditing(inv); setForm({ ...inv }); setShowForm(true); };

    const handleSubmit = () => {
        if (!form.recipientName) return;
        onSave({ ...form, netValue: calcNet(form), id: editing?.id || `inv-${Date.now()}` });
        setShowForm(false);
    };

    const filtered = filterStatus === 'TODOS' ? invoices : invoices.filter(i => i.status === filterStatus);
    const InputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300";

    // Checklist de validação
    const checklist = form ? [
        { label: 'Valor confere com o pagamento recebido?', ok: form.grossValue > 0 },
        { label: 'CPF/CNPJ do tomador informado?', ok: !!form.recipientDocument && form.recipientDocument.length >= 11 },
        { label: 'Nome do tomador preenchido?', ok: !!form.recipientName },
        { label: 'Alíquota ISS correta para o município?', ok: form.issRate > 0 },
        { label: 'Competência correta?', ok: !!form.competenceMonth },
        { label: 'Tipo de serviço adequado?', ok: !!form.serviceType },
        { label: 'Retenções verificadas?', ok: true },
    ] : [];

    return (
        <div className="space-y-6">
            {paidWithoutInvoice.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={18} className="text-amber-600" />
                        <span className="font-bold text-amber-800">📊 {paidWithoutInvoice.length} procedimento(s) pago(s) sem Nota Fiscal emitida</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {paidWithoutInvoice.slice(0, 4).map(p => (
                            <div key={p.id} className="bg-amber-100 rounded-lg px-3 py-2 text-sm text-amber-800 flex justify-between items-center">
                                <span>{p.procedureName} — {p.patientIdentifier}</span>
                                <button onClick={() => { setForm({ ...EMPTY, procedureId: p.id, grossValue: p.receivedValue, recipientName: p.patientIdentifier }); setShowForm(true); }} className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded-md hover:bg-amber-700 ml-2">Emitir NF</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-3 gap-4">
                {(['PENDENTE', 'EMITIDA', 'CANCELADA'] as InvoiceStatus[]).map(s => {
                    const st = STATUS_STYLE[s];
                    const cnt = invoices.filter(i => i.status === s);
                    const total = cnt.reduce((a, i) => a + i.grossValue, 0);
                    return (
                        <button key={s} onClick={() => setFilterStatus(prev => prev === s ? 'TODOS' : s)}
                            className={`rounded-xl p-4 text-left border-2 transition-all ${filterStatus === s ? 'border-blue-500' : 'border-transparent'} ${st.bg}`}>
                            <div className={`text-xs font-bold mb-1 ${st.text}`}>{s}</div>
                            <div className={`text-2xl font-bold ${st.text}`}>{cnt.length}</div>
                            <div className={`text-xs ${st.text} opacity-80`}>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</div>
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-end">
                <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                    <PlusCircle size={16} /> Nova NF-e
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>{['Competência', 'Tomador', 'Tipo', 'Bruto', 'Líquido', 'Status', 'Ações'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                        ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.length === 0 ? (
                            <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">Nenhuma nota fiscal encontrada</td></tr>
                        ) : filtered.map(inv => {
                            const st = STATUS_STYLE[inv.status];
                            return (
                                <tr key={inv.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-600">{inv.competenceMonth}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{inv.recipientName}</div>
                                        {inv.recipientDocument && <div className="text-xs text-slate-400">{inv.recipientType.toUpperCase()}: {inv.recipientDocument}</div>}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 capitalize">{inv.serviceType}</td>
                                    <td className="px-4 py-3 font-semibold text-slate-800">R$ {inv.grossValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-4 py-3 font-semibold text-green-700">R$ {inv.netValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-4 py-3"><span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${st.bg} ${st.text}`}>{inv.status}</span></td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <button onClick={() => openEdit(inv)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md"><Edit2 size={14} /></button>
                                            <button onClick={() => window.confirm('Excluir?') && onDelete(inv.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-bold">{editing ? 'Editar' : 'Nova'} Nota Fiscal</h3>
                            <button onClick={() => setShowForm(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Checklist */}
                            <div className="bg-slate-50 rounded-xl p-4">
                                <div className="text-xs font-bold text-slate-600 mb-2 uppercase">Checklist de Emissão</div>
                                <div className="space-y-1">
                                    {checklist.map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            <CheckCircle size={12} className={item.ok ? 'text-green-500' : 'text-slate-300'} />
                                            <span className={item.ok ? 'text-slate-700' : 'text-slate-400'}>{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Tipo de Serviço</label>
                                    <select value={form.serviceType} onChange={e => setField('serviceType', e.target.value as ServiceType)} className={InputCls}>
                                        {(['médico', 'cirúrgico', 'consultoria', 'perícia'] as ServiceType[]).map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Competência (mês)</label>
                                    <input type="month" value={form.competenceMonth || ''} onChange={e => setField('competenceMonth', e.target.value)} className={InputCls} />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Tomador</label>
                                    <select value={form.recipientType} onChange={e => setField('recipientType', e.target.value as 'pf' | 'pj')} className={InputCls}>
                                        <option value="pf">Pessoa Física (CPF)</option><option value="pj">Pessoa Jurídica (CNPJ)</option>
                                    </select>
                                </div>
                                <div className="col-span-2"><label className="block text-xs font-semibold text-slate-500 mb-1">Nome do Tomador *</label>
                                    <input value={form.recipientName} onChange={e => setField('recipientName', e.target.value)} className={InputCls} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">CPF / CNPJ</label>
                                    <input value={form.recipientDocument || ''} onChange={e => setField('recipientDocument', e.target.value)} className={InputCls} placeholder={form.recipientType === 'pf' ? '000.000.000-00' : '00.000.000/0001-00'} />
                                </div>
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Município (ISS)</label>
                                    <input list="cities-list" value={form.city} onChange={e => setField('city', e.target.value)} className={InputCls} />
                                    <datalist id="cities-list">{Object.keys(ISS_BY_CITY).map(c => <option key={c} value={c} />)}</datalist>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Valor Bruto (R$)</label>
                                    <input type="number" step="0.01" value={form.grossValue} onChange={e => setField('grossValue', Number(e.target.value))} className={InputCls} />
                                </div>
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Alíquota ISS (%)</label>
                                    <input type="number" step="0.1" value={form.issRate} onChange={e => setField('issRate', Number(e.target.value))} className={InputCls} />
                                </div>
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Valor Líquido (R$)</label>
                                    <input readOnly value={calcNet(form).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} className={`${InputCls} bg-slate-50 font-bold text-green-700`} />
                                </div>
                            </div>

                            <div className="flex gap-6">
                                {[{ k: 'issWithheld', label: 'ISS retido na fonte' }, { k: 'irWithheld', label: 'IR retido (1,5%)' }, { k: 'inssWithheld', label: 'INSS retido (11%)' }].map(({ k, label }) => (
                                    <label key={k} className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input type="checkbox" checked={!!(form as any)[k]} onChange={e => setField(k as any, e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                                        {label}
                                    </label>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Número NF-e</label>
                                    <input value={form.nfseNumber || ''} onChange={e => setField('nfseNumber', e.target.value)} className={InputCls} />
                                </div>
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                                    <select value={form.status} onChange={e => setField('status', e.target.value as InvoiceStatus)} className={InputCls}>
                                        {(['PENDENTE', 'EMITIDA', 'CANCELADA'] as InvoiceStatus[]).map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-6 border-t">
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                            <button onClick={handleSubmit} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"><Save size={14} /> Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoicesView;
