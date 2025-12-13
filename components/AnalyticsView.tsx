import React, { useMemo, useState } from 'react';
import { Surgery } from '../types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface AnalyticsViewProps {
  surgeries: Surgery[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ surgeries }) => {
  // Filters State
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Derived Lists
  const doctors = useMemo(() => Array.from(new Set(surgeries.map(s => s.doctorName))).sort(), [surgeries]);
  const sources = useMemo(() => Array.from(new Set(surgeries.map(s => s.source || 'Hapvida'))).sort(), [surgeries]);

  const filteredSurgeries = useMemo(() => {
    return surgeries.filter(s => {
       const dateMatch = (!startDate || s.date >= startDate) && (!endDate || s.date <= endDate);
       const doctorMatch = !selectedDoctor || s.doctorName === selectedDoctor;
       const sourceMatch = !selectedSource || (s.source || 'Hapvida') === selectedSource;
       return dateMatch && doctorMatch && sourceMatch;
    });
  }, [surgeries, selectedDoctor, selectedSource, startDate, endDate]);

  // Aggregate data for timeline
  const timelineData = useMemo(() => {
    const data: Record<string, { date: string; fullDate: string; points: number; count: number }> = {};
    
    filteredSurgeries.forEach(s => {
      // Sort key YYYY-MM
      const key = s.date.substring(0, 7); 
      if (!data[key]) {
        // Display label
        const [year, month] = key.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
        const label = dateObj.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        
        data[key] = { date: label, fullDate: key, points: 0, count: 0 };
      }
      data[key].points += s.points;
      data[key].count += 1;
    });

    return Object.values(data).sort((a, b) => a.fullDate.localeCompare(b.fullDate));
  }, [filteredSurgeries]);

  // Aggregate data for Surgery Types
  const surgeryTypesData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredSurgeries.forEach(s => {
      const type = s.surgeryType.trim();
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10
  }, [filteredSurgeries]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
       {/* Filters */}
       <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
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
             <option value="">Todos</option>
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
             <option value="">Todas</option>
             {sources.map(s => <option key={s} value={s}>{s}</option>)}
           </select>
        </div>
      </div>

      {/* Evolution Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Evolução Mensal de Pontos</h3>
        <p className="text-slate-500 text-sm mb-6">Acompanhamento do total de pontos gerados com base nos filtros aplicados.</p>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
              <Tooltip 
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                labelStyle={{color: '#64748b'}}
              />
              <Area type="monotone" dataKey="points" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPoints)" name="Pontos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Surgery Types */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Cirurgias Mais Realizadas</h3>
        <p className="text-slate-500 text-sm mb-6">Top 10 tipos de procedimentos por frequência no período.</p>
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={surgeryTypesData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={250} 
                tick={{fill: '#475569', fontSize: 11}} 
                interval={0}
              />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} name="Qtd" barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;