'use client';

interface Stats {
  totalLeads: number;
  hotLeads: number;
  warmLeads?: number;
  coldLeads?: number;
  avgScore: number;
  callsConnected: number;
  qualified: number;
}

interface StatsHeaderProps {
  stats: Stats;
}

export default function StatsHeader({ stats }: StatsHeaderProps) {
  const statCards = [
    {
      label: 'Total Leads',
      value: stats.totalLeads,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-100',
    },
    {
      label: 'Hot Leads',
      value: stats.hotLeads,
      color: 'bg-green-50 text-green-700 border-green-200',
      iconBg: 'bg-green-100',
    },
    {
      label: 'Warm Leads',
      value: stats.warmLeads ?? 0,
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      iconBg: 'bg-yellow-100',
    },
    {
      label: 'Cold Leads',
      value: stats.coldLeads ?? 0,
      color: 'bg-gray-50 text-gray-700 border-gray-200',
      iconBg: 'bg-gray-100',
    },
    {
      label: 'Avg Score',
      value: stats.avgScore,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-100',
      suffix: '/100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className={`${stat.color} border rounded-xl p-4`}
        >
          <p className="text-xs font-medium opacity-75 mb-1">{stat.label}</p>
          <p className="text-2xl font-bold">
            {stat.value}
            {stat.suffix && <span className="text-sm font-normal opacity-60">{stat.suffix}</span>}
          </p>
        </div>
      ))}
    </div>
  );
}
