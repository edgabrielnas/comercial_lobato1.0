import { Surgery, DoctorStats } from '../types';

export const calculateStats = (surgeries: Surgery[]): DoctorStats[] => {
  const doctorMap: Record<string, DoctorStats> = {};

  // Helper for PT-BR month name
  const getMonthName = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      // Capitalize first letter: "jan. 2025" -> "Jan 2025"
      const str = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      return str.charAt(0).toUpperCase() + str.slice(1);
    } catch (e) {
      return 'Desconhecido';
    }
  };

  surgeries.forEach(s => {
    const doctorName = s.doctorName;
    if (!doctorMap[doctorName]) {
      doctorMap[doctorName] = {
        doctorName,
        totalSurgeries: 0,
        totalPoints: 0,
        averagePoints: 0,
        surgeriesByMonth: {},
        pointsByMonth: {}
      };
    }

    const stats = doctorMap[doctorName];
    stats.totalSurgeries += 1;
    stats.totalPoints += s.points;

    const monthKey = getMonthName(s.date);

    if (!stats.surgeriesByMonth[monthKey]) stats.surgeriesByMonth[monthKey] = 0;
    if (!stats.pointsByMonth[monthKey]) stats.pointsByMonth[monthKey] = 0;

    stats.surgeriesByMonth[monthKey] += 1;
    stats.pointsByMonth[monthKey] += s.points;
  });

  return Object.values(doctorMap).map(d => ({
    ...d,
    averagePoints: d.totalSurgeries > 0 ? parseFloat((d.totalPoints / d.totalSurgeries).toFixed(2)) : 0
  })).sort((a, b) => b.totalPoints - a.totalPoints);
};