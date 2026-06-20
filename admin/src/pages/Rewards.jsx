import { useEffect, useState } from 'react';
import { Trophy, Flame } from 'lucide-react';
import { rewardAPI } from '../services/api';

export default function Rewards() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    rewardAPI.leaderboard({ period })
      .then((res) => setLeaderboard(res.data.data.leaderboard || []))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rewards & Leaderboard</h1>
          <p className="text-gray-500">Staff performance and achievements</p>
        </div>
        <select className="input w-auto" value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leaderboard.slice(0, 3).map((item, i) => {
          const medals = ['🥇', '🥈', '🥉'];
          const colors = ['from-yellow-400 to-yellow-600', 'from-gray-300 to-gray-500', 'from-orange-400 to-orange-600'];
          return (
            <div key={item.userId} className={`card p-6 bg-gradient-to-br ${colors[i]} text-white`}>
              <div className="text-4xl mb-2">{medals[i]}</div>
              <h3 className="text-lg font-bold">{item.name}</h3>
              <p className="text-white/80 text-sm capitalize">{period} Champion</p>
              <div className="mt-4 flex items-center gap-4">
                <div>
                  <p className="text-2xl font-bold">{item.points}</p>
                  <p className="text-xs text-white/70">Points</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">🔥 {item.streak}</p>
                  <p className="text-xs text-white/70">Streak</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" /> Full Leaderboard
        </h3>
        {loading ? (
          <p className="text-center py-8 text-gray-500">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-800">
                <th className="pb-3">Rank</th>
                <th className="pb-3">Staff</th>
                <th className="pb-3">Points</th>
                <th className="pb-3">Current Streak</th>
                <th className="pb-3">Best Streak</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((item) => (
                <tr key={item.userId} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 font-bold">#{item.rank}</td>
                  <td className="py-3 font-medium">{item.name}</td>
                  <td className="py-3">{item.points}</td>
                  <td className="py-3 flex items-center gap-1"><Flame className="w-4 h-4 text-orange-500" /> {item.streak}</td>
                  <td className="py-3">{item.longestStreak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-3">Reward Rules</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="font-medium">Daily Entry</p>
            <p className="text-primary-600 font-bold">+10 pts</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="font-medium">7-Day Streak</p>
            <p className="text-primary-600 font-bold">+50 pts</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="font-medium">30-Day Streak</p>
            <p className="text-primary-600 font-bold">+200 pts</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="font-medium">Accuracy Bonus</p>
            <p className="text-primary-600 font-bold">+5 pts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
