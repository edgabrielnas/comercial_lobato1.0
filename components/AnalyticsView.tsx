import React, { useMemo, useState } from 'react';
import { Surgery } from '../types';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell, ComposedChart, Line
} from 'recharts';
import { TrendingUp, Users, Calendar, DollarSign, Activity, PieChart as PieIcon, BarChart3 } from 'lucide-react';

interface AnalyticsViewProps {
  surgeries: Surgery[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ surgeries }) => {
  // Filters State
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  
  // Default to current month range (Timezone Aware)
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

  // --- KPI Calculations ---
  const kpis = useMemo(() => {
    const totalCount = filteredSurgeries.length;
    const totalPoints = filteredSurgeries.reduce((acc, s) => acc + s.points, 0);
    
    // Ticket Médio (Apenas Venda de Serviço)
    const salesSurgeries = filteredSurgeries.filter(s => s.source === 'Venda de Serviço');
    const totalRevenue = salesSurgeries.reduce((acc, s) => acc + (s.cost || 0), 0);
    const avgTicket = salesSurgeries.length > 0 ? totalRevenue / salesSurgeries.length : 0;

    // Busiest Day
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dayCounts = new Array(7).fill(0);
    filteredSurgeries.forEach(s => {
        // Fix timezone issue by treating date string directly or splitting
        const [y, m, d] = s.date.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        dayCounts[dateObj.getDay()]++;
    });
    const maxDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
    const busiestDay = totalCount > 0 ? days[maxDayIndex] : '-';

    return { totalCount, totalPoints, avgTicket, busiestDay, totalRevenue };
  }, [filteredSurgeries]);

  // --- Chart Data Preparation ---

  // 1. Evolution (Timeline)
  const timelineData = useMemo(() => {
    const data: Record<string, { date: string; shortDate: string; points: number; count: number }> = {};
    
    filteredSurgeries.forEach(s => {
      const [year, month, day] = s.date.split('-');
      const key = `${month}/${day}`; // Aggregate by Day of Month across range
      // Or use full date if range is large
      const sortKey = s.date;

      if (!data[sortKey]) {
        data[sortKey] = { 
            date: sortKey, 
            shortDate: `${day}/${month}`, 
            points: 0, 
            count: 0 
        };
      }
      data[sortKey].points += s.points;
      data[sortKey].count += 1;
    });

    return Object.values(data).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredSurgeries]);

  // 2. Source Distribution (Pie)
  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredSurgeries.forEach(s => {
        const src = s.source || 'Hapvida';
        counts[src] = (counts[src] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredSurgeries]);

  const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b'];

  // 3. Day of Week Analysis (Bar)
  const dayOfWeekData = useMemo(() => {
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const counts = days.map(d => ({ name: d, cirurgias: 0 }));
      
      filteredSurgeries.forEach(s => {
        const [y, m, d] = s.date.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        counts[dateObj.getDay()].cirurgias++;
      });
      
      return counts;
  }, [filteredSurgeries]);

  // 4. Doctor Performance (Composed: Volume vs Points)
  const doctorPerfData = useMemo(() => {
      const docMap: Record<string, { name: string, volume: number, pontos: number }> = {};
      
      filteredSurgeries.forEach(s => {
          const name = s.doctorName.split(' ')[0]; // First name only for chart
          if (!docMap[name]) docMap[name] = { name, volume: 0, pontos: 0 };
          docMap[name].volume++;
          docMap[name].pontos += s.points;
      });

      return Object.values(docMap)
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 10); // Top 10
  }, [filteredSurgeries]);

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
       {/* Filters */}
       <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                  <p className="text-sm font-medium text-slate-500">Total Cirurgias</p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">{kpis.totalCount}</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Activity size={24} />
              </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                  <p className="text-sm font-medium text-slate-500">Produção (Pontos)</p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">{kpis.totalPoints}</h3>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                  <TrendingUp size={24} />
              </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                  <p className="text-sm font-medium text-slate-500">Ticket Médio (Venda)</p>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(kpis.avgTicket)}</h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <DollarSign size={24} />
              </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                  <p className="text-sm font-medium text-slate-500">Dia Mais Movimentado</p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">{kpis.busiestDay}</h3>
              </div>
              <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                  <Calendar size={24} />
              </div>
          </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Evolution Chart (Big) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-2 mb-6">
                 <TrendingUp size={20} className="text-blue-500" />
                 <h3 className="text-lg font-bold text-slate-800">Evolução Diária</h3>
             </div>
             <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="shortDate" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} minTickGap={30} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <Tooltip 
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                            formatter={(value: any) => [value, 'Cirurgias']}
                        />
                        <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Distribution Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                 <PieIcon size={20} className="text-emerald-500" />
                 <h3 className="text-lg font-bold text-slate-800">Distribuição por Fonte</h3>
             </div>
             <div className="h-72 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={sourceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {sourceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none'}} />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                    <span className="text-3xl font-bold text-slate-800">{kpis.totalCount}</span>
                    <span className="block text-xs text-slate-500 uppercase">Total</span>
                </div>
             </div>
          </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Day of Week Analysis */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                 <Calendar size={20} className="text-orange-500" />
                 <h3 className="text-lg font-bold text-slate-800">Volume por Dia da Semana</h3>
             </div>
             <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dayOfWeekData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                        <Bar dataKey="cirurgias" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
           </div>

           {/* Doctor Comparative */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                 <Users size={20} className="text-purple-500" />
                 <h3 className="text-lg font-bold text-slate-800">Top 10 Médicos (Volume x Pontos)</h3>
             </div>
             <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={doctorPerfData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={80} tick={{fill: '#475569', fontSize: 11}} interval={0} />
                        <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                        <Legend />
                        <Bar dataKey="volume" name="Qtd Cirurgias" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                        <Bar dataKey="pontos" name="Total Pontos" fill="#cbd5e1" radius={[0, 4, 4, 0]} barSize={10} />
                    </ComposedChart>
                </ResponsiveContainer>
             </div>
           </div>
      </div>

    </div>
  );
};

export default AnalyticsView;