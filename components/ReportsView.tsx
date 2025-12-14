import React, { useState, useMemo } from 'react';
import { Surgery } from '../types';
import { 
  Download, Printer, Filter, CheckCircle, Clock, DollarSign, 
  FileSpreadsheet, FileText, ChevronDown 
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface ReportsViewProps {
  surgeries: Surgery[];
  monthlyBudget: number;
  onTogglePayment: (id: string) => void;
}

type TabType = 'hapvida' | 'venda' | 'carta';
type FilterStatus = 'all' | 'paid' | 'pending';

const ReportsView: React.FC<ReportsViewProps> = ({ surgeries, monthlyBudget, onTogglePayment }) => {
  const [activeTab, setActiveTab] = useState<TabType>('hapvida');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Filter Data Logic
  const filteredData = useMemo(() => {
    let sourceFilter = '';
    if (activeTab === 'hapvida') sourceFilter = 'Hapvida';
    else if (activeTab === 'venda') sourceFilter = 'Venda de Serviço';
    else if (activeTab === 'carta') sourceFilter = 'Carta de Rede';

    return surgeries.filter(s => {
      // Source Check (Handle undefined as Hapvida default)
      const sSource = s.source || 'Hapvida';
      const isSourceMatch = sSource === sourceFilter;

      // Date Check
      const dateMatch = (!startDate || s.date >= startDate) && (!endDate || s.date <= endDate);

      // Status Check (Only for Venda/Carta)
      let statusMatch = true;
      if (activeTab !== 'hapvida') {
        if (statusFilter === 'paid') statusMatch = s.isPaid === true;
        if (statusFilter === 'pending') statusMatch = !s.isPaid;
      }

      return isSourceMatch && dateMatch && statusMatch;
    });
  }, [surgeries, activeTab, startDate, endDate, statusFilter]);

  // Financial Calculations
  const metrics = useMemo(() => {
    if (activeTab === 'hapvida') {
        const totalPoints = filteredData.reduce((acc, s) => acc + s.points, 0);
        // Calculate estimated value based on global monthly budget vs total points in period (Simplification)
        const estimatedValue = totalPoints > 0 ? monthlyBudget : 0; 
        
        return { 
            type: 'hapvida',
            totalPoints, 
            estimatedValue 
        };
    } else {
        const totalValue = filteredData.reduce((acc, s) => acc + (s.cost || 0), 0);
        const receivedValue = filteredData.filter(s => s.isPaid).reduce((acc, s) => acc + (s.cost || 0), 0);
        const pendingValue = totalValue - receivedValue;
        
        return { 
            type: 'financial',
            totalValue, 
            receivedValue, 
            pendingValue 
        };
    }
  }, [filteredData, activeTab, monthlyBudget]);

  // Chart Data
  const chartData = useMemo(() => {
      if (activeTab === 'hapvida' || metrics.type !== 'financial') return [];
      
      const received = metrics.receivedValue || 0;
      const pending = metrics.pendingValue || 0;

      // Handle empty data to avoid chart errors
      if (received === 0 && pending === 0) return [{ name: 'Sem Dados', value: 1 }];

      return [
          { name: 'Recebido', value: received, color: '#10b981' },
          { name: 'Pendente', value: pending, color: '#f59e0b' }
      ];
  }, [metrics, activeTab]);

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatDate = (date: string) => date.split('-').reverse().join('/');

  // Export Functions
  const handleExport = (format: 'csv' | 'xls') => {
    const headers = activeTab === 'hapvida' 
        ? ["Data", "Paciente", "Médico", "Cirurgia", "Pontos"]
        : ["Data", "Paciente", "Médico", "Cirurgia", "Convênio", "Valor (R$)", "Status"];

    const csvContent = [
        headers.join(","),
        ...filteredData.map(s => {
            if (activeTab === 'hapvida') {
                return [formatDate(s.date), `"${s.patientName}"`, `"${s.doctorName}"`, `"${s.surgeryType}"`, s.points].join(",");
            } else {
                return [
                    formatDate(s.date), 
                    `"${s.patientName}"`, 
                    `"${s.doctorName}"`, 
                    `"${s.surgeryType}"`, 
                    `"${s.healthInsurance || '-'}"`, 
                    (s.cost || 0).toFixed(2).replace('.', ','),
                    s.isPaid ? "Recebido" : "Pendente"
                ].join(",");
            }
        })
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: format === 'xls' ? 'application/vnd.ms-excel;charset=utf-8' : 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Relatorio_${activeTab}_${new Date().toISOString().split('T')[0]}.${format === 'xls' ? 'xls' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportMenuOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 print-container">
      
      {/* Header and Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2 no-print">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Central de Relatórios</h2>
            <p className="text-slate-500">Gerenciamento de recebimentos e exportação de dados.</p>
        </div>
        
        {/* Export Dropdown */}
        <div className="relative w-full md:w-auto">
            <button 
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors shadow-sm"
            >
                <Download size={18} /> Exportar
                <ChevronDown size={16} />
            </button>
            {exportMenuOpen && (
                <div className="absolute right-0 mt-2 w-full md:w-48 bg-white rounded-lg shadow-xl border border-slate-100 z-50 overflow-hidden">
                    <button onClick={() => handleExport('xls')} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-700">
                        <FileSpreadsheet size={16} className="text-green-600" /> Excel (.xls)
                    </button>
                    <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-700">
                        <FileText size={16} className="text-blue-600" /> CSV Padrão
                    </button>
                    <button onClick={() => window.print()} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-700">
                        <Printer size={16} className="text-slate-600" /> Imprimir / PDF
                    </button>
                </div>
            )}
        </div>
      </div>

      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-2 no-print overflow-x-auto">
        <button onClick={() => setActiveTab('hapvida')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'hapvida' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>Hapvida</button>
        <button onClick={() => setActiveTab('venda')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'venda' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>Venda de Serviço</button>
        <button onClick={() => setActiveTab('carta')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'carta' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>Carta de Rede</button>
      </div>

      {/* Report Header for Print */}
      <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold uppercase">Relatório - {activeTab === 'hapvida' ? 'Produção Hapvida' : activeTab === 'venda' ? 'Venda de Serviço' : 'Carta de Rede'}</h1>
          <p>Gerado em: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Filters Area */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-end no-print">
         <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Data Inicial</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
         </div>
         <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Data Final</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
         </div>
         {activeTab !== 'hapvida' && (
             <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
                 <button onClick={() => setStatusFilter('all')} className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap ${statusFilter === 'all' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Todos</button>
                 <button onClick={() => setStatusFilter('pending')} className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap ${statusFilter === 'pending' ? 'bg-white shadow text-amber-600' : 'text-slate-500'}`}>Pendentes</button>
                 <button onClick={() => setStatusFilter('paid')} className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap ${statusFilter === 'paid' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'}`}>Recebidos</button>
             </div>
         )}
      </div>

      {/* DASHBOARD SECTION (For Venda/Carta) */}
      {activeTab !== 'hapvida' && metrics.type === 'financial' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cards */}
              <div className="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <p className="text-slate-500 text-sm font-medium">Valor Total</p>
                      <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(metrics.totalValue || 0)}</h3>
                  </div>
                  <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle size={16} className="text-emerald-600" />
                        <p className="text-emerald-800 text-sm font-bold">Recebido</p>
                      </div>
                      <h3 className="text-2xl font-bold text-emerald-700">{formatCurrency(metrics.receivedValue || 0)}</h3>
                  </div>
                  <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={16} className="text-amber-600" />
                        <p className="text-amber-800 text-sm font-bold">Pendente</p>
                      </div>
                      <h3 className="text-2xl font-bold text-amber-700">{formatCurrency(metrics.pendingValue || 0)}</h3>
                  </div>
              </div>

              {/* Chart */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-40 flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie 
                            data={chartData} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={40} 
                            outerRadius={60} 
                            paddingAngle={5}
                          >
                              {chartData.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={entry.color || '#ccc'} />
                              ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="middle" layout="vertical" align="right" wrapperStyle={{fontSize: '10px'}} />
                      </PieChart>
                  </ResponsiveContainer>
              </div>
          </div>
      )}

      {/* DASHBOARD SECTION (For Hapvida) */}
      {activeTab === 'hapvida' && metrics.type === 'hapvida' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <p className="text-blue-800 text-sm font-bold mb-1">Total de Pontos (Período)</p>
                  <h3 className="text-3xl font-bold text-blue-700">{metrics.totalPoints}</h3>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <p className="text-slate-500 text-sm font-medium mb-1">Verba Disponível (Referência)</p>
                  <h3 className="text-3xl font-bold text-slate-800">{formatCurrency(monthlyBudget)}</h3>
                  <p className="text-xs text-slate-400 mt-2">*O valor do ponto varia conforme o total produzido.</p>
              </div>
          </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:border-black print:shadow-none flex flex-col">
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-sm text-left min-w-[800px] lg:min-w-full">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs print:bg-slate-100 print:text-black">
                  <tr>
                      <th className="px-6 py-3 font-semibold">Data</th>
                      <th className="px-6 py-3 font-semibold">Paciente</th>
                      <th className="px-6 py-3 font-semibold">Médico</th>
                      <th className="px-6 py-3 font-semibold">Procedimento</th>
                      {activeTab !== 'hapvida' && <th className="px-6 py-3 font-semibold">Convênio</th>}
                      <th className="px-6 py-3 text-right font-semibold">{activeTab === 'hapvida' ? 'Pontos' : 'Valor (R$)'}</th>
                      {activeTab !== 'hapvida' && <th className="px-6 py-3 text-center font-semibold no-print">Recebido?</th>}
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {filteredData.map(s => (
                      <tr key={s.id} className={`hover:bg-slate-50 ${s.isPaid && activeTab !== 'hapvida' ? 'bg-emerald-50/30' : ''}`}>
                          <td className="px-6 py-3 whitespace-nowrap text-slate-500">{formatDate(s.date)}</td>
                          <td className="px-6 py-3 font-medium text-slate-900">{s.patientName}</td>
                          <td className="px-6 py-3 text-slate-600 text-xs uppercase">{s.doctorName}</td>
                          <td className="px-6 py-3 text-slate-600 truncate max-w-[200px]" title={s.surgeryType}>{s.surgeryType}</td>
                          {activeTab !== 'hapvida' && <td className="px-6 py-3 text-slate-500 text-xs">{s.healthInsurance || '-'}</td>}
                          
                          <td className={`px-6 py-3 text-right font-bold ${activeTab === 'hapvida' ? 'text-blue-600' : 'text-emerald-600'}`}>
                              {activeTab === 'hapvida' ? s.points : formatCurrency(s.cost || 0)}
                          </td>

                          {activeTab !== 'hapvida' && (
                              <td className="px-6 py-3 text-center no-print">
                                  <label className="inline-flex items-center cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        checked={!!s.isPaid} 
                                        onChange={() => onTogglePayment(s.id)}
                                        className="sr-only peer"
                                      />
                                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 relative flex items-center">
                                          {/* Simple Toggle UI */}
                                      </div>
                                  </label>
                              </td>
                          )}
                      </tr>
                  ))}
                  {filteredData.length === 0 && (
                      <tr>
                          <td colSpan={activeTab === 'hapvida' ? 6 : 7} className="text-center p-8 text-slate-400">
                              Nenhum registro encontrado para os filtros selecionados.
                          </td>
                      </tr>
                  )}
              </tbody>
              <tfoot className="bg-slate-50 font-bold text-slate-800 print:bg-slate-100 print:border-t print:border-black">
                  <tr>
                      <td colSpan={activeTab === 'hapvida' ? 5 : 5} className="px-6 py-3 text-right uppercase text-xs">Total do Relatório</td>
                      <td className="px-6 py-3 text-right">
                          {activeTab === 'hapvida' && metrics.type === 'hapvida'
                            ? metrics.totalPoints 
                            : metrics.type === 'financial' 
                              ? formatCurrency(metrics.totalValue || 0)
                              : '-'
                          }
                      </td>
                      {activeTab !== 'hapvida' && <td className="no-print"></td>}
                  </tr>
              </tfoot>
            </table>
          </div>
      </div>
    </div>
  );
};

export default ReportsView;