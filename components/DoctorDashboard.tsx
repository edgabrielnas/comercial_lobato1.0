import React, { useState, useMemo } from 'react';
import { Surgery } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  User, Activity, TrendingUp, DollarSign, Award, Users, 
  ArrowUpRight, ArrowDownRight, Minus, Microscope
} from 'lucide-react';

interface DoctorDashboardProps {
  surgeries: Surgery[];
  monthlyBudget: number;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ surgeries, monthlyBudget }) => {
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
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');

  // Get Unique Doctors List
  const doctorsList = useMemo(() => Array.from(new Set(surgeries.map(s => s.doctorName))).sort(), [surgeries]);

  // Set default doctor if none selected
  useMemo(() => {
    if (!selectedDoctor && doctorsList.length > 0) {
      setSelectedDoctor(doctorsList[0]);
    }
  }, [doctorsList, selectedDoctor]);

  // --- DATA PROCESSING CORE ---

  const analytics = useMemo(() => {
    // 1. Filter by Date Range
    const periodSurgeries = surgeries.filter(s => 
      (!startDate || s.date >= startDate) && (!endDate || s.date <= endDate)
    );

    // 2. Global Metrics (For Benchmarking)
    const activeDoctorsCount = new Set(periodSurgeries.map(s => s.doctorName)).size || 1;
    const totalGlobalPoints = periodSurgeries.reduce((acc, s) => acc + s.points, 0);
    const globalPoolSurgeries = periodSurgeries.filter(s => s.source !== 'Venda de Serviço');
    const totalGlobalPoolPoints = globalPoolSurgeries.reduce((acc, s) => acc + s.points, 0);
    
    // Calculate Point Value (Financial)
    const pointValue = totalGlobalPoolPoints > 0 ? monthlyBudget / totalGlobalPoolPoints : 0;

    // Averages (The "Market Average")
    const avgSurgeriesPerDoc = periodSurgeries.length / activeDoctorsCount;
    const avgPointsPerDoc = totalGlobalPoints / activeDoctorsCount;
    const avgComplexity = periodSurgeries.length > 0 ? totalGlobalPoints / periodSurgeries.length : 0;

    // 3. Specific Doctor Metrics
    const docSurgeries = periodSurgeries.filter(s => s.doctorName === selectedDoctor);
    const docTotalSurgeries = docSurgeries.length;
    const docTotalPoints = docSurgeries.reduce((acc, s) => acc + s.points, 0);
    
    // Financials for Doctor
    const docPoolPoints = docSurgeries.filter(s => s.source !== 'Venda de Serviço').reduce((acc, s) => acc + s.points, 0);
    const docPoolIncome = docPoolPoints * pointValue;
    const docDirectIncome = docSurgeries.filter(s => s.source === 'Venda de Serviço').reduce((acc, s) => acc + (s.cost || 0), 0);
    const docTotalIncome = docPoolIncome + docDirectIncome;

    // Complexity (Points / Surgery)
    const docAvgComplexity = docTotalSurgeries > 0 ? docTotalPoints / docTotalSurgeries : 0;

    // Average Income per Doctor (Benchmark) - Approx
    const totalDirectSales = periodSurgeries.filter(s => s.source === 'Venda de Serviço').reduce((acc, s) => acc + (s.cost || 0), 0);
    const avgIncomePerDoc = (monthlyBudget + totalDirectSales) / activeDoctorsCount;

    return {
      activeDoctorsCount,
      pointValue,
      benchmarks: {
        avgVolume: avgSurgeriesPerDoc,
        avgPoints: avgPointsPerDoc,
        avgComplexity: avgComplexity,
        avgIncome: avgIncomePerDoc
      },
      doctor: {
        volume: docTotalSurgeries,
        points: docTotalPoints,
        complexity: docAvgComplexity,
        income: docTotalIncome,
        poolIncome: docPoolIncome,
        directIncome: docDirectIncome,
        surgeries: docSurgeries
      }
    };
  }, [surgeries, startDate, endDate, selectedDoctor, monthlyBudget]);

  // --- CHART DATA PREPARATION ---

  // 1. Radar Chart Data (Efficiency Profile)
  const radarData = useMemo(() => {
    // Normalize values relative to the average. 
    // If Avg = 100%, we map it to 60 on the chart. Max is 100 (approx 1.6x avg).
    const normalize = (val: number, avg: number) => {
       if (avg === 0) return 0;
       const ratio = val / avg;
       return Math.min(100, Math.round(ratio * 60)); 
    };

    return [
      { subject: 'Volume', A: normalize(analytics.doctor.volume, analytics.benchmarks.avgVolume), fullMark: 100 },
      { subject: 'Produção (Pts)', A: normalize(analytics.doctor.points, analytics.benchmarks.avgPoints), fullMark: 100 },
      { subject: 'Complexidade', A: normalize(analytics.doctor.complexity, analytics.benchmarks.avgComplexity), fullMark: 100 },
      { subject: 'Faturamento', A: normalize(analytics.doctor.income, analytics.benchmarks.avgIncome), fullMark: 100 },
      { subject: 'Venda Direta', A: normalize(analytics.doctor.directIncome, (analytics.benchmarks.avgIncome * 0.2)), fullMark: 100 }, // Benchmark arbitrary 20% mix
    ];
  }, [analytics]);

  // 2. Evolution Line Chart (Doctor vs Average)
  const evolutionData = useMemo(() => {
    // We need to iterate over global surgeries to build the timeline correctly
    const periodSurgeries = surgeries.filter(s => 
      (!startDate || s.date >= startDate) && (!endDate || s.date <= endDate)
    );
    
    // Group by month
    const monthlyStats: Record<string, { totalPoints: number, docPoints: number, activeDocs: Set<string> }> = {};

    periodSurgeries.forEach(s => {
      // Create sortable YYYY-MM key
      const [y, m] = s.date.split('-');
      const key = `${y}-${m}`; 

      if (!monthlyStats[key]) monthlyStats[key] = { totalPoints: 0, docPoints: 0, activeDocs: new Set() };
      
      monthlyStats[key].totalPoints += s.points;
      monthlyStats[key].activeDocs.add(s.doctorName);
      
      if (s.doctorName === selectedDoctor) {
        monthlyStats[key].docPoints += s.points;
      }
    });

    // Transform to array and sort
    return Object.entries(monthlyStats)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, stats]) => {
            const [y, m] = key.split('-');
            return {
                month: `${m}/${y}`,
                docPoints: stats.docPoints,
                avgPoints: Math.round(stats.totalPoints / (stats.activeDocs.size || 1))
            };
        });

  }, [surgeries, startDate, endDate, selectedDoctor]);

  // 3. Procedures Mix (Top 5)
  const procedureMixData = useMemo(() => {
    const counts: Record<string, number> = {};
    analytics.doctor.surgeries.forEach(s => {
      counts[s.surgeryType] = (counts[s.surgeryType] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [analytics.doctor.surgeries]);

  // Helper for Comparison Badge
  const ComparisonBadge = ({ val, avg, type = 'moreIsBetter' }: { val: number, avg: number, type?: 'moreIsBetter' | 'lessIsBetter' }) => {
     if (avg === 0) return <span className="text-gray-400 text-xs">-</span>;
     const diff = ((val - avg) / avg) * 100;
     const isPositive = diff > 0;
     // Good if positive AND moreIsBetter, OR negative AND lessIsBetter
     const isGood = type === 'moreIsBetter' ? isPositive : !isPositive;
     
     if (Math.abs(diff) < 1) return <span className="text-slate-400 flex items-center gap-1 text-xs px-2 py-1 bg-slate-100 rounded-full"><Minus size={12} /> Na média</span>;

     return (
       <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isGood ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
         {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
         {Math.abs(diff).toFixed(0)}%
       </span>
     );
  };

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
             <label className="block text-xs font-semibold text-slate-500 mb-1">Selecione o Médico</label>
             <div className="relative">
               <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
               <select 
                 className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer"
                 value={selectedDoctor}
                 onChange={e => setSelectedDoctor(e.target.value)}
               >
                 {doctorsList.map(d => <option key={d} value={d}>{d}</option>)}
               </select>
             </div>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
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
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* VOLUME */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
             <div className="flex justify-between items-start mb-4">
                 <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Cirurgias</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{analytics.doctor.volume}</h3>
                 </div>
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Activity size={20} />
                 </div>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Média da Equipe: {analytics.benchmarks.avgVolume.toFixed(0)}</span>
                <ComparisonBadge val={analytics.doctor.volume} avg={analytics.benchmarks.avgVolume} />
             </div>
          </div>

          {/* POINTS */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
             <div className="flex justify-between items-start mb-4">
                 <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Produção</p>
                    <h3 className="text-3xl font-bold text-indigo-600 mt-1">{analytics.doctor.points} <span className="text-sm font-normal text-slate-400">pts</span></h3>
                 </div>
                 <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Award size={20} />
                 </div>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Média: {analytics.benchmarks.avgPoints.toFixed(0)} pts</span>
                <ComparisonBadge val={analytics.doctor.points} avg={analytics.benchmarks.avgPoints} />
             </div>
          </div>

          {/* COMPLEXITY */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
             <div className="flex justify-between items-start mb-4">
                 <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Complexidade Média</p>
                    <h3 className="text-3xl font-bold text-purple-600 mt-1">{analytics.doctor.complexity.toFixed(1)}</h3>
                 </div>
                 <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <Microscope size={20} />
                 </div>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Média: {analytics.benchmarks.avgComplexity.toFixed(1)}</span>
                <ComparisonBadge val={analytics.doctor.complexity} avg={analytics.benchmarks.avgComplexity} />
             </div>
          </div>

          {/* FINANCIAL */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
             <div className="flex justify-between items-start mb-4">
                 <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Receita Estimada</p>
                    <h3 className="text-3xl font-bold text-emerald-600 mt-1">{formatCurrency(analytics.doctor.income)}</h3>
                 </div>
                 <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <DollarSign size={20} />
                 </div>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Mix: {((analytics.doctor.directIncome / (analytics.doctor.income || 1)) * 100).toFixed(0)}% Direto</span>
                <ComparisonBadge val={analytics.doctor.income} avg={analytics.benchmarks.avgIncome} />
             </div>
          </div>
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* RADAR CHART - PROFILE */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
              <h3 className="text-lg font-bold text-slate-800 mb-2 w-full text-left flex items-center gap-2">
                  <Activity size={18} className="text-blue-500"/> Perfil de Eficiência
              </h3>
              <p className="text-xs text-slate-500 w-full text-left mb-4">Comparativo normalizado em relação à média do grupo (60% = Média).</p>
              
              <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name={selectedDoctor}
                        dataKey="A"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.4}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* EVOLUTION LINE CHART */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-2 w-full text-left flex items-center gap-2">
                  <TrendingUp size={18} className="text-indigo-500"/> Evolução de Produtividade
              </h3>
              <p className="text-xs text-slate-500 w-full text-left mb-4">Pontuação mensal do médico vs Média da equipe.</p>

              <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="docPoints" name="Médico" stroke="#4f46e5" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                      <Line type="monotone" dataKey="avgPoints" name="Média Equipe" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* PROCEDURES MIX */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6 w-full text-left flex items-center gap-2">
              <Microscope size={18} className="text-emerald-500"/> Mix de Procedimentos (Top 5)
          </h3>
          <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={procedureMixData} margin={{ top: 0, right: 30, left: 100, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={150} tick={{fill: '#475569', fontSize: 11}} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24}>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          </div>
      </div>

    </div>
  );
};

export default DoctorDashboard;
