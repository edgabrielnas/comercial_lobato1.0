
import React, { useState, useMemo } from 'react';
import { Surgery, DoctorConfig } from '../types';
import { Settings, Save, Printer, DollarSign, Clock, Briefcase, Activity } from 'lucide-react';

interface PaymentsViewProps {
  surgeries: Surgery[];
  monthlyBudget: number;
  doctorConfigs: DoctorConfig[];
  onSaveConfigs: (configs: DoctorConfig[]) => void;
  isAdmin: boolean;
}

const PaymentsView: React.FC<PaymentsViewProps> = ({ surgeries, monthlyBudget, doctorConfigs, onSaveConfigs, isAdmin }) => {
  // --- Date Filters ---
  const getLocalDate = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d;
  };
  const today = getLocalDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [isEditing, setIsEditing] = useState(false);

  // Local state for editing configs
  const [localConfigs, setLocalConfigs] = useState<DoctorConfig[]>(doctorConfigs);

  // 1. Unique Doctors List
  const doctors = useMemo(() => Array.from(new Set(surgeries.map(s => s.doctorName))).sort(), [surgeries]);

  // Initialize missing configs
  useMemo(() => {
      let hasNew = false;
      const updated = [...localConfigs];
      doctors.forEach(doc => {
          if (!updated.find(c => c.doctorName === doc)) {
              updated.push({
                  id: doc,
                  doctorName: doc,
                  fixedValue: 0,
                  timeValue: 0,
                  roleValue: 0,
                  roleDescription: ''
              });
              hasNew = true;
          }
      });
      if (hasNew) setLocalConfigs(updated);
  }, [doctors, localConfigs]);

  // 2. Filter Surgeries by Period & Source (Only Hapvida/Pool counts for points distribution usually)
  const filteredSurgeries = useMemo(() => {
    return surgeries.filter(s => {
      const dateMatch = (!startDate || s.date >= startDate) && (!endDate || s.date <= endDate);
      // Assuming Points Rateio only applies to Hapvida or General Pool sources, not Venda de Serviço direct sales
      const isPool = s.source !== 'Venda de Serviço'; 
      return dateMatch && isPool;
    });
  }, [surgeries, startDate, endDate]);

  // 3. Calculate Points & Variable Value
  const calculation = useMemo(() => {
      const totalPoints = filteredSurgeries.reduce((acc, s) => acc + s.points, 0);
      const pointValue = totalPoints > 0 ? monthlyBudget / totalPoints : 0;

      const payroll = doctors.map(doc => {
          const docPoints = filteredSurgeries
            .filter(s => s.doctorName === doc)
            .reduce((acc, s) => acc + s.points, 0);
          
          const variablePayment = docPoints * pointValue;
          
          // Get Config
          const config = localConfigs.find(c => c.doctorName === doc) || { fixedValue: 0, timeValue: 0, roleValue: 0, roleDescription: '' };
          
          return {
              doctorName: doc,
              points: docPoints,
              variablePayment,
              fixedValue: config.fixedValue,
              timeValue: config.timeValue,
              roleValue: config.roleValue,
              roleDescription: config.roleDescription,
              total: variablePayment + config.fixedValue + config.timeValue + config.roleValue
          };
      }).sort((a, b) => b.total - a.total);

      return { totalPoints, pointValue, payroll };
  }, [filteredSurgeries, monthlyBudget, doctors, localConfigs]);

  const handleConfigChange = (docName: string, field: keyof DoctorConfig, value: any) => {
      setLocalConfigs(prev => prev.map(c => 
          c.doctorName === docName ? { ...c, [field]: value } : c
      ));
  };

  const saveChanges = () => {
      onSaveConfigs(localConfigs);
      setIsEditing(false);
  };

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6 animate-fade-in pb-12 print-container">
      
      {/* Header & Controls (Hidden on Print) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2 no-print">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Folha de Pagamento Médica</h2>
            <p className="text-slate-500">Cálculo de repasse baseado em produtividade e valores fixos.</p>
        </div>
        <div className="flex gap-2">
            {isAdmin && (
                <button 
                    onClick={() => isEditing ? saveChanges() : setIsEditing(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${isEditing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
                >
                    {isEditing ? <><Save size={18} /> Salvar Configurações</> : <><Settings size={18} /> Configurar Valores</>}
                </button>
            )}
            <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                <Printer size={18} /> Imprimir
            </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end no-print">
         <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Início do Ciclo</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
         </div>
         <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Fim do Ciclo</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
         </div>
         <div className="flex-1 text-right">
             <span className="text-xs text-slate-500 uppercase font-bold block">Verba Disponível</span>
             <span className="text-xl font-bold text-emerald-600">{formatCurrency(monthlyBudget)}</span>
         </div>
         <div className="text-right pl-4 border-l border-slate-100">
             <span className="text-xs text-slate-500 uppercase font-bold block">Total Pontos</span>
             <span className="text-xl font-bold text-blue-600">{calculation.totalPoints} pts</span>
         </div>
         <div className="text-right pl-4 border-l border-slate-100">
             <span className="text-xs text-slate-500 uppercase font-bold block">Valor Ponto</span>
             <span className="text-xl font-bold text-indigo-600">{formatCurrency(calculation.pointValue)}</span>
         </div>
      </div>

      {/* Report Header for Print */}
      <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold uppercase">Demonstrativo de Pagamento Médico</h1>
          <p>Período: {startDate.split('-').reverse().join('/')} a {endDate.split('-').reverse().join('/')}</p>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:border-black print:shadow-none">
          <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs print:bg-slate-100 print:text-black">
                  <tr>
                      <th className="px-6 py-4 font-semibold">Médico</th>
                      <th className="px-6 py-4 text-center bg-blue-50/50 print:bg-transparent">
                          <div className="flex flex-col items-center">
                              <Activity size={16} className="mb-1 text-blue-500" />
                              <span>Produção</span>
                          </div>
                      </th>
                      <th className="px-6 py-4 text-center bg-emerald-50/50 print:bg-transparent">
                          <div className="flex flex-col items-center">
                              <DollarSign size={16} className="mb-1 text-emerald-500" />
                              <span>Fixo</span>
                          </div>
                      </th>
                      <th className="px-6 py-4 text-center bg-amber-50/50 print:bg-transparent">
                           <div className="flex flex-col items-center">
                              <Clock size={16} className="mb-1 text-amber-500" />
                              <span>Tempo</span>
                          </div>
                      </th>
                      <th className="px-6 py-4 text-center bg-purple-50/50 print:bg-transparent">
                           <div className="flex flex-col items-center">
                              <Briefcase size={16} className="mb-1 text-purple-500" />
                              <span>Cargos</span>
                          </div>
                      </th>
                      <th className="px-6 py-4 text-right font-bold text-slate-800 bg-slate-100 print:bg-slate-100">Total a Pagar</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {calculation.payroll.map((row) => (
                      <tr key={row.doctorName} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-900">{row.doctorName}</td>
                          
                          {/* Variable (Points) */}
                          <td className="px-6 py-4 text-center bg-blue-50/30 print:bg-transparent">
                              <div className="font-bold text-blue-700">{formatCurrency(row.variablePayment)}</div>
                              <div className="text-xs text-blue-400">{row.points} pontos</div>
                          </td>

                          {/* Fixed */}
                          <td className="px-6 py-4 text-center bg-emerald-50/30 print:bg-transparent">
                              {isEditing ? (
                                  <input 
                                    type="number" 
                                    className="w-24 p-1 text-center border rounded border-emerald-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={row.fixedValue}
                                    onChange={e => handleConfigChange(row.doctorName, 'fixedValue', parseFloat(e.target.value))}
                                  />
                              ) : (
                                  <span className="text-emerald-700 font-medium">{formatCurrency(row.fixedValue)}</span>
                              )}
                          </td>

                          {/* Time */}
                          <td className="px-6 py-4 text-center bg-amber-50/30 print:bg-transparent">
                              {isEditing ? (
                                  <input 
                                    type="number" 
                                    className="w-24 p-1 text-center border rounded border-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
                                    value={row.timeValue}
                                    onChange={e => handleConfigChange(row.doctorName, 'timeValue', parseFloat(e.target.value))}
                                  />
                              ) : (
                                  <span className="text-amber-700 font-medium">{formatCurrency(row.timeValue)}</span>
                              )}
                          </td>

                          {/* Role */}
                          <td className="px-6 py-4 text-center bg-purple-50/30 print:bg-transparent">
                              {isEditing ? (
                                  <div className="flex flex-col gap-1 items-center">
                                      <input 
                                        type="number" 
                                        className="w-24 p-1 text-center border rounded border-purple-300 focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={row.roleValue}
                                        onChange={e => handleConfigChange(row.doctorName, 'roleValue', parseFloat(e.target.value))}
                                      />
                                      <input 
                                        type="text" 
                                        className="w-24 p-1 text-xs text-center border rounded border-purple-200"
                                        placeholder="Cargo..."
                                        value={row.roleDescription || ''}
                                        onChange={e => handleConfigChange(row.doctorName, 'roleDescription', e.target.value)}
                                      />
                                  </div>
                              ) : (
                                  <div>
                                      <div className="text-purple-700 font-medium">{formatCurrency(row.roleValue)}</div>
                                      {row.roleDescription && <div className="text-[10px] uppercase tracking-wide text-purple-400">{row.roleDescription}</div>}
                                  </div>
                              )}
                          </td>

                          {/* Total */}
                          <td className="px-6 py-4 text-right font-bold text-slate-800 bg-slate-50 print:bg-slate-100 text-lg">
                              {formatCurrency(row.total)}
                          </td>
                      </tr>
                  ))}
                  {calculation.payroll.length === 0 && (
                      <tr><td colSpan={6} className="text-center p-8 text-slate-400">Nenhum médico encontrado no período.</td></tr>
                  )}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t border-slate-200">
                  <tr>
                      <td className="px-6 py-4 uppercase text-xs text-slate-500">Total Geral</td>
                      <td className="px-6 py-4 text-center text-blue-600">{formatCurrency(calculation.payroll.reduce((a,b) => a + b.variablePayment, 0))}</td>
                      <td className="px-6 py-4 text-center text-emerald-600">{formatCurrency(calculation.payroll.reduce((a,b) => a + b.fixedValue, 0))}</td>
                      <td className="px-6 py-4 text-center text-amber-600">{formatCurrency(calculation.payroll.reduce((a,b) => a + b.timeValue, 0))}</td>
                      <td className="px-6 py-4 text-center text-purple-600">{formatCurrency(calculation.payroll.reduce((a,b) => a + b.roleValue, 0))}</td>
                      <td className="px-6 py-4 text-right text-slate-900 text-lg">{formatCurrency(calculation.payroll.reduce((a,b) => a + b.total, 0))}</td>
                  </tr>
              </tfoot>
          </table>
      </div>
    </div>
  );
};

export default PaymentsView;
