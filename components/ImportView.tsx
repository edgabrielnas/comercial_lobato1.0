import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, FileSpreadsheet, Download, Info } from 'lucide-react';
import { Surgery, SurgeryDefinition } from '../types';
import { parseDefinitionsCSV, parseSurgeryLogCSV } from '../utils/csvHelper';

interface ImportViewProps {
  onImportLogs: (data: Surgery[]) => void;
  onImportDefinitions: (data: SurgeryDefinition[]) => void;
  existingDefinitions: SurgeryDefinition[];
  onCancel: () => void;
}

// Colunas na ordem definida pelo usuário
const COLUMNS = [
  { label: 'Paciente', required: true },
  { label: 'Médico', required: true },
  { label: 'Cirurgia', required: true },
  { label: 'Convênio', required: true },
  { label: 'Data do Procedimento', required: true },
  { label: 'Observação', required: false },
];

const EXAMPLE_CSV =
  `Paciente,Médico,Cirurgia,Convênio,Data do Procedimento,Observação\n` +
  `João Silva,Dr. Paulo,CISTOSCOPIA,Hapvida,01/02/2025,Sem intercorrências\n` +
  `Maria Souza,Dr. Ana,RTU PRÓSTATA,Carta de Rede,15/02/2025,`;

const downloadExample = () => {
  const blob = new Blob([EXAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'modelo_cirurgias.csv';
  link.click();
  URL.revokeObjectURL(url);
};

const ImportView: React.FC<ImportViewProps> = ({ onImportLogs, onImportDefinitions, existingDefinitions, onCancel }) => {
  const [importType, setImportType] = useState<'logs' | 'definitions'>('logs');
  const [previewLogs, setPreviewLogs] = useState<Surgery[]>([]);
  const [previewDefs, setPreviewDefs] = useState<SurgeryDefinition[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (importType === 'logs') {
          if (existingDefinitions.length === 0) {
            setError('Importe a Tabela de Pontuação antes para que os pontos sejam atribuídos automaticamente. A importação continuará sem pontos.');
          }
          const data = parseSurgeryLogCSV(text, existingDefinitions);
          if (data.length === 0) {
            setError('Nenhuma cirurgia encontrada. Verifique se o arquivo tem as colunas: Paciente, Médico, Cirurgia, Convênio, Data do Procedimento.');
            setPreviewLogs([]);
          } else {
            setPreviewLogs(data);
            if (existingDefinitions.length > 0) setError(null);
          }
        } else {
          const data = parseDefinitionsCSV(text);
          if (data.length === 0) {
            setError('Nenhuma definição encontrada. O formato esperado é: Nome, Pontos, Complexidade.');
            setPreviewDefs([]);
          } else {
            setPreviewDefs(data);
            setError(null);
          }
        }
      } catch {
        setError('Falha ao processar o arquivo CSV. Verifique o formato e tente novamente.');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const hasPreview = previewLogs.length > 0 || previewDefs.length > 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Importar Dados via CSV</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          Selecione o tipo de arquivo e faça o upload. O sistema reconhece as colunas pelo nome automaticamente.
        </p>

        {/* Toggle */}
        <div className="flex justify-center mt-6">
          <div className="bg-slate-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => { setImportType('logs'); setPreviewDefs([]); setPreviewLogs([]); setError(null); }}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${importType === 'logs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <FileText size={15} />
              Histórico de Cirurgias
            </button>
            <button
              onClick={() => { setImportType('definitions'); setPreviewDefs([]); setPreviewLogs([]); setError(null); }}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${importType === 'definitions' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <FileSpreadsheet size={15} />
              Tabela de Pontuação
            </button>
          </div>
        </div>
      </div>

      {/* Guia de colunas — somente para logs e sem preview */}
      {importType === 'logs' && !hasPreview && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Info size={18} className="text-blue-500" />
              Ordem das colunas do CSV
            </div>
            <button
              onClick={downloadExample}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Download size={14} />
              Baixar modelo CSV
            </button>
          </div>

          {/* Tabela visual de colunas */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {COLUMNS.map((col, i) => (
                    <th key={i} className="px-4 py-3 text-left font-bold whitespace-nowrap bg-blue-50 text-blue-800 border border-blue-100 first:rounded-tl-lg last:rounded-tr-lg">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold shrink-0">
                          {i + 1}
                        </span>
                        {col.label}
                        {!col.required && (
                          <span className="text-[10px] font-normal text-blue-400">(opcional)</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="text-slate-400 italic text-xs">
                  <td className="px-4 py-2.5 border border-slate-100 bg-slate-50">João Silva</td>
                  <td className="px-4 py-2.5 border border-slate-100 bg-slate-50">Dr. Paulo</td>
                  <td className="px-4 py-2.5 border border-slate-100 bg-slate-50">CISTOSCOPIA</td>
                  <td className="px-4 py-2.5 border border-slate-100 bg-slate-50">Hapvida</td>
                  <td className="px-4 py-2.5 border border-slate-100 bg-slate-50">01/02/2025</td>
                  <td className="px-4 py-2.5 border border-slate-100 bg-slate-50">Sem intercorrências</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            💡 A ordem exacta <strong>não é obrigatória</strong> — o sistema identifica cada coluna pelo nome no cabeçalho. Datas aceitas: <code>DD/MM/AAAA</code> ou <code>AAAA-MM-DD</code>.
          </p>
        </div>
      )}

      {/* Upload ou Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        {!hasPreview ? (
          <div className="flex justify-center">
            <label className="cursor-pointer border-2 border-dashed border-slate-300 rounded-xl p-10 hover:border-blue-500 hover:bg-blue-50 transition-all w-full max-w-lg group text-center">
              {importType === 'logs'
                ? <FileText size={44} className="text-slate-300 group-hover:text-blue-400 mx-auto mb-3 transition-colors" />
                : <FileSpreadsheet size={44} className="text-slate-300 group-hover:text-emerald-400 mx-auto mb-3 transition-colors" />
              }
              <p className="text-sm font-semibold text-slate-600 group-hover:text-blue-600 transition-colors">
                Clique para selecionar o arquivo CSV
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {importType === 'logs' ? 'Histórico de Cirurgias (.csv)' : 'Tabela de Pontuação (.csv)'}
              </p>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        ) : (
          <div className="space-y-5">
            <div className={`rounded-lg p-4 flex items-center gap-3 font-medium ${importType === 'logs' ? 'bg-blue-50 border border-blue-100 text-blue-700' : 'bg-emerald-50 border border-emerald-100 text-emerald-700'}`}>
              <CheckCircle size={20} className="shrink-0" />
              {importType === 'logs'
                ? `${previewLogs.length} cirurgia${previewLogs.length > 1 ? 's' : ''} pronta${previewLogs.length > 1 ? 's' : ''} para importar.`
                : `${previewDefs.length} definição${previewDefs.length > 1 ? 'ões' : ''} pronta${previewDefs.length > 1 ? 's' : ''} para importar/atualizar.`}
            </div>

            {/* Preview primeiros 5 registros */}
            {importType === 'logs' && previewLogs.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
                    <tr>
                      <th className="px-3 py-2 text-left">Paciente</th>
                      <th className="px-3 py-2 text-left">Médico</th>
                      <th className="px-3 py-2 text-left">Cirurgia</th>
                      <th className="px-3 py-2 text-left">Convênio</th>
                      <th className="px-3 py-2 text-left">Data</th>
                      <th className="px-3 py-2 text-right">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewLogs.slice(0, 5).map((s, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2">{s.patientName}</td>
                        <td className="px-3 py-2">{s.doctorName}</td>
                        <td className="px-3 py-2 font-medium">{s.surgeryType}</td>
                        <td className="px-3 py-2 text-slate-500">{s.healthInsurance || s.source}</td>
                        <td className="px-3 py-2 text-slate-500">{s.date}</td>
                        <td className="px-3 py-2 text-right font-bold text-blue-600">{s.points}</td>
                      </tr>
                    ))}
                    {previewLogs.length > 5 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-2 text-center text-slate-400 italic">
                          + {previewLogs.length - 5} registros adicionais…
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => { setPreviewLogs([]); setPreviewDefs([]); setError(null); }}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                ← Voltar
              </button>
              <button
                onClick={() => importType === 'logs' ? onImportLogs(previewLogs) : onImportDefinitions(previewDefs)}
                className={`px-6 py-2.5 text-white font-bold rounded-lg transition-colors shadow-sm ${importType === 'logs' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                ✓ Confirmar Importação
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-5 bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start gap-3 text-amber-700 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportView;