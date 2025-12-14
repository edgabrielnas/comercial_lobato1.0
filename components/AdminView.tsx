import React, { useState } from 'react';
import { SurgeryDefinition } from '../types';
import { Edit2, Plus, Trash2, Save, X, DollarSign, Activity, FileText, Briefcase } from 'lucide-react';

interface AdminViewProps {
  definitions: SurgeryDefinition[];
  onUpdateDefinition: (def: SurgeryDefinition) => void;
  onAddDefinition: (def: SurgeryDefinition) => void;
  onDeleteDefinition: (id: string) => void;
  monthlyBudget: number;
  onUpdateBudget: (value: number) => void;
}

type TabType = 'hapvida' | 'carta' | 'venda';

export const AdminView: React.FC<AdminViewProps> = ({ 
  definitions, 
  onUpdateDefinition, 
  onAddDefinition, 
  onDeleteDefinition,
  monthlyBudget,
  onUpdateBudget
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('hapvida');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SurgeryDefinition>>({});
  
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', points: 0, complexity: '', basePrice: 0 });

  // Local state for budget input
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());

  const handleBudgetSave = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val)) {
        onUpdateBudget(val);
    }
  };

  const handleEdit = (def: SurgeryDefinition) => {
    setEditingId(def.id);
    setEditForm({ ...def });
  };

  const handleSaveEdit = () => {
    if (editingId && editForm.name) {
      onUpdateDefinition(editForm as SurgeryDefinition);
      setEditingId(null);
    }
  };

  const handleSaveNew = () => {
    if (newForm.name) {
      onAddDefinition({
        id: `def-${Date.now()}`,
        name: newForm.name.toUpperCase(),
        points: Number(newForm.points),
        complexity: newForm.complexity.toUpperCase(),
        basePrice: Number(newForm.basePrice)
      });
      setIsAdding(false);
      setNewForm({ name: '', points: 0, complexity: '', basePrice: 0 });
    }
  };

  const getTabLabel = (tab: TabType) => {
      switch(tab) {
          case 'hapvida': return 'Hapvida';
          case 'carta': return 'Carta de Rede';
          case 'venda': return 'Venda de Serviço';
      }
  };

  const getTabColor = (tab: TabType) => {
      switch(tab) {
          case 'hapvida': return 'blue';
          case 'carta': return 'indigo';
          case 'venda': return 'emerald';
      }
  };

  const currentColor = getTabColor(activeTab);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header & Tabs */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Administração de Tabelas</h2>
        
        <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl">
            <button
                onClick={() => setActiveTab('hapvida')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'hapvida' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
            >
                <Activity size={18} />
                Hapvida
            </button>
            <button
                onClick={() => setActiveTab('carta')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'carta' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
            >
                <FileText size={18} />
                Carta
            </button>
            <button
                onClick={() => setActiveTab('venda')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'venda' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
            >
                <Briefcase size={18} />
                Venda
            </button>
        </div>
      </div>

      {/* Financial Configuration Section - Only for Hapvida */}
      {activeTab === 'hapvida' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <DollarSign size={24} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Verba Mensal (Hapvida)</h2>
                    <p className="text-slate-500 text-sm">Valor total destinado ao rateio por pontos.</p>
                </div>
            </div>
            
            <div className="flex items-end gap-4 max-w-md">
                <div className="flex-1">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                        <input 
                            type="number" 
                            className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-slate-800"
                            value={budgetInput}
                            onChange={(e) => setBudgetInput(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                </div>
                <button 
                    onClick={handleBudgetSave}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors"
                >
                    Salvar
                </button>
            </div>
        </div>
      )}

      {/* Surgery Definitions Section */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div>
            <h2 className="text-lg font-bold text-slate-800">
                {activeTab === 'venda' ? 'Tabela de Valores (R$)' : 'Tabela de Pontuação'}
            </h2>
            <p className="text-slate-500 text-sm">
                {activeTab === 'hapvida' && 'Gerencie os pontos para cálculo de rateio Hapvida.'}
                {activeTab === 'carta' && 'Gerencie os pontos para procedimentos via Carta de Rede.'}
                {activeTab === 'venda' && 'Defina os valores em Reais para venda direta de serviços.'}
            </p>
            </div>
            <button
            onClick={() => setIsAdding(true)}
            className={`bg-${currentColor}-600 hover:bg-${currentColor}-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors`}
            >
            <Plus size={18} />
            Novo Procedimento
            </button>
        </div>

        {isAdding && (
            <div className={`bg-${currentColor}-50 border border-${currentColor}-200 p-6 rounded-xl animate-fade-in-up`}>
            <h4 className={`font-bold text-${currentColor}-800 mb-4`}>Adicionar em {getTabLabel(activeTab)}</h4>
            <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[300px]">
                <label className={`text-xs font-semibold text-${currentColor}-700 uppercase`}>Nome do Procedimento</label>
                <input 
                    className={`w-full mt-1 px-3 py-2 rounded-lg border border-${currentColor}-300 focus:ring-2 focus:ring-${currentColor}-500 outline-none uppercase`}
                    value={newForm.name}
                    onChange={e => setNewForm({...newForm, name: e.target.value})}
                />
                </div>
                {/* ... fields ... */}
                {activeTab !== 'venda' && (
                    <div className="w-24">
                        <label className={`text-xs font-semibold text-${currentColor}-700 uppercase`}>Pontos</label>
                        <input 
                            type="number"
                            className={`w-full mt-1 px-3 py-2 rounded-lg border border-${currentColor}-300 focus:ring-2 focus:ring-${currentColor}-500 outline-none`}
                            value={newForm.points}
                            onChange={e => setNewForm({...newForm, points: parseFloat(e.target.value)})}
                        />
                    </div>
                )}
                 {activeTab === 'venda' && (
                    <div className="w-32">
                        <label className={`text-xs font-semibold text-${currentColor}-700 uppercase`}>Valor (R$)</label>
                        <input 
                            type="number"
                            className={`w-full mt-1 px-3 py-2 rounded-lg border border-${currentColor}-300 focus:ring-2 focus:ring-${currentColor}-500 outline-none`}
                            value={newForm.basePrice}
                            onChange={e => setNewForm({...newForm, basePrice: parseFloat(e.target.value)})}
                            placeholder="0.00"
                        />
                    </div>
                )}
                 <div className="w-40">
                <label className={`text-xs font-semibold text-${currentColor}-700 uppercase`}>Complexidade</label>
                <input 
                    className={`w-full mt-1 px-3 py-2 rounded-lg border border-${currentColor}-300 focus:ring-2 focus:ring-${currentColor}-500 outline-none uppercase`}
                    value={newForm.complexity}
                    onChange={e => setNewForm({...newForm, complexity: e.target.value})}
                    placeholder="Ex: MÉDIA"
                />
                </div>
                <div className="flex gap-2">
                    <button onClick={handleSaveNew} className={`p-2.5 bg-${currentColor}-600 text-white rounded-lg hover:bg-${currentColor}-700`}><Save size={18} /></button>
                    <button onClick={() => setIsAdding(false)} className="p-2.5 bg-white text-slate-500 border border-slate-300 rounded-lg hover:bg-slate-50"><X size={18} /></button>
                </div>
            </div>
            </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                <th className="px-6 py-3 font-semibold">Nome da Cirurgia</th>
                <th className="px-6 py-3 font-semibold">Complexidade</th>
                {activeTab !== 'venda' && <th className="px-6 py-3 text-right font-semibold">Pontos</th>}
                {activeTab === 'venda' && <th className="px-6 py-3 text-right font-semibold">Valor (R$)</th>}
                <th className="px-6 py-3 text-center font-semibold">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {definitions.map((def) => (
                <tr key={def.id} className="hover:bg-slate-50">
                    {editingId === def.id ? (
                    <>
                        <td className="px-6 py-3">
                        <input 
                            className="w-full px-2 py-1 border rounded uppercase"
                            value={editForm.name}
                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                        />
                        </td>
                         <td className="px-6 py-3">
                            <input 
                            className="w-full px-2 py-1 border rounded uppercase"
                            value={editForm.complexity}
                            onChange={e => setEditForm({...editForm, complexity: e.target.value})}
                        />
                        </td>
                        {activeTab !== 'venda' && (
                            <td className="px-6 py-3 text-right">
                                <input 
                                type="number"
                                className="w-20 px-2 py-1 border rounded text-right"
                                value={editForm.points}
                                onChange={e => setEditForm({...editForm, points: parseFloat(e.target.value)})}
                                />
                            </td>
                        )}
                         {activeTab === 'venda' && (
                            <td className="px-6 py-3 text-right">
                                <input 
                                type="number"
                                className="w-24 px-2 py-1 border border-emerald-300 rounded text-right"
                                value={editForm.basePrice || 0}
                                onChange={e => setEditForm({...editForm, basePrice: parseFloat(e.target.value)})}
                                />
                            </td>
                        )}
                        <td className="px-6 py-3 flex justify-center gap-2">
                        <button onClick={handleSaveEdit} className="text-green-600 hover:bg-green-50 p-1 rounded"><Save size={18} /></button>
                        <button onClick={() => setEditingId(null)} className="text-slate-400 hover:bg-slate-100 p-1 rounded"><X size={18} /></button>
                        </td>
                    </>
                    ) : (
                    <>
                        <td className="px-6 py-3 font-medium text-slate-900">{def.name}</td>
                        <td className="px-6 py-3 text-slate-500">{def.complexity}</td>
                        {activeTab !== 'venda' && <td className="px-6 py-3 text-right font-bold text-blue-600">{def.points}</td>}
                        {activeTab === 'venda' && (
                            <td className="px-6 py-3 text-right font-bold text-emerald-600">
                                {def.basePrice ? def.basePrice.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) : '-'}
                            </td>
                        )}
                        <td className="px-6 py-3 flex justify-center gap-2">
                        <button onClick={() => handleEdit(def)} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><Edit2 size={16} /></button>
                        <button onClick={() => onDeleteDefinition(def.id)} className="text-red-400 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
                        </td>
                    </>
                    )}
                </tr>
                ))}
            </tbody>
            </table>
        </div>
    </div>
  );
};