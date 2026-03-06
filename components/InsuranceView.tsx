import React, { useState } from 'react';
import { PlusCircle, AlertTriangle, X, Save, Building2, TrendingDown, Edit2, Trash2 } from 'lucide-react';
import { HealthInsurance, Gloss, AppealStatus } from '../types';

interface Props {
    insurances: HealthInsurance[];
    glosses: Gloss[];
    onSaveInsurance: (ins: HealthInsurance) => void;
    onSaveGloss: (g: Gloss) => void;
    onDeleteGloss: (id: string) => void;
}

const APPEAL_STYLE: Record<AppealStatus, { bg: string; text: string }> = {
    'PENDENTE': { bg: 'bg-slate-100', text: 'text-slate-600' },
    'EM ANÁLISE': { bg: 'bg-blue-100', text: 'text-blue-700' },
    'APROVADO': { bg: 'bg-green-100', text: 'text-green-700' },
    'NEGADO': { bg: 'bg-red-100', text: 'text-red-700' },
};

const InsuranceView: React.FC<Props> = ({ insurances, glosses, onSaveInsurance, onSaveGloss, onDeleteGloss }) => {
    const [tab, setTab] = useState<'convenios' | 'glosas'>('convenios');
    const [showInsForm, setShowInsForm] = useState(false);
    const [showGlossForm, setShowGlossForm] = useState(false);
    const [editingIns, setEditingIns] = useState<HealthInsurance | null>(null);
    const [editingGloss, setEditingGloss] = useState<Gloss | null>(null);
    const [insForm, setInsForm] = useState({ name: '', referenceTable: 'CBHPM', adjustmentPercentage: 0, contractualPaymentDays: 30, averageActualDays: 30, glossRate: 0, totalGlossedYear: 0 });
    const [glossForm, setGlossForm] = useState({ healthInsurance: '', glossCode: '', glossReason: '', glossedValue: 0, identifiedDate: new Date().toISOString().split('T')[0], appealDeadline: '', appealStatus: 'PENDENTE' as AppealStatus, appealNotes: '' });

    const now = new Date();

    const urgentGlosses = glosses.filter(g => {
        if (!g.appealDeadline || g.appealStatus !== 'PENDENTE') return false;
        const days = Math.ceil((new Date(g.appealDeadline).getTime() - now.getTime()) / 86400000);
        return days <= 5;
    });

    const totalGlossed = glosses.reduce((a, g) => a + g.glossedValue, 0);
    const totalRecovered = glosses.filter(g => g.appealStatus === 'APROVADO').reduce((a, g) => a + g.glossedValue, 0);

    const openNewIns = () => { setEditingIns(null); setInsForm({ name: '', referenceTable: 'CBHPM', adjustmentPercentage: 0, contractualPaymentDays: 30, averageActualDays: 30, glossRate: 0, totalGlossedYear: 0 }); setShowInsForm(true); };
    const openEditIns = (ins: HealthInsurance) => { setEditingIns(ins); setInsForm({ name: ins.name, referenceTable: ins.referenceTable, adjustmentPercentage: ins.adjustmentPercentage, contractualPaymentDays: ins.contractualPaymentDays, averageActualDays: ins.averageActualDays, glossRate: ins.glossRate, totalGlossedYear: ins.totalGlossedYear }); setShowInsForm(true); };
    const openNewGloss = () => { setEditingGloss(null); setGlossForm({ healthInsurance: '', glossCode: '', glossReason: '', glossedValue: 0, identifiedDate: new Date().toISOString().split('T')[0], appealDeadline: '', appealStatus: 'PENDENTE', appealNotes: '' }); setShowGlossForm(true); };
    const openEditGloss = (g: Gloss) => { setEditingGloss(g); setGlossForm({ healthInsurance: g.healthInsurance, glossCode: g.glossCode || '', glossReason: g.glossReason, glossedValue: g.glossedValue, identifiedDate: g.identifiedDate, appealDeadline: g.appealDeadline || '', appealStatus: g.appealStatus, appealNotes: g.appealNotes || '' }); setShowGlossForm(true); };

    const handleSaveIns = () => {
        if (!insForm.name) return;
        onSaveInsurance({ ...insForm, id: editingIns?.id || `ins-${Date.now()}` });
        setShowInsForm(false);
    };

    const handleSaveGloss = () => {
        if (!glossForm.healthInsurance || !glossForm.glossReason) return;
        onSaveGloss({ ...glossForm, id: editingGloss?.id || `gloss-${Date.now()}` });
        setShowGlossForm(false);
    };

    const InputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300";

    return (
        <div className="space-y-6">
            {urgentGlosses.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={18} className="text-red-600" />
                        <span className="font-bold text-red-800">📋 {urgentGlosses.length} prazo(s) de recurso vencendo em breve!</span>
                    </div>
                    {urgentGlosses.map(g => {
                        const days = Math.ceil((new Date(g.appealDeadline!).getTime() - now.getTime()) / 86400000);
                        return (
                            <div key={g.id} className="flex justify-between items-center bg-red-100 rounded-lg px-3 py-2 text-sm mt-1">
                                <span className="text-red-800">Glosa R$ {g.glossedValue.toFixed(2)} — {g.healthInsurance} — {g.glossReason}</span>
                                <span className={`font-bold text-xs px-2 py-1 rounded-full ${days <= 0 ? 'bg-red-600 text-white' : 'bg-orange-200 text-orange-800'}`}>
                                    {days <= 0 ? 'VENCIDO' : `${days}d restantes`}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Glosado', value: `R$ ${totalGlossed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'text-red-600' },
                    { label: 'Recuperado em Recurso', value: `R$ ${totalRecovered.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'text-green-600' },
                    { label: '% Recuperação', value: `${totalGlossed > 0 ? ((totalRecovered / totalGlossed) * 100).toFixed(1) : '0.0'}%`, color: 'text-blue-600' },
                ].map(card => (
                    <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="text-xs text-slate-500 font-semibold mb-1">{card.label}</div>
                        <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                    </div>
                ))}
            </div>

            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
                {(['convenios', 'glosas'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}>
                        {t === 'convenios' ? `Convênios (${insurances.length})` : `Glosas (${glosses.length})`}
                    </button>
                ))}
            </div>

            {tab === 'convenios' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button onClick={openNewIns} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                            <PlusCircle size={16} /> Novo Convênio
                        </button>
                    </div>
                    {insurances.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
                            <p>Nenhum convênio cadastrado</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {insurances.map(ins => {
                                const insGlosses = glosses.filter(g => g.healthInsurance === ins.name);
                                const totalIns = insGlosses.reduce((a, g) => a + g.glossedValue, 0);
                                return (
                                    <div key={ins.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-lg">{ins.name}</h3>
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{ins.referenceTable}</span>
                                            </div>
                                            <button onClick={() => openEditIns(ins)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 text-sm">
                                            <div><div className="text-xs text-slate-400">Prazo contratual</div><div className="font-semibold">{ins.contractualPaymentDays}d</div></div>
                                            <div><div className="text-xs text-slate-400">Prazo médio real</div><div className={`font-semibold ${ins.averageActualDays > ins.contractualPaymentDays ? 'text-red-600' : 'text-green-600'}`}>{ins.averageActualDays}d</div></div>
                                            <div><div className="text-xs text-slate-400">Taxa de glosa</div><div className={`font-semibold ${ins.glossRate > 10 ? 'text-red-600' : ins.glossRate > 5 ? 'text-orange-500' : 'text-green-600'}`}>{ins.glossRate.toFixed(1)}%</div></div>
                                        </div>
                                        {totalIns > 0 && (
                                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-red-600">
                                                <TrendingDown size={12} /> Total glosado: R$ {totalIns.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {tab === 'glosas' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button onClick={openNewGloss} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700">
                            <PlusCircle size={16} /> Registrar Glosa
                        </button>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>{['Data', 'Convênio', 'Motivo', 'Valor', 'Prazo Recurso', 'Status', 'Ações'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {glosses.length === 0 ? (
                                    <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">Nenhuma glosa registrada</td></tr>
                                ) : glosses.map(g => {
                                    const st = APPEAL_STYLE[g.appealStatus];
                                    const daysLeft = g.appealDeadline ? Math.ceil((new Date(g.appealDeadline).getTime() - now.getTime()) / 86400000) : null;
                                    return (
                                        <tr key={g.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-slate-600">{new Date(g.identifiedDate).toLocaleDateString('pt-BR')}</td>
                                            <td className="px-4 py-3 font-medium">{g.healthInsurance}</td>
                                            <td className="px-4 py-3 text-slate-600">
                                                <div>{g.glossReason}</div>
                                                {g.glossCode && <div className="text-xs text-slate-400">Cód: {g.glossCode}</div>}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-red-600">R$ {g.glossedValue.toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                {g.appealDeadline ? (
                                                    <span className={`text-xs font-semibold ${daysLeft !== null && daysLeft <= 2 ? 'text-red-600' : daysLeft !== null && daysLeft <= 5 ? 'text-orange-500' : 'text-slate-600'}`}>
                                                        {new Date(g.appealDeadline).toLocaleDateString('pt-BR')} {daysLeft !== null && `(${daysLeft}d)`}
                                                    </span>
                                                ) : <span className="text-slate-400">—</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${st.bg} ${st.text}`}>{g.appealStatus}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">
                                                    <button onClick={() => openEditGloss(g)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md"><Edit2 size={14} /></button>
                                                    <button onClick={() => window.confirm('Excluir?') && onDeleteGloss(g.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showInsForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b"><h3 className="text-lg font-bold">{editingIns ? 'Editar' : 'Novo'} Convênio</h3><button onClick={() => setShowInsForm(false)}><X size={20} className="text-slate-400" /></button></div>
                        <div className="p-6 space-y-4">
                            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Nome *</label><input value={insForm.name} onChange={e => setInsForm(p => ({ ...p, name: e.target.value }))} className={InputCls} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Tabela</label>
                                    <select value={insForm.referenceTable} onChange={e => setInsForm(p => ({ ...p, referenceTable: e.target.value }))} className={InputCls}>
                                        <option>CBHPM</option><option>AMB</option><option>Própria</option>
                                    </select>
                                </div>
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">% Reajuste</label><input type="number" value={insForm.adjustmentPercentage} onChange={e => setInsForm(p => ({ ...p, adjustmentPercentage: Number(e.target.value) }))} className={InputCls} /></div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Prazo Contratual (d)</label><input type="number" value={insForm.contractualPaymentDays} onChange={e => setInsForm(p => ({ ...p, contractualPaymentDays: Number(e.target.value) }))} className={InputCls} /></div>
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Prazo Real (d)</label><input type="number" value={insForm.averageActualDays} onChange={e => setInsForm(p => ({ ...p, averageActualDays: Number(e.target.value) }))} className={InputCls} /></div>
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Taxa Glosa %</label><input type="number" step="0.1" value={insForm.glossRate} onChange={e => setInsForm(p => ({ ...p, glossRate: Number(e.target.value) }))} className={InputCls} /></div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-6 border-t">
                            <button onClick={() => setShowInsForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                            <button onClick={handleSaveIns} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"><Save size={14} /> Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {showGlossForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b"><h3 className="text-lg font-bold">{editingGloss ? 'Editar' : 'Registrar'} Glosa</h3><button onClick={() => setShowGlossForm(false)}><X size={20} className="text-slate-400" /></button></div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Convênio *</label><input value={glossForm.healthInsurance} onChange={e => setGlossForm(p => ({ ...p, healthInsurance: e.target.value }))} className={InputCls} /></div>
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Código da Glosa</label><input value={glossForm.glossCode} onChange={e => setGlossForm(p => ({ ...p, glossCode: e.target.value }))} className={InputCls} /></div>
                            </div>
                            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Motivo *</label><input value={glossForm.glossReason} onChange={e => setGlossForm(p => ({ ...p, glossReason: e.target.value }))} className={InputCls} /></div>
                            <div className="grid grid-cols-3 gap-4">
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Valor (R$)</label><input type="number" step="0.01" value={glossForm.glossedValue} onChange={e => setGlossForm(p => ({ ...p, glossedValue: Number(e.target.value) }))} className={InputCls} /></div>
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Data Identificação</label><input type="date" value={glossForm.identifiedDate} onChange={e => setGlossForm(p => ({ ...p, identifiedDate: e.target.value }))} className={InputCls} /></div>
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Prazo Recurso</label><input type="date" value={glossForm.appealDeadline} onChange={e => setGlossForm(p => ({ ...p, appealDeadline: e.target.value }))} className={InputCls} /></div>
                            </div>
                            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Status Recurso</label>
                                <select value={glossForm.appealStatus} onChange={e => setGlossForm(p => ({ ...p, appealStatus: e.target.value as AppealStatus }))} className={InputCls}>
                                    {(['PENDENTE', 'EM ANÁLISE', 'APROVADO', 'NEGADO'] as AppealStatus[]).map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Observações</label><textarea value={glossForm.appealNotes} onChange={e => setGlossForm(p => ({ ...p, appealNotes: e.target.value }))} rows={2} className={`${InputCls} resize-none`} /></div>
                        </div>
                        <div className="flex justify-end gap-3 p-6 border-t">
                            <button onClick={() => setShowGlossForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                            <button onClick={handleSaveGloss} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700"><Save size={14} /> Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InsuranceView;
