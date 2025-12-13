import React, { useState, useMemo } from 'react';
import { Surgery } from '../types';
import { Search, Filter, Calendar, Download, Printer, FileSpreadsheet } from 'lucide-react';

interface SurgeryTableProps {
  surgeries: Surgery[];
}

const SurgeryTable: React.FC<SurgeryTableProps> = ({ surgeries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  
  // Date Range Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Extract unique doctors
  const doctors = useMemo(() => Array.from(new Set(surgeries.map(s => s.doctorName))).sort(), [surgeries]);

  const filteredSurgeries = useMemo(() => {
    return surgeries.filter(s => {
      const matchesSearch = 
        s.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.surgeryType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDoctor = doctorFilter ? s.doctorName === doctorFilter : true;
      
      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && s.date >= startDate;
      }
      if (endDate) {
        matchesDate = matchesDate && s.date <= endDate;
      }
      
      return matchesSearch && matchesDoctor && matchesDate;
    });
  }, [surgeries, searchTerm, doctorFilter, startDate, endDate]);

  const totalPoints = useMemo(() => filteredSurgeries.reduce((acc, s) => acc + s.points, 0), [filteredSurgeries]);
  const totalValue = useMemo(() => filteredSurgeries.reduce((acc, s) => acc + (s.cost || 0), 0), [filteredSurgeries]);

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (val: number) => 
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleExportCSV = () => {
    // Enhanced CSV Headers including new financial fields
    const headers = [
        "Data", 
        "Paciente", 
        "Médico", 
        "Área/Fonte", 
        "Cirurgia", 
        "Pontos", 
        "Convênio (Venda)", 
        "Valor R$ (Venda)", 
        "Observações"
    ];

    const csvContent = [
      headers.join(","),
      ...filteredSurgeries.map(s => {
        const row = [
          formatDate(s.date),
          `"${s.patientName}"`,
          `"${s.doctorName}"`,
          `"${s.source || 'Hapvida'}"`,
          `"${s.surgeryType}"`,
          s.points,
          `"${s.healthInsurance || '-'}"`,
          `"${(s.cost || 0).toFixed(2).replace('.', ',')}"`, // Excel friendly format
          `"${s.notes || ''}"`
        ];
        return row.join(",");
      })
    ].join("\n");

    // Add BOM for Excel UTF-8 compatibility
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `UroScore_Relatorio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] print-container">
      
      {/* Report Header (Visible only on Print) */}
      <div className="report-header hidden print:block text-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Relatório Analítico de Cirurgias</h1>
        <div className="text-sm text-slate-500 mt-2 border-b border-slate-200 pb-4">
            <span className="font-semibold">Gerado em:</span> {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
        </div>
        <div className="mt-4 flex justify-between px-8 text-sm">
            <p><span className="font-bold">Período:</span> {startDate ? formatDate(startDate) : 'Início'} até {endDate ? formatDate(endDate) : 'Hoje'}</p>
            {doctorFilter && <p><span className="font-bold">Médico:</span> {doctorFilter}</p>}
        </div>
      </div>

      {/* Filters Toolbar (Hidden on Print) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4 flex flex-col gap-4 no-print">
        <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Busca Textual</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar paciente ou cirurgia..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="min-w-[200px]">
                <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Filtrar por Médico</label>
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-slate-400 absolute ml-3 pointer-events-none" />
                    <select 
                        className="w-full py-2 pl-10 pr-8 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        value={doctorFilter}
                        onChange={(e) => setDoctorFilter(e.target.value)}
                    >
                        <option value="">Todos os Médicos</option>
                        {doctors.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex gap-2">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Data Inicial</label>
                    <input 
                        type="date"
                        className="py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Data Final</label>
                    <input 
                        type="date"
                        className="py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>
        </div>

        <div className="flex justify-between items-center border-t border-slate-100 pt-4">
            <div className="flex gap-6">
                <div>
                    <span className="text-xs text-slate-500 uppercase font-bold">Total Cirurgias</span>
                    <p className="text-xl font-bold text-slate-800">{filteredSurgeries.length}</p>
                </div>
                <div>
                    <span className="text-xs text-slate-500 uppercase font-bold">Total Pontos</span>
                    <p className="text-xl font-bold text-blue-600">{totalPoints}</p>
                </div>
                <div>
                    <span className="text-xs text-slate-500 uppercase font-bold">Total Venda Serviço</span>
                    <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalValue)}</p>
                </div>
            </div>

            <div className="flex gap-3">
                <button 
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors border border-emerald-200"
                >
                    <FileSpreadsheet size={18} />
                    Exportar Planilha (CSV)
                </button>
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <Printer size={18} />
                    Gerar PDF / Imprimir
                </button>
            </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col print:shadow-none print:border-none">
        <div className="overflow-auto flex-1 custom-scrollbar print:overflow-visible">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm print:bg-white print:border-b-2 print:border-black">
              <tr>
                <th className="px-6 py-3 font-semibold print:px-2">Data</th>
                <th className="px-6 py-3 font-semibold print:px-2">Paciente</th>
                <th className="px-6 py-3 font-semibold print:px-2">Médico</th>
                <th className="px-6 py-3 font-semibold print:px-2">Fonte</th>
                <th className="px-6 py-3 font-semibold print:px-2">Cirurgia</th>
                <th className="px-6 py-3 text-right font-semibold print:px-2">Pontos</th>
                <th className="px-6 py-3 text-right font-semibold print:px-2">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSurgeries.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors print:break-inside-avoid">
                  <td className="px-6 py-3 text-slate-500 whitespace-nowrap print:px-2">{formatDate(s.date)}</td>
                  <td className="px-6 py-3 font-medium text-slate-900 print:px-2">{s.patientName}</td>
                  <td className="px-6 py-3 text-slate-600 print:px-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 print:bg-transparent print:text-black print:p-0 print:border print:border-slate-300">
                      {s.doctorName}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-500 text-xs print:px-2">
                      {s.source || 'Hapvida'}
                      {s.healthInsurance && <span className="block text-[10px] text-emerald-600">{s.healthInsurance}</span>}
                  </td>
                  <td className="px-6 py-3 text-slate-600 max-w-xs truncate print:whitespace-normal print:overflow-visible print:px-2" title={s.surgeryType}>{s.surgeryType}</td>
                  <td className="px-6 py-3 text-right font-bold text-emerald-600 print:px-2">{s.points}</td>
                  <td className="px-6 py-3 text-right text-slate-500 print:px-2">{s.cost ? formatCurrency(s.cost) : '-'}</td>
                </tr>
              ))}
              {filteredSurgeries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Nenhuma cirurgia encontrada no período selecionado.
                  </td>
                </tr>
              )}
            </tbody>
            {/* Summary Footer for Print */}
            <tfoot className="hidden print:table-footer-group bg-gray-100 font-bold border-t-2 border-black">
                <tr>
                    <td colSpan={5} className="px-6 py-3 text-right uppercase text-xs">Totais do Período</td>
                    <td className="px-6 py-3 text-right text-black">{totalPoints} pts</td>
                    <td className="px-6 py-3 text-right text-black">{formatCurrency(totalValue)}</td>
                </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SurgeryTable;