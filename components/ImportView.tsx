import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { Surgery, SurgeryDefinition } from '../types';
import { parseDefinitionsCSV, parseSurgeryLogCSV } from '../utils/csvHelper';

interface ImportViewProps {
  onImportLogs: (data: Surgery[]) => void;
  onImportDefinitions: (data: SurgeryDefinition[]) => void;
  existingDefinitions: SurgeryDefinition[];
  onCancel: () => void;
}

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
                setError("Atenção: É recomendado importar a Tabela de Definições (Pontuação) antes de importar os logs, para que os pontos sejam calculados corretamente.");
            }
            const data = parseSurgeryLogCSV(text, existingDefinitions);
            if (data.length === 0) {
                setError("Nenhum registro de cirurgia encontrado. Verifique se o arquivo possui as colunas PACIENTE, DATA, MÉDICO, CIRURGIA.");
                setPreviewLogs([]);
            } else {
                setPreviewLogs(data);
                setError(null);
            }
        } else {
            const data = parseDefinitionsCSV(text);
            if (data.length === 0) {
                setError("Nenhuma definição encontrada. O formato esperado é: Nome da Cirurgia, Pontos, Complexidade.");
                setPreviewDefs([]);
            } else {
                setPreviewDefs(data);
                setError(null);
            }
        }

      } catch (err) {
        setError("Falha ao processar o arquivo CSV.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center animate-fade-in">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Importar Dados</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Selecione o tipo de arquivo que deseja enviar para o sistema.
        </p>

        {/* Import Type Toggle */}
        <div className="flex justify-center mb-8">
            <div className="bg-slate-100 p-1 rounded-lg inline-flex">
                <button
                    onClick={() => { setImportType('logs'); setPreviewDefs([]); setPreviewLogs([]); setError(null); }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${importType === 'logs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Histórico de Cirurgias
                </button>
                <button
                    onClick={() => { setImportType('definitions'); setPreviewDefs([]); setPreviewLogs([]); setError(null); }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${importType === 'definitions' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Tabela de Pontuação
                </button>
            </div>
        </div>

        {(!previewLogs.length && !previewDefs.length) ? (
          <div className="flex justify-center">
            <label className="cursor-pointer bg-white border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-blue-500 hover:bg-blue-50 transition-all w-full max-w-lg group">
              <div className="flex flex-col items-center">
                {importType === 'logs' ? (
                    <FileText size={40} className="text-slate-400 group-hover:text-blue-500 mb-3" />
                ) : (
                    <FileSpreadsheet size={40} className="text-slate-400 group-hover:text-emerald-500 mb-3" />
                )}
                
                <span className="text-sm font-medium text-slate-600 group-hover:text-blue-600">
                  Clique para selecionar arquivo CSV de {importType === 'logs' ? 'Cirurgias' : 'Definições'}
                </span>
                <span className="text-xs text-slate-400 mt-1">formatos .csv suportados</span>
              </div>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`bg-${importType === 'logs' ? 'blue' : 'emerald'}-50 border border-${importType === 'logs' ? 'blue' : 'emerald'}-100 rounded-lg p-4 flex items-center gap-3 text-${importType === 'logs' ? 'blue' : 'emerald'}-700`}>
              <CheckCircle size={20} />
              <span className="font-medium">
                  {importType === 'logs' 
                    ? `Pronto para importar ${previewLogs.length} registros de cirurgia.` 
                    : `Pronto para importar/atualizar ${previewDefs.length} definições de pontuação.`}
              </span>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={onCancel}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => importType === 'logs' ? onImportLogs(previewLogs) : onImportDefinitions(previewDefs)}
                className={`px-6 py-2.5 text-white font-medium rounded-lg transition-colors shadow-sm ${importType === 'logs' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                Confirmar Importação
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3 text-red-700 text-left text-sm">
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportView;