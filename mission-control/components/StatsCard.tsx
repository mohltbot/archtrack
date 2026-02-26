'use client';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

const colorMap = {
  blue: 'bg-blue-500/20 border-blue-500/30',
  green: 'bg-green-500/20 border-green-500/30',
  yellow: 'bg-yellow-500/20 border-yellow-500/30',
  purple: 'bg-purple-500/20 border-purple-500/30',
};

export function StatsCard({ title, value, subtitle, color }: StatsCardProps) {
  return (
    <div className={`p-4 rounded-lg border ${colorMap[color]}`}>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}
