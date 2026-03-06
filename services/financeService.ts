import { SupabaseService } from './supabaseService';
import {
    MedicalProcedure, HealthInsurance, Gloss,
    InvoiceNFSe, MedicalExpense, PersonalFinance, SystemAlert
} from '../types';

const getClient = () => {
    const client = SupabaseService.getClient();
    if (!client) throw new Error('Supabase não inicializado');
    return client;
};

// ── Helpers de mapeamento ──────────────────────────────────────────────────

const mapProcedure = (row: any): MedicalProcedure => ({
    id: row.id,
    date: row.date,
    patientIdentifier: row.patient_identifier,
    procedureType: row.procedure_type,
    location: row.location,
    tussCode: row.tuss_code,
    procedureName: row.procedure_name,
    healthInsurance: row.health_insurance,
    guideNumber: row.guide_number,
    tableValue: Number(row.table_value || 0),
    chargedValue: Number(row.charged_value || 0),
    receivedValue: Number(row.received_value || 0),
    billingStatus: row.billing_status,
    expectedPaymentDate: row.expected_payment_date,
    billingDate: row.billing_date,
    paymentDate: row.payment_date,
    doctorName: row.doctor_name,
    notes: row.notes,
    createdAt: row.created_at,
});

const mapInsurance = (row: any): HealthInsurance => ({
    id: row.id,
    name: row.name,
    referenceTable: row.reference_table,
    adjustmentPercentage: Number(row.adjustment_percentage || 0),
    contractualPaymentDays: Number(row.contractual_payment_days || 30),
    averageActualDays: Number(row.average_actual_days || 30),
    glossRate: Number(row.gloss_rate || 0),
    totalGlossedYear: Number(row.total_glossed_year || 0),
});

const mapGloss = (row: any): Gloss => ({
    id: row.id,
    procedureId: row.procedure_id,
    healthInsurance: row.health_insurance,
    glossCode: row.gloss_code,
    glossReason: row.gloss_reason,
    glossedValue: Number(row.glossed_value || 0),
    identifiedDate: row.identified_date,
    appealDeadline: row.appeal_deadline,
    appealStatus: row.appeal_status,
    appealNotes: row.appeal_notes,
});

const mapInvoice = (row: any): InvoiceNFSe => ({
    id: row.id,
    procedureId: row.procedure_id,
    issueDate: row.issue_date,
    serviceType: row.service_type,
    recipientType: row.recipient_type,
    recipientDocument: row.recipient_document,
    recipientName: row.recipient_name,
    city: row.city,
    grossValue: Number(row.gross_value || 0),
    issRate: Number(row.iss_rate || 2),
    issWithheld: Boolean(row.iss_withheld),
    irWithheld: Boolean(row.ir_withheld),
    inssWithheld: Boolean(row.inss_withheld),
    netValue: Number(row.net_value || 0),
    nfseNumber: row.nfse_number,
    status: row.status,
    competenceMonth: row.competence_month,
    notes: row.notes,
});

const mapExpense = (row: any): MedicalExpense => ({
    id: row.id,
    date: row.date,
    category: row.category,
    description: row.description,
    value: Number(row.value || 0),
    entity: row.entity,
    isDeductible: Boolean(row.is_deductible),
});

const mapPersonal = (row: any): PersonalFinance => ({
    id: row.id,
    month: row.month,
    prolaboreDefined: Number(row.prolabore_defined || 0),
    prolaboreWithdrawn: Number(row.prolabore_withdrawn || 0),
    dividends: Number(row.dividends || 0),
    personalExpenses: Number(row.personal_expenses || 0),
    invested: Number(row.invested || 0),
    emergencyReserve: Number(row.emergency_reserve || 0),
    pgblVgblContribution: Number(row.pgbl_vgbl_contribution || 0),
    notes: row.notes,
});

// ── MÓDULO 1: Procedimentos ────────────────────────────────────────────────

