import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { moduleAPI, analyticsAPI } from '../services/api';

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

export default function Analytics() {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [growthData, setGrowthData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    moduleAPI.list({ isActive: true }).then((res) => {
      const mods = res.data.data;
      setModules(mods);
      if (mods.length > 0) {
        setSelectedModule(mods[0]._id);
        const numField = mods[0].fields?.find((f) => f.type === 'number');
        if (numField) setSelectedField(numField.slug);
      }
    });
    analyticsAPI.insights().then((res) => setInsights(res.data.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedModule || !selectedField) return;
    const params = { moduleId: selectedModule, fieldSlug: selectedField, period };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    analyticsAPI.growth(params)
      .then((res) => setGrowthData(res.data.data));
  }, [selectedModule, selectedField, period, startDate, endDate]);

  const currentModule = modules.find((m) => m._id === selectedModule);
  const numericFields = currentModule?.fields?.filter((f) => ['number', 'currency', 'percentage'].includes(f.type)) || [];

  const pieData = modules.map((m, i) => ({
    name: m.name,
    value: m.fields?.length || 1,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-500">Growth trends and performance insights</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <select className="input w-auto" value={selectedModule} onChange={(e) => {
          setSelectedModule(e.target.value);
          const mod = modules.find((m) => m._id === e.target.value);
          const f = mod?.fields?.find((f) => f.type === 'number');
          if (f) setSelectedField(f.slug);
        }}>
          {modules.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
        </select>
        <select className="input w-auto" value={selectedField} onChange={(e) => setSelectedField(e.target.value)}>
          {numericFields.map((f) => <option key={f.slug} value={f.slug}>{f.name}</option>)}
        </select>
        <select className="input w-auto" value={period} onChange={(e) => setPeriod(e.target.value)}>
          {['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].map((p) => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
        <input type="date" className="input w-auto" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Start" />
        <input type="date" className="input w-auto" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End" />
      </div>

      {growthData?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 text-center">
            <p className="text-xs text-gray-500">Avg Growth</p>
            <p className="text-xl font-bold text-primary-600">{growthData.summary.averageGrowth}%</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-gray-500">Total Growth</p>
            <p className="text-xl font-bold">{growthData.summary.totalGrowth}%</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-gray-500">Highest</p>
            <p className="text-xl font-bold text-green-600">{growthData.summary.highestValue?.toLocaleString()}</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-xs text-gray-500">Lowest</p>
            <p className="text-xl font-bold text-red-500">{growthData.summary.lowestValue?.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Growth Trend — {currentModule?.name}</h3>
          {growthData?.data?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growthData.data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No data for selected period</p>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Growth % by Period</h3>
          {growthData?.data?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={growthData.data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="growth" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No data available</p>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Module Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Advanced Insights</h3>
          <div className="space-y-3">
            {insights?.fastestGrowingChannel && (
              <div className="p-3 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">🚀 Fastest Growing</p>
                <p className="text-lg font-bold">{insights.fastestGrowingChannel.module}</p>
                <p className="text-sm text-gray-500">+{insights.fastestGrowingChannel.growth}% growth</p>
              </div>
            )}
            {insights?.bestWeek && (
              <div className="p-3 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">📅 Best Week</p>
                <p className="text-lg font-bold">{insights.bestWeek.period}</p>
                <p className="text-sm text-gray-500">+{insights.bestWeek.growth}% ({insights.bestWeek.module})</p>
              </div>
            )}
            <div className="p-3 border border-primary-200 dark:border-primary-800 rounded-lg">
              <p className="text-sm font-medium text-primary-700 dark:text-primary-400">📊 Consistency</p>
              <p className="text-lg font-bold">{insights?.consistencyScore || 0}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
