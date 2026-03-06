import React, { useState, useMemo } from 'react';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, X, Save, Trash2, Edit2 } from 'lucide-react';
import { MedicalProcedure, MedicalExpense } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
    procedures: MedicalProcedure[];
    expenses: MedicalExpense[];
    onSaveExpense: (exp: MedicalExpense) => void;
    onDeleteExpense: (id: string) => void;
}

const EXPENSE_CATS = [
    'Aluguel de consultório', 'Equipamentos médicos', 'Folha de pagamento', 'Cursos e congressos',
    'Assinaturas (software/plataformas)', 'Seguro RC Médico', 'CRM/CFM', 'Contabilidade', 'Outros',
];

const EMPTY_EXP: Omit<MedicalExpense, 'id'> = {
    date: new Date().toISOString().split('T')[0], category: 'Aluguel de consultório',
    description: '', value: 0, entity: 'PJ', isDeductible: true,
};

const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

const CashFlowView: React.FC<Props> = ({ procedures, expenses, onSaveExpense, onDeleteExpense }) => {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<MedicalExpense | null>(null);
    const [form, setForm] = useState<Omit<MedicalExpense, 'id'>>(EMPTY_EXP);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    const monthProcs = useMemo(() => procedures.filter(p => p.date?.startsWith(selectedMonth)), [procedures, selectedMonth]);
    const monthExp = useMemo(() => expenses.filter(e => e.date?.startsWith(selectedMonth)), [expenses, selectedMonth]);

    const totalBilled = monthProcs.reduce((a, p) => a + p.chargedValue, 0);
    const totalReceived = monthProcs.reduce((a, p) => a + p.receivedValue, 0);
    const totalGlossed = monthProcs.filter(p => p.billingStatus === 'GLOSADO').reduce((a, p) => a + p.chargedValue, 0);
    const totalExpenses = monthExp.reduce((a, e) => a + e.value, 0);
    const netMargin = totalReceived - totalExpenses;
    const avgTicket = monthProcs.length > 0 ? totalBilled / monthProcs.length : 0;

    // Receita por categoria
    const byInsurance: Record<string, number> = {};
    monthProcs.forEach(p => { byInsurance[p.healthInsurance] = (byInsurance[p.healthInsurance] || 0) + p.receivedValue; });

    // Chart: últimos 6 meses
    const chartData = useMemo(() => {
        const months: string[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(); d.setMonth(d.getMonth() - i);
            months.push(d.toISOString().slice(0, 7));
        }
        return months.map(m => ({
            month: m.slice(5) + '/' + m.slice(2, 4),
            Receita: procedures.filter(p => p.date?.startsWith(m)).reduce((a, p) => a + p.receivedValue, 0),
            Despesas: expenses.filter(e => e.date?.startsWith(m)).reduce((a, e) => a + e.value, 0),
        }));
    }, [procedures, expenses]);

    const openNew = () => { setEditing(null); setForm(EMPTY_EXP); setShowForm(true); };
    const openEdit = (e: MedicalExpense) => { setEditing(e); setForm({ ...e }); setShowForm(true); };
    const handleSave = () => {
        if (!form.description) return;
        onSaveExpense({ ...form, id: editing?.id || `exp-${Date.now()}` });
        setShowForm(false);
    };
    const InputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300";

    return (
        <div className="space-y-6">
            {/* Seletor de mês */}
            <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-slate-600">Mês de referência:</label>
                <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>

            {/* Cards KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Faturado', value: `R$ ${fmt(totalBilled)}`, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Recebido', value: `R$ ${fmt(totalReceived)}`, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'A Receber', value: `R$ ${fmt(totalBilled - totalReceived)}`, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Glosado', value: `R$ ${fmt(totalGlossed)}`, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Despesas', value: `R$ ${fmt(totalExpenses)}`, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Margem Líq.', value: `R$ ${fmt(netMargin)}`, color: netMargin >= 0 ? 'text-emerald-700' : 'text-red-600', bg: netMargin >= 0 ? 'bg-emerald-50' : 'bg-red-50' },
                ].map(card => (
                    <div key={card.label} className={`rounded-xl p-4 ${card.bg}`}>
                        <div className="text-xs font-semibold text-slate-500 mb-1">{card.label}</div>
                        <div className={`text-lg font-bold ${card.color}`}>{card.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h3 className="font-bold text-slate-800 mb-4">Evolução 6 meses</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={chartData} barSize={16}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(v: number) => `R$ ${fmt(v)}`} />
                            <Legend />
                            <Bar dataKey="Receita" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Receita por convênio */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h3 className="font-bold text-slate-800 mb-4">Receita por Convênio — {selectedMonth}</h3>
                    {Object.keys(byInsurance).length === 0 ? (
                        <div className="text-center text-slate-400 py-8">Sem procedimentos neste mês</div>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(byInsurance).sort((a, b) => b[1] - a[1]).map(([ins, val]) => (
                                <div key={ins}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-700">{ins}</span>
                                        <span className="font-bold text-slate-800">R$ {fmt(val)}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full">
                                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${(val / totalReceived * 100) || 0}%` }} />
                                    </div>
                                </div>
                            ))}
                            <div className="text-xs text-slate-400 mt-2">Ticket médio: R$ {fmt(avgTicket)} | {monthProcs.length} procedimentos</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Despesas do mês */}
            <div className="bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between p-5 border-b border-slate-200">
                    <h3 className="font-bold text-slate-800">Despesas — {selectedMonth}</h3>
                    <button onClick={openNew} className="flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-600">
                        <PlusCircle size={14} /> Nova Despesa
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>{['Data', 'Categoria', 'Descrição', 'Entidade', 'Valor', 'Dedutível', 'Ações'].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                            ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {monthExp.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Nenhuma despesa neste mês</td></tr>
                            ) : monthExp.map(exp => (
                                <tr key={exp.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-600">{new Date(exp.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-4 py-3 text-slate-700">{exp.category}</td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{exp.description}</td>
                                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${exp.entity === 'PJ' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{exp.entity}</span></td>
                                    <td className="px-4 py-3 font-semibold text-red-600">R$ {fmt(exp.value)}</td>
                                    <td className="px-4 py-3"><span className={`text-xs font-bold ${exp.isDeductible ? 'text-green-600' : 'text-slate-400'}`}>{exp.isDeductible ? '✓ Sim' : '✗ Não'}</span></td>
                                    <td className="px-4 py-3 flex gap-1">
                                        <button onClick={() => openEdit(exp)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md"><Edit2 size={14} /></button>
                                        <button onClick={() => window.confirm('Excluir?') && onDeleteExpense(exp.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-md"><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b"><h3 className="text-lg font-bold">{editing ? 'Editar' : 'Nova'} Despesa</h3><button onClick={() => setShowForm(false)}><X size={20} className="text-slate-400" /></button></div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Data</label><input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className={InputCls} /></div>
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Entidade</label>
                                    <select value={form.entity} onChange={e => setForm(p => ({ ...p, entity: e.target.value as 'PJ' | 'PF' }))} className={InputCls}>
                                        <option value="PJ">PJ — Clínica/CNPJ</option><option value="PF">PF — Pessoal</option>
                                    </select>
                                </div>
                            </div>
                            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Categoria</label>
                                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={InputCls}>
                                    {EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Descrição *</label><input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={InputCls} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Valor (R$)</label><input type="number" step="0.01" value={form.value} onChange={e => setForm(p => ({ ...p, value: Number(e.target.value) }))} className={InputCls} /></div>
                                <div className="flex items-end pb-2">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input type="checkbox" checked={form.isDeductible} onChange={e => setForm(p => ({ ...p, isDeductible: e.target.checked }))} className="w-4 h-4 text-blue-600 rounded" />
                                        Dedutível no IR
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-6 border-t">
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600"><Save size={14} /> Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashFlowView;