export const FinanceService = {

    fetchProcedures: async (): Promise<MedicalProcedure[]> => {
        const sb = getClient();
        const { data, error } = await sb.from('medical_procedures').select('*').order('date', { ascending: false });
        if (error) throw error;
        return (data || []).map(mapProcedure);
    },

    saveProcedure: async (p: MedicalProcedure): Promise<void> => {
        const sb = getClient();
        const { error } = await sb.from('medical_procedures').upsert({
            id: p.id,
            date: p.date,
            patient_identifier: p.patientIdentifier,
            procedure_type: p.procedureType,
            location: p.location,
            tuss_code: p.tussCode,
            procedure_name: p.procedureName,
            health_insurance: p.healthInsurance,
            guide_number: p.guideNumber,
            table_value: p.tableValue,
            charged_value: p.chargedValue,
            received_value: p.receivedValue,
            billing_status: p.billingStatus,
            expected_payment_date: p.expectedPaymentDate || null,
            billing_date: p.billingDate || null,
            payment_date: p.paymentDate || null,
            doctor_name: p.doctorName,
            notes: p.notes,
        }, { onConflict: 'id' });
        if (error) throw error;
    },

    deleteProcedure: async (id: string): Promise<void> => {
        const sb = getClient();
        const { error } = await sb.from('medical_procedures').delete().eq('id', id);
        if (error) throw error;
    },

    // ── MÓDULO 2: Convênios ──────────────────────────────────────────────────

    fetchInsurances: async (): Promise<HealthInsurance[]> => {
        const sb = getClient();
        const { data, error } = await sb.from('health_insurances').select('*').order('name');
        if (error) throw error;
        return (data || []).map(mapInsurance);
    },

    saveInsurance: async (ins: HealthInsurance): Promise<void> => {
        const sb = getClient();
        const { error } = await sb.from('health_insurances').upsert({
            id: ins.id,
            name: ins.name,
            reference_table: ins.referenceTable,
            adjustment_percentage: ins.adjustmentPercentage,
            contractual_payment_days: ins.contractualPaymentDays,
            average_actual_days: ins.averageActualDays,
            gloss_rate: ins.glossRate,
            total_glossed_year: ins.totalGlossedYear,
        }, { onConflict: 'id' });
        if (error) throw error;
    },

    // ── MÓDULO 2: Glosas ────────────────────────────────────────────────────

    fetchGlosses: async (): Promise<Gloss[]> => {
        const sb = getClient();
        const { data, error } = await sb.from('glosses').select('*').order('identified_date', { ascending: false });
        if (error) throw error;
        return (data || []).map(mapGloss);
    },

    saveGloss: async (g: Gloss): Promise<void> => {
        const sb = getClient();
        const { error } = await sb.from('glosses').upsert({
            id: g.id,
            procedure_id: g.procedureId || null,
            health_insurance: g.healthInsurance,
            gloss_code: g.glossCode,
            gloss_reason: g.glossReason,
            glossed_value: g.glossedValue,
            identified_date: g.identifiedDate,
            appeal_deadline: g.appealDeadline || null,
            appeal_status: g.appealStatus,
            appeal_notes: g.appealNotes,
        }, { onConflict: 'id' });
        if (error) throw error;
    },

    deleteGloss: async (id: string): Promise<void> => {
        const sb = getClient();
        const { error } = await sb.from('glosses').delete().eq('id', id);
        if (error) throw error;
    },

    // ── MÓDULO 3: NFS-e ─────────────────────────────────────────────────────

    fetchInvoices: async (): Promise<InvoiceNFSe[]> => {
        const sb = getClient();
        const { data, error } = await sb.from('invoices_nfse').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(mapInvoice);
    },

    saveInvoice: async (inv: InvoiceNFSe): Promise<void> => {
        const sb = getClient();
        const { error } = await sb.from('invoices_nfse').upsert({
            id: inv.id,
            procedure_id: inv.procedureId || null,
            issue_date: inv.issueDate || null,
            service_type: inv.serviceType,
            recipient_type: inv.recipientType,
            recipient_document: inv.recipientDocument,
            recipient_name: inv.recipientName,
            city: inv.city,
            gross_value: inv.grossValue,
            iss_rate: inv.issRate,
            iss_withheld: inv.issWithheld,
            ir_withheld: inv.irWithheld,
            inss_withheld: inv.inssWithheld,
            net_value: inv.netValue,
            nfse_number: inv.nfseNumber,
            status: inv.status,
            competence_month: inv.competenceMonth,
            notes: inv.notes,
        }, { onConflict: 'id' });
        if (error) throw error;
    },

    deleteInvoice: async (id: string): Promise<void> => {
        const sb = getClient();
        const { error } = await sb.from('invoices_nfse').delete().eq('id', id);
        if (error) throw error;
    },

    // ── MÓDULO 4: Despesas ───────────────────────────────────────────────────

    fetchExpenses: async (): Promise<MedicalExpense[]> => {
        const sb = getClient();
        const { data, error } = await sb.from('medical_expenses').select('*').order('date', { ascending: false });
        if (error) throw error;
        return (data || []).map(mapExpense);
    },

    saveExpense: async (exp: MedicalExpense): Promise<void> => {
        const sb = getClient();
        const { error } = await sb.from('medical_expenses').upsert({
            id: exp.id,
            date: exp.date,
            category: exp.category,
            description: exp.description,
            value: exp.value,
            entity: exp.entity,
            is_deductible: exp.isDeductible,
        }, { onConflict: 'id' });
        if (error) throw error;
    },

    deleteExpense: async (id: string): Promise<void> => {
        const sb = getClient();
        const { error } = await sb.from('medical_expenses').delete().eq('id', id);
        if (error) throw error;
    },

    // ── MÓDULO 6: Financeiro Pessoal ─────────────────────────────────────────

    fetchPersonalFinance: async (): Promise<PersonalFinance[]> => {
        const sb = getClient();
        const { data, error } = await sb.from('personal_finance').select('*').order('month', { ascending: false });
        if (error) throw error;
        return (data || []).map(mapPersonal);
    },

    savePersonalFinance: async (pf: PersonalFinance): Promise<void> => {
        const sb = getClient();
        const { error } = await sb.from('personal_finance').upsert({
            id: pf.id,
            month: pf.month,
            prolabore_defined: pf.prolaboreDefined,
            prolabore_withdrawn: pf.prolaboreWithdrawn,
            dividends: pf.dividends,
            personal_expenses: pf.personalExpenses,
            invested: pf.invested,
            emergency_reserve: pf.emergencyReserve,
            pgbl_vgbl_contribution: pf.pgblVgblContribution,
            notes: pf.notes,
        }, { onConflict: 'id' });
        if (error) throw error;
    },

    // ── MÓDULO 5: Geração de Alertas ─────────────────────────────────────────

    generateAlerts: (
        procedures: MedicalProcedure[],
        glosses: Gloss[],
        invoices: InvoiceNFSe[]
    ): SystemAlert[] => {
        const alerts: SystemAlert[] = [];
        const now = new Date();

        // Procedimentos REALIZADO há mais de 48h sem faturar
        procedures.forEach(p => {
            if (p.billingStatus === 'REALIZADO') {
                const procedureDate = new Date(p.date);
                const hoursElapsed = (now.getTime() - procedureDate.getTime()) / (1000 * 60 * 60);
                if (hoursElapsed > 48) {
                    alerts.push({
                        id: `unfilled-${p.id}`,
                        level: 'urgent',
                        message: `⚠️ CONTA NÃO FATURADA: ${p.procedureName}`,
                        detail: `Paciente: ${p.patientIdentifier} • Data: ${new Date(p.date).toLocaleDateString('pt-BR')} • ${Math.floor(hoursElapsed)}h sem faturar`,
                        action: 'Faturar agora',
                        date: p.date,
                    });
                }
            }
        });

        // Pagamentos atrasados (FATURADO após prazo esperado)
        procedures.forEach(p => {
            if (p.billingStatus === 'FATURADO' && p.expectedPaymentDate) {
                const payDeadline = new Date(p.expectedPaymentDate);
                const daysLate = Math.floor((now.getTime() - payDeadline.getTime()) / (1000 * 60 * 60 * 24));
                if (daysLate > 0) {
                    alerts.push({
                        id: `overdue-${p.id}`,
                        level: daysLate > 30 ? 'urgent' : 'warning',
                        message: `🔴 PAGAMENTO ATRASADO: ${p.healthInsurance}`,
                        detail: `${p.procedureName} • R$ ${p.chargedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • ${daysLate} dias em atraso`,
                        action: 'Cobrar convênio',
                        date: p.expectedPaymentDate,
                    });
                }
            }
        });

        // Prazos de recurso de glosa vencendo em < 5 dias
        glosses.forEach(g => {
            if (g.appealStatus === 'PENDENTE' && g.appealDeadline) {
                const deadline = new Date(g.appealDeadline);
                const daysLeft = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                if (daysLeft >= 0 && daysLeft <= 5) {
                    alerts.push({
                        id: `gloss-deadline-${g.id}`,
                        level: daysLeft <= 2 ? 'urgent' : 'warning',
                        message: `📋 PRAZO DE RECURSO: ${daysLeft === 0 ? 'HOJE' : `${daysLeft} dias restantes`}`,
                        detail: `Glosa R$ ${g.glossedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} — ${g.healthInsurance} — ${g.glossReason}`,
                        action: 'Enviar recurso',
                        date: g.appealDeadline,
                    });
                } else if (daysLeft < 0 && g.appealStatus === 'PENDENTE') {
                    alerts.push({
                        id: `gloss-expired-${g.id}`,
                        level: 'urgent',
                        message: `🚨 PRAZO DE RECURSO VENCIDO: ${g.healthInsurance}`,
                        detail: `Glosa R$ ${g.glossedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} — ${Math.abs(daysLeft)} dias expirado`,
                        action: 'Verificar possibilidade de recurso tardio',
                        date: g.appealDeadline,
                    });
                }
            }
        });

        // NFs pendentes (procedimentos PAGO sem NF emitida)
        const paidWithoutInvoice = procedures.filter(p =>
            p.billingStatus === 'PAGO' &&
            !invoices.some(inv => inv.procedureId === p.id && inv.status === 'EMITIDA')
        );
        if (paidWithoutInvoice.length > 0) {
            alerts.push({
                id: 'nfs-pending',
                level: 'warning',
                message: `📊 NFs PENDENTES: ${paidWithoutInvoice.length} procedimentos pagos sem nota emitida`,
                detail: paidWithoutInvoice.map(p => p.procedureName).slice(0, 3).join(', ') + (paidWithoutInvoice.length > 3 ? '...' : ''),
                action: 'Emitir notas fiscais',
                date: new Date().toISOString().split('T')[0],
            });
        }

        return alerts.sort((a, b) => {
            const order = { urgent: 0, warning: 1, info: 2 };
            return order[a.level] - order[b.level];
        });
    },
};
