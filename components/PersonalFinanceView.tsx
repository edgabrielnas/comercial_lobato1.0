import React, { useState } from 'react';
import { Save, TrendingUp, Shield, PiggyBank, Wallet, User, Building2 } from 'lucide-react';
import { PersonalFinance } from '../types';

interface Props {
    personalFinance: PersonalFinance[];
    onSave: (pf: PersonalFinance) => void;
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const PersonalFinanceView: React.FC<Props> = ({ personalFinance, onSave }) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const existing = personalFinance.find(p => p.month === selectedMonth);
    const [form, setForm] = useState<Omit<PersonalFinance, 'id'>>({
        month: selectedMonth,
        prolaboreDefined: existing?.prolaboreDefined || 0,
        prolaboreWithdrawn: existing?.prolaboreWithdrawn || 0,
        dividends: existing?.dividends || 0,
        personalExpenses: existing?.personalExpenses || 0,
        invested: existing?.invested || 0,
        emergencyReserve: existing?.emergencyReserve || 0,
        pgblVgblContribution: existing?.pgblVgblContribution || 0,
        notes: existing?.notes || '',
    });

    const changeMonth = (m: string) => {
        setSelectedMonth(m);
        const found = personalFinance.find(p => p.month === m);
        setForm({
            month: m,
            prolaboreDefined: found?.prolaboreDefined || 0,
            prolaboreWithdrawn: found?.prolaboreWithdrawn || 0,
            dividends: found?.dividends || 0,
            personalExpenses: found?.personalExpenses || 0,
            invested: found?.invested || 0,
            emergencyReserve: found?.emergencyReserve || 0,
            pgblVgblContribution: found?.pgblVgblContribution || 0,
            notes: found?.notes || '',
        });
    };

    const handleSave = () => {
        onSave({ ...form, month: selectedMonth, id: existing?.id || `pf-${Date.now()}` });
    };

    const liquidIncome = form.prolaboreWithdrawn + form.dividends;
    const balance = liquidIncome - form.personalExpenses - form.invested;
    const pgblLimit = liquidIncome * 0.12;
    const pgblOver = form.pgblVgblContribution > pgblLimit;

    // Reserva de emergência: meta = 4 meses de despesas pessoais
    const emergencyGoal = form.personalExpenses * 4;
    const emergencyPct = emergencyGoal > 0 ? Math.min((form.emergencyReserve / emergencyGoal) * 100, 100) : 0;

