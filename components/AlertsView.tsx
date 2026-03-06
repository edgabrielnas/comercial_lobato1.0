import React from 'react';
import { AlertTriangle, Clock, Info, CheckCircle, RefreshCw } from 'lucide-react';
import { MedicalProcedure, Gloss, InvoiceNFSe, SystemAlert } from '../types';
import { FinanceService } from '../services/financeService';

interface Props {
    procedures: MedicalProcedure[];
    glosses: Gloss[];
    invoices: InvoiceNFSe[];
}

const AlertsView: React.FC<Props> = ({ procedures, glosses, invoices }) => {
    const alerts = FinanceService.generateAlerts(procedures, glosses, invoices);
    const urgent = alerts.filter(a => a.level === 'urgent');
    const warning = alerts.filter(a => a.level === 'warning');
    const info = alerts.filter(a => a.level === 'info');

    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);

    // Previsão de recebimentos (FATURADO com prazo desta semana)
    const upcomingPayments = procedures.filter(p => {
        if (p.billingStatus !== 'FATURADO' || !p.expectedPaymentDate) return false;
        const d = new Date(p.expectedPaymentDate);
        const days = (d.getTime() - now.getTime()) / 86400000;
        return days >= 0 && days <= 7;
    });
    const upcomingTotal = upcomingPayments.reduce((a, p) => a + p.chargedValue, 0);

    // Resumo do mês
    const monthProcs = procedures.filter(p => p.date?.startsWith(currentMonth));
    const prevMonth = new Date(now); prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthStr = prevMonth.toISOString().slice(0, 7);
    const prevProcs = procedures.filter(p => p.date?.startsWith(prevMonthStr));
    const monthRevenue = monthProcs.reduce((a, p) => a + p.receivedValue, 0);
    const prevRevenue = prevProcs.reduce((a, p) => a + p.receivedValue, 0);
    const monthGrowth = prevRevenue > 0 ? ((monthRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : null;

    const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

    const AlertCard = ({ alert }: { alert: SystemAlert }) => {
        const config = {
            urgent: { border: 'border-red-200', bg: 'bg-red-50', icon: <AlertTriangle size={18} className="text-red-600 shrink-0" />, dot: 'bg-red-500' },
            warning: { border: 'border-amber-200', bg: 'bg-amber-50', icon: <Clock size={18} className="text-amber-600 shrink-0" />, dot: 'bg-amber-400' },
            info: { border: 'border-blue-200', bg: 'bg-blue-50', icon: <Info size={18} className="text-blue-600 shrink-0" />, dot: 'bg-blue-400' },
        }[alert.level];
        return (
            <div className={`flex items-start gap-3 rounded-xl p-4 border ${config.border} ${config.bg}`}>
                {config.icon}
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 text-sm">{alert.message}</div>
                    {alert.detail && <div className="text-xs text-slate-600 mt-0.5">{alert.detail}</div>}
                    {alert.action && <div className="mt-1 text-xs font-semibold text-slate-500">→ {alert.action}</div>}
                </div>
            </div>
        );
    };

    const SectionHeader = ({ emoji, label, color, count }: { emoji: string; label: string; color: string; count: number }) => (
        <div className={`flex items-center gap-2 font-bold text-base ${color}`}>
            <span>{emoji}</span> {label}
            <span className="ml-auto text-xs font-bold bg-white border rounded-full px-2 py-0.5">{count}</span>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header do painel */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 text-white">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold mb-1">Painel de Situação</h2>
                        <p className="text-slate-300 text-sm">{now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-400 mb-1">Alertas ativos</div>
                        <div className="text-3xl font-bold">{alerts.length}</div>
                    </div>
                </div>
                {alerts.length === 0 && (
                    <div className="mt-4 flex items-center gap-2 text-emerald-400">
                        <CheckCircle size={16} /> Tudo em ordem! Sem pendências no momento.
                    </div>
                )}
            </div>

            {/* Previsão da semana + resumo do mês */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="text-xs font-semibold text-slate-400 mb-1">💰 Previsto — próximos 7 dias</div>
                    <div className="text-2xl font-bold text-green-600">R$ {fmt(upcomingTotal)}</div>
                    <div className="text-xs text-slate-500 mt-1">{upcomingPayments.length} pagamento(s) esperado(s)</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="text-xs font-semibold text-slate-400 mb-1">📋 Produção {currentMonth}</div>
                    <div className="text-2xl font-bold text-blue-600">{monthProcs.length} procedimentos</div>
                    <div className="text-xs text-slate-500 mt-1">R$ {fmt(monthRevenue)} recebidos</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="text-xs font-semibold text-slate-400 mb-1">📈 vs mês anterior</div>
                    <div className={`text-2xl font-bold ${monthGrowth !== null && parseFloat(monthGrowth) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {monthGrowth !== null ? `${parseFloat(monthGrowth) >= 0 ? '+' : ''}${monthGrowth}%` : '—'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Comparado a {prevMonthStr}</div>
                </div>
            </div>

            {/* URGENTE */}
            {urgent.length > 0 && (
                <div className="space-y-2">
                    <SectionHeader emoji="🔴" label="URGENTE — Ação imediata" color="text-red-700" count={urgent.length} />
                    {urgent.map(a => <AlertCard key={a.id} alert={a} />)}
                </div>
            )}

            {/* ATENÇÃO */}
            {warning.length > 0 && (
                <div className="space-y-2">
                    <SectionHeader emoji="🟡" label="ATENÇÃO — Próximos 7 dias" color="text-amber-700" count={warning.length} />
                    {warning.map(a => <AlertCard key={a.id} alert={a} />)}
                </div>
            )}

            {/* INFORMATIVO */}
            {upcomingPayments.length > 0 && (
                <div className="space-y-2">
                    <SectionHeader emoji="🟢" label="INFORMATIVO — Previsão de recebimentos" color="text-green-700" count={upcomingPayments.length} />
                    {upcomingPayments.map(p => (
                        <AlertCard key={p.id} alert={{
                            id: `upcoming-${p.id}`,
                            level: 'info',
                            message: `💳 ${p.procedureName} — ${p.healthInsurance}`,
                            detail: `Previsto: ${p.expectedPaymentDate ? new Date(p.expectedPaymentDate).toLocaleDateString('pt-BR') : '—'} • R$ ${fmt(p.chargedValue)}`,
                            date: p.expectedPaymentDate || '',
                        }} />
                    ))}
                </div>
            )}

            {alerts.length === 0 && upcomingPayments.length === 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
                    <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
                    <div className="text-lg font-bold text-emerald-800 mb-1">Tudo em ordem!</div>
                    <div className="text-sm text-emerald-600">Nenhuma pendência crítica identificada.</div>
                </div>
            )}
        </div>
    );
};

export default AlertsView;
