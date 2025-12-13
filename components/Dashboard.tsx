import React, { useMemo, useState } from 'react';
import { Surgery } from '../types';
import { calculateStats } from '../services/dataService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Trophy, Activity, DollarSign, Briefcase } from 'lucide-react';

interface DashboardProps {
  surgeries: Surgery[];
  monthlyBudget: number;
}

const Dashboard: React.FC<DashboardProps> = ({ surgeries, monthlyBudget }) => {
  // Get current date parts for defaults
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  // Filters State
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedSource, setSelectedSource] = useState('');

  // Derived Lists
  const doctors = useMemo(() => Array.from(new Set(surgeries.map(s => s.doctorName))).sort(), [surgeries]);
  const sources = useMemo(() => Array.from(new Set(surgeries.map(s => s.source || 'Hapvida'))).sort(), [surgeries]);

  // Filtering Logic
  const filteredSurgeries = useMemo(() => {
    return surgeries.filter(s => {
      const dateMatch = (!startDate || s.date >= startDate) && (!endDate || s.date <= endDate);
      const doctorMatch = !selectedDoctor || s.doctorName === selectedDoctor;
      const sourceMatch = !selectedSource || (s.source || 'Hapvida') === selectedSource;
      return dateMatch && doctorMatch && sourceMatch;
    });
  }, [surgeries, startDate, endDate, selectedDoctor, selectedSource]);

  // Financial Calculations
  const calculations = useMemo(() => {
    // 1. Separate Pool (Hapvida) vs Direct (Service Sales)
    // Assuming "Carta de Rede" also acts like Hapvida (points-based), otherwise move to direct.
    // Based on user prompt: "Calculos de valores deverao ser realizados apenas pelo hapvida"
    
    const poolSurgeries = filteredSurgeries.filter(s => s.source !== 'Venda de Serviço');
    const directSurgeries = filteredSurgeries.filter(s => s.source === 'Venda de Serviço');

    const totalPoolPoints = poolSurgeries.reduce((acc, s) => acc + s.points, 0);
    const pointValue = totalPoolPoints > 0 ? monthlyBudget / totalPoolPoints : 0;

    // Helper to calculate total income for a specific doctor
    const getDoctorIncome = (doctor: string) => {
        // Pool Income
        const docPoolPoints = poolSurgeries
            .filter(s => s.doctorName === doctor)
            .reduce((acc, s) => acc + s.points, 0);
        
        const poolIncome = docPoolPoints * pointValue;

        // Direct Income
        const docDirectIncome = directSurgeries
            .filter(s => s.doctorName === doctor)
            .reduce((acc, s) => acc + (s.cost || 0), 0);
        
        return {
            points: docPoolPoints, // Only pool points count towards budget share
            totalPoints: filteredSurgeries.filter(s => s.doctorName === doctor).reduce((acc, s) => acc + s.points, 0), // Stats points
            poolIncome,
            directIncome: docDirectIncome,
            totalIncome: poolIncome + docDirectIncome
        };
    };

    return {
        totalPoolPoints,
        pointValue,
        totalDirectRevenue: directSurgeries.reduce((acc, s) => acc + (s.cost || 0), 0),
        getDoctorIncome
    };
  }, [filteredSurgeries, monthlyBudget]);

  const stats = useMemo(() => calculateStats(filteredSurgeries), [filteredSurgeries]);
  
  // Sort doctors by Total Income for the chart/ranking
  const doctorFinancials = stats.map(stat => {
      const incomeData = calculations.getDoctorIncome(stat.doctorName);
      return {
          name: stat.doctorName,
          ...incomeData
      };
  }).sort((a, b) => b.totalIncome - a.totalIncome);

  const topDoctor = doctorFinancials.length > 0 ? doctorFinancials[0] : null;

  // Chart Data
  const chartData = doctorFinancials.slice(0, 10).map(doc => ({
    name: doc.name.split(' ')[0],
    Rateio: doc.poolIncome,
    Direto: doc.directIncome
  }));

  const formatCurrency = (val: number) => 
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Filters Bar */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Data Inicial</label>
          <input 
            type="date" 
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Data Final</label>
          <input 
            type="date" 
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
        <div>
           <label className="block text-xs font-semibold text-slate-500 mb-1">Filtrar Médico</label>
           <select 
             className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
             value={selectedDoctor}
             onChange={e => setSelectedDoctor(e.target.value)}
           >
             <option value="">Todos os Médicos</option>
             {doctors.map(d => <option key={d} value={d}>{d}</option>)}
           </select>
        </div>
        <div>
           <label className="block text-xs font-semibold text-slate-500 mb-1">Área / Convênio</label>
           <select 
             className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
             value={selectedSource}
             onChange={e => setSelectedSource(e.target.value)}
           >
             <option value="">Todas as Fontes</option>
             {sources.map(s => <option key={s} value={s}>{s}</option>)}
           </select>
        </div>
      </div>

      {/* Financial Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl shadow-lg text-white">
          <p className="text-blue-100 text-sm font-medium mb-1">Pontos Rateio (Hapvida)</p>
          <h3 className="text-3xl font-bold">{calculations.totalPoolPoints} pts</h3>
          <div className="mt-2 text-xs text-blue-200">
             Usado para divisão da verba
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 rounded-xl shadow-lg text-white">
          <p className="text-emerald-100 text-sm font-medium mb-1">Valor do Ponto</p>
          <h3 className="text-3xl font-bold">{formatCurrency(calculations.pointValue)}</h3>
          <div className="mt-2 text-xs text-emerald-200">
             Verba: {formatCurrency(monthlyBudget)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-xl shadow-lg text-white">
          <p className="text-purple-100 text-sm font-medium mb-1">Venda de Serviço</p>
          <h3 className="text-3xl font-bold">{formatCurrency(calculations.totalDirectRevenue)}</h3>
          <div className="mt-2 text-xs text-purple-200">
             Faturamento direto
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Trophy size={20} /></div>
                <span className="text-slate-500 font-medium text-sm">Líder (Faturamento Total)</span>
             </div>
             {topDoctor ? (
                 <div>
                     <h3 className="text-lg font-bold text-slate-800 truncate">{topDoctor.name}</h3>
                     <p className="text-emerald-600 font-bold">{formatCurrency(topDoctor.totalIncome)}</p>
                 </div>
             ) : (
                 <p className="text-slate-400">Sem dados</p>
             )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Composição da Receita por Médico</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `R$${val/1000}k`} />
                <Tooltip 
                    cursor={{fill: '#f1f5f9'}} 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                    formatter={(value: any) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="Rateio" stackId="a" fill="#3b82f6" name="Rateio Hapvida" />
                <Bar dataKey="Direto" stackId="a" fill="#9333ea" radius={[4, 4, 0, 0]} name="Venda Serviço" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Detalhamento Financeiro</h3>
          <div className="overflow-y-auto h-80 custom-scrollbar flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Médico</th>
                  <th className="px-4 py-3 text-right">Pts Rateio</th>
                  <th className="px-4 py-3 text-right text-blue-600">Rateio</th>
                  <th className="px-4 py-3 text-right text-purple-600">Direto</th>
                  <th className="px-4 py-3 text-right text-emerald-700 font-bold rounded-tr-lg">Total</th>
                </tr>
              </thead>
              <tbody>
                {doctorFinancials.map((doc) => {
                    return (
                        <tr key={doc.name} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-900">{doc.name}</td>
                            <td className="px-4 py-3 text-right text-slate-500">{doc.points}</td>
                            <td className="px-4 py-3 text-right text-blue-600">{formatCurrency(doc.poolIncome)}</td>
                            <td className="px-4 py-3 text-right text-purple-600">{formatCurrency(doc.directIncome)}</td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatCurrency(doc.totalIncome)}</td>
                        </tr>
                    );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;