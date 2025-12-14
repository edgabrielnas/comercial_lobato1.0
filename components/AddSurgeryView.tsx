import React, { useState, useEffect, useMemo } from 'react';
import { Surgery, SurgeryDefinition } from '../types';
import { Save, AlertCircle, Check, Briefcase, UserPlus, ArrowLeft } from 'lucide-react';

interface AddSurgeryViewProps {
  onAdd: (surgery: Surgery) => void;
  definitions: SurgeryDefinition[];
  onCancel: () => void;
  existingSurgeries?: Surgery[];
  initialData?: Surgery | null; // New prop for editing
}

const AddSurgeryView: React.FC<AddSurgeryViewProps> = ({ onAdd, definitions, onCancel, existingSurgeries = [], initialData }) => {
  
  // Helper to get local YYYY-MM-DD
  const getLocalDate = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    patientName: '',
    date: getLocalDate(),
    doctorName: '',
    surgeryType: '', 
    notes: '',
    source: 'Hapvida',
    healthInsurance: '',
    cost: 0,
    receivedValue: 0
  });

  const [points, setPoints] = useState(0);
  const [success, setSuccess] = useState(false);
  const [isNewDoctor, setIsNewDoctor] = useState(false);

  // Initialize form if editing
  useEffect(() => {
    if (initialData) {
        setFormData({
            patientName: initialData.patientName,
            date: initialData.date,
            doctorName: initialData.doctorName,
            surgeryType: initialData.surgeryType,
            notes: initialData.notes || '',
            source: initialData.source || 'Hapvida',
            healthInsurance: initialData.healthInsurance || '',
            cost: initialData.cost || 0,
            receivedValue: initialData.receivedValue || 0
        });
        setPoints(initialData.points);
    }
  }, [initialData]);

  // Extract unique doctors
  const existingDoctors = useMemo(() => {
    return Array.from(new Set(existingSurgeries.map(s => s.doctorName))).sort();
  }, [existingSurgeries]);

  // If no doctors exist, default to new doctor input
  useEffect(() => {
      if (existingDoctors.length === 0 && !initialData) {
          setIsNewDoctor(true);
      }
  }, [existingDoctors, initialData]);

  // Auto-calculate points and default cost when surgery type changes
  // Only run this logic if the user changes the type manually, 
  // or if we are NOT in edit mode (to prevent overwriting existing custom values on load)
  const handleSurgeryTypeChange = (newType: string) => {
    const def = definitions.find(d => d.name === newType);
    setFormData(prev => ({ ...prev, surgeryType: newType }));
    
    if (def) {
        setPoints(def.points);
        // Only auto-set cost if source is Venda de Serviço
        if (formData.source === 'Venda de Serviço') {
             setFormData(prev => ({ ...prev, surgeryType: newType, cost: def.basePrice || 0 }));
        }
    } else {
        setPoints(0);
    }
  };

  const handleSourceChange = (newSource: string) => {
    setFormData(prev => ({ ...prev, source: newSource }));
    // Reset cost if switching away from service sales
    if (newSource !== 'Venda de Serviço') {
            setFormData(prev => ({ ...prev, cost: 0, healthInsurance: '', receivedValue: 0 }));
    } else {
        // Try to pre-fill cost based on definition
        const def = definitions.find(d => d.name === formData.surgeryType);
        if (def) setFormData(prev => ({ ...prev, cost: def.basePrice || 0 }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSurgery: Surgery = {
      // If editing, keep original ID, else generate new
      id: initialData ? initialData.id : `manual-${Date.now()}`,
      ...formData,
      points: points, 
      doctorName: formData.doctorName.toUpperCase(),
      // Preserve payment status if editing, else default false
      isPaid: initialData ? initialData.isPaid : false
    };
    onAdd(newSurgery);
    setSuccess(true);
    
    // If editing, we typically go back immediately or show success then back
    if (initialData) {
        setTimeout(() => {
            onCancel(); // Go back to dashboard/list
        }, 1000);
    } else {
        // If adding new, reset form for next entry
        setTimeout(() => {
            setSuccess(false);
            setFormData(prev => ({ 
                ...prev, 
                patientName: '', 
                notes: '',
                healthInsurance: '',
                cost: 0,
                receivedValue: 0
                // Keep doctor, date and source for convenience
            })); 
        }, 1500);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
                {initialData ? 'Editar Cirurgia' : 'Registrar Cirurgia'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
                {initialData ? 'Altere os dados abaixo e salve.' : 'Preencha os dados abaixo para adicionar um novo registro.'}
            </p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
              <ArrowLeft size={24} />
          </button>
        </div>
        
        {definitions.length === 0 ? (
           <div className="p-12 text-center text-slate-500">
             <AlertCircle size={48} className="mx-auto mb-4 text-amber-400" />
             <h3 className="text-lg font-medium text-slate-800">Tabela de Pontuação Vazia</h3>
             <p className="mt-2">Não é possível cadastrar cirurgias sem definições de pontuação.</p>
             <p>Por favor, vá em "Importar Dados" e carregue a tabela de referência ou contate o administrador.</p>
           </div>
        ) : (
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nome do Paciente</label>
                <input
                    required
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={formData.patientName}
                    onChange={e => setFormData({...formData, patientName: e.target.value})}
                    placeholder="Nome completo"
                />
                </div>

                <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Data da Cirurgia</label>
                <input
                    required
                    type="date"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-slate-700">Médico Responsável</label>
                    {!isNewDoctor && (
                        <button 
                            type="button" 
                            onClick={() => { setIsNewDoctor(true); setFormData({...formData, doctorName: ''}); }}
                            className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                        >
                            <UserPlus size={14} /> Digitar Novo
                        </button>
                    )}
                    {isNewDoctor && existingDoctors.length > 0 && (
                        <button 
                            type="button" 
                            onClick={() => setIsNewDoctor(false)}
                            className="text-xs text-slate-500 hover:underline"
                        >
                            Voltar para Lista
                        </button>
                    )}
                </div>
                
                {isNewDoctor ? (
                    <input
                        required
                        type="text"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all uppercase"
                        value={formData.doctorName}
                        onChange={e => setFormData({...formData, doctorName: e.target.value})}
                        placeholder="Ex: DR. SILVA"
                    />
                ) : (
                    <div className="relative">
                        <select
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                            value={formData.doctorName}
                            onChange={e => setFormData({...formData, doctorName: e.target.value})}
                        >
                            <option value="">Selecione um médico...</option>
                            {existingDoctors.map(doc => (
                                <option key={doc} value={doc}>{doc}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                )}
                </div>

                <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Área / Fonte</label>
                <div className="relative">
                    <select
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                    value={formData.source}
                    onChange={e => handleSourceChange(e.target.value)}
                    >
                        <option value="Hapvida">Hapvida</option>
                        <option value="Carta de Rede">Carta de Rede</option>
                        <option value="Venda de Serviço">Venda de Serviço</option>
                    </select>
                    <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
                </div>
            </div>

            {/* Venda de Serviço Specific Fields */}
            {formData.source === 'Venda de Serviço' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <div>
                        <label className="block text-sm font-semibold text-emerald-800 mb-2">Convênio de Saúde</label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={formData.healthInsurance}
                            onChange={e => setFormData({...formData, healthInsurance: e.target.value})}
                            placeholder="Ex: Unimed, Bradesco..."
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-semibold text-emerald-800 mb-2">Valor Cobrado (R$)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">R$</span>
                            <input
                                required
                                type="number"
                                step="0.01"
                                className="w-full pl-9 pr-4 py-3 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-700"
                                value={formData.cost}
                                onChange={e => setFormData({...formData, cost: parseFloat(e.target.value)})}
                            />
                        </div>
                        <p className="text-xs text-emerald-600 mt-1">Valor de Tabela</p>
                    </div>
                     <div>
                        <label className="block text-sm font-semibold text-emerald-800 mb-2">Valor Recebido (R$)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">R$</span>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full pl-9 pr-4 py-3 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-700"
                                value={formData.receivedValue}
                                onChange={e => setFormData({...formData, receivedValue: parseFloat(e.target.value)})}
                            />
                        </div>
                        <p className="text-xs text-emerald-600 mt-1">Valor efetivo</p>
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de Cirurgia</label>
                <div className="relative">
                    <select
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                    value={formData.surgeryType}
                    onChange={e => handleSurgeryTypeChange(e.target.value)}
                    >
                    <option value="" disabled>Selecione o procedimento...</option>
                    {definitions.map(def => (
                        <option key={def.id} value={def.name}>
                        {def.name}
                        </option>
                    ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
            </div>

            {/* Points Display - Read Only */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                    <span className="block text-sm font-medium text-blue-600">Pontuação de Produtividade</span>
                    <span className="text-xs text-blue-400">Independente da fonte pagadora</span>
                </div>
                <div className="text-3xl font-bold text-blue-700">
                    {points} <span className="text-sm font-normal">pontos</span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Observações (Opcional)</label>
                <textarea
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                rows={3}
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Detalhes adicionais..."
                />
            </div>

            <div className="pt-4 flex items-center gap-4">
                <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                Cancelar
                </button>
                <button
                type="submit"
                className={`flex-1 flex items-center justify-center gap-2 font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 ${
                    success ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                }`}
                >
                {success ? (
                    <>
                    <Check size={20} />
                    {initialData ? 'Atualizado!' : 'Salvo com Sucesso!'}
                    </>
                ) : (
                    <>
                    <Save size={20} />
                    {initialData ? 'Atualizar Cirurgia' : 'Salvar Registro'}
                    </>
                )}
                </button>
            </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default AddSurgeryView;