    const InputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white";
    const setF = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));

    return (
        <div className="space-y-6">
            {/* Seletor de mês */}
            <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-slate-600">Mês:</label>
                <input type="month" value={selectedMonth} onChange={e => changeMonth(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bloco PJ */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-blue-600 px-6 py-4 flex items-center gap-3 text-white">
                        <Building2 size={20} />
                        <div>
                            <div className="font-bold">Pessoa Jurídica (PJ)</div>
                            <div className="text-blue-200 text-xs">Clínica / CNPJ</div>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Pró-labore Definido (R$)</label>
                            <input type="number" step="100" value={form.prolaboreDefined} onChange={e => setF('prolaboreDefined', Number(e.target.value))} className={InputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Pró-labore Retirado (R$)</label>
                            <input type="number" step="100" value={form.prolaboreWithdrawn} onChange={e => setF('prolaboreWithdrawn', Number(e.target.value))} className={InputCls} />
                            {form.prolaboreWithdrawn !== form.prolaboreDefined && form.prolaboreDefined > 0 && (
                                <p className="text-xs text-amber-600 mt-1">⚠️ Diferença de R$ {fmt(Math.abs(form.prolaboreDefined - form.prolaboreWithdrawn))}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Dividendos Distribuídos (R$)</label>
                            <input type="number" step="100" value={form.dividends} onChange={e => setF('dividends', Number(e.target.value))} className={InputCls} />
                        </div>
                        <div className="pt-3 border-t border-slate-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Total recebido pelo médico:</span>
                                <span className="font-bold text-blue-700">R$ {fmt(liquidIncome)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bloco PF */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-violet-600 px-6 py-4 flex items-center gap-3 text-white">
                        <User size={20} />
                        <div>
                            <div className="font-bold">Pessoa Física (PF)</div>
                            <div className="text-violet-200 text-xs">Finanças pessoais</div>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Despesas Pessoais do Mês (R$)</label>
                            <input type="number" step="100" value={form.personalExpenses} onChange={e => setF('personalExpenses', Number(e.target.value))} className={InputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Valor Investido no Mês (R$)</label>
                            <input type="number" step="100" value={form.invested} onChange={e => setF('invested', Number(e.target.value))} className={InputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Previdência Privada PGBL/VGBL (R$)</label>
                            <input type="number" step="100" value={form.pgblVgblContribution} onChange={e => setF('pgblVgblContribution', Number(e.target.value))} className={InputCls} />
                            <p className={`text-xs mt-1 ${pgblOver ? 'text-red-600' : 'text-green-600'}`}>
                                {pgblOver ? `⚠️ Acima do limite de dedução (R$ ${fmt(pgblLimit)} — 12% da renda)` : `✓ Dentro do limite: R$ ${fmt(pgblLimit)}`}
                            </p>
                        </div>
                        <div className="pt-3 border-t border-slate-100">
                            <div className={`flex justify-between text-sm font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                <span>Saldo do mês:</span>
                                <span>R$ {fmt(balance)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reserva de emergência */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Shield size={20} className="text-emerald-600" />
                    <h3 className="font-bold text-slate-800">Reserva de Emergência</h3>
                    <span className="text-xs text-slate-400 ml-auto">Meta: 4x despesas mensais = R$ {fmt(emergencyGoal)}</span>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Reserva atual (R$)</label>
                    <input type="number" step="1000" value={form.emergencyReserve} onChange={e => setF('emergencyReserve', Number(e.target.value))} className={InputCls} />
                </div>
                <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>R$ {fmt(form.emergencyReserve)}</span>
                        <span>{emergencyPct.toFixed(0)}% da meta</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-3 rounded-full transition-all ${emergencyPct >= 100 ? 'bg-emerald-500' : emergencyPct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                            style={{ width: `${emergencyPct}%` }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        {emergencyPct >= 100 ? '✅ Reserva completa!' : `Faltam R$ ${fmt(emergencyGoal - form.emergencyReserve)} para atingir a meta`}
                    </p>
                </div>
            </div>

            {/* Relatório mensal */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <TrendingUp size={20} />
                    <h3 className="font-bold text-lg">Relatório Pessoal — {MONTHS_PT[parseInt(selectedMonth.slice(5, 7)) - 1]} / {selectedMonth.slice(0, 4)}</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Entrou líquido', value: liquidIncome, color: 'text-green-400' },
                        { label: 'Gasto (pessoal)', value: form.personalExpenses, color: 'text-red-400' },
                        { label: 'Investido', value: form.invested, color: 'text-blue-400' },
                        { label: 'Saldo final', value: balance, color: balance >= 0 ? 'text-emerald-400' : 'text-red-400' },
                    ].map(item => (
                        <div key={item.label} className="bg-white/10 rounded-xl p-3">
                            <div className="text-xs text-slate-300 mb-1">{item.label}</div>
                            <div className={`text-lg font-bold ${item.color}`}>R$ {fmt(item.value)}</div>
                        </div>
                    ))}
                </div>
                {form.notes !== undefined && (
                    <div className="mt-4">
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Observações do mês</label>
                        <textarea value={form.notes || ''} onChange={e => setF('notes', e.target.value)} rows={2}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md">
                    <Save size={16} /> Salvar Registro do Mês
                </button>
            </div>
        </div>
    );
};

export default PersonalFinanceView;
