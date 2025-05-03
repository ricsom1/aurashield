import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TwitterStats {
  total: number;
  crisis: number;
  crisisRate: number;
  sentimentCounts: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

interface TwitterAnalyticsProps {
  stats: TwitterStats | null;
}

export default function TwitterAnalytics({ stats }: TwitterAnalyticsProps) {
  if (!stats) return null;

  const data = [
    { name: 'Positive', value: stats.sentimentCounts.positive },
    { name: 'Neutral', value: stats.sentimentCounts.neutral },
    { name: 'Negative', value: stats.sentimentCounts.negative },
  ];

  const COLORS = ['#22c55e', '#a3a3a3', '#ef4444'];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Twitter Analytics</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="text-sm font-medium text-gray-500">Total Mentions</h4>
          <p className="mt-2 text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="text-sm font-medium text-gray-500">Crisis Mentions</h4>
          <p className="mt-2 text-3xl font-bold text-red-600">{stats.crisis}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="text-sm font-medium text-gray-500">Crisis Rate</h4>
          <p className="mt-2 text-3xl font-bold text-orange-600">{stats.crisisRate.toFixed(1)}%</p>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 