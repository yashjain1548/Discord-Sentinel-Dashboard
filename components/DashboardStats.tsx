import React, { useMemo } from 'react';
import { DiscordMessage } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

interface DashboardStatsProps {
  messages: DiscordMessage[];
}

const COLORS = ['#5865F2', '#57F287', '#FEE75C', '#EB459F', '#ED4245'];

const DashboardStats: React.FC<DashboardStatsProps> = ({ messages }) => {
  const analyzedMessages = messages.filter(m => m.analysis);

  const stats = useMemo(() => {
    if (analyzedMessages.length === 0) return { avgSentiment: 0, toxicCount: 0, topicCounts: [] };

    const totalSentiment = analyzedMessages.reduce((acc, m) => acc + (m.analysis?.sentiment_score || 0), 0);
    const toxicCount = analyzedMessages.filter(m => m.analysis?.is_toxic).length;
    
    const topicMap: Record<string, number> = {};
    analyzedMessages.forEach(m => {
      const topic = m.analysis?.primary_topic || 'Unknown';
      topicMap[topic] = (topicMap[topic] || 0) + 1;
    });

    const topicCounts = Object.entries(topicMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      avgSentiment: (totalSentiment / analyzedMessages.length).toFixed(2),
      toxicCount,
      topicCounts
    };
  }, [analyzedMessages]);

  const sentimentData = analyzedMessages.map((m, i) => ({
    time: i, // distinct index for simplicity in this view
    sentiment: m.analysis?.sentiment_score.toFixed(2),
    topic: m.analysis?.primary_topic
  })).slice(-20); // Last 20 messages

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Summary Cards */}
      <div className="bg-[#2f3136] p-4 rounded-lg shadow-md border border-[#202225]">
        <h3 className="text-gray-400 text-xs uppercase font-bold mb-1">Total Messages</h3>
        <p className="text-2xl font-bold text-white">{analyzedMessages.length}</p>
      </div>
      
      <div className="bg-[#2f3136] p-4 rounded-lg shadow-md border border-[#202225]">
        <h3 className="text-gray-400 text-xs uppercase font-bold mb-1">Avg Sentiment</h3>
        <p className={`text-2xl font-bold ${Number(stats.avgSentiment) >= 0 ? 'text-[#57F287]' : 'text-[#ED4245]'}`}>
          {stats.avgSentiment}
        </p>
      </div>

      <div className="bg-[#2f3136] p-4 rounded-lg shadow-md border border-[#202225]">
        <h3 className="text-gray-400 text-xs uppercase font-bold mb-1">Toxicity Alerts</h3>
        <p className={`text-2xl font-bold ${stats.toxicCount > 0 ? 'text-[#ED4245]' : 'text-gray-200'}`}>
          {stats.toxicCount}
        </p>
      </div>

      <div className="bg-[#2f3136] p-4 rounded-lg shadow-md border border-[#202225]">
        <h3 className="text-gray-400 text-xs uppercase font-bold mb-1">Trending Topic</h3>
        <p className="text-xl font-bold text-[#5865F2] truncate">
          {stats.topicCounts[0]?.name || 'N/A'}
        </p>
      </div>

      {/* Charts Section */}
      <div className="col-span-1 md:col-span-2 bg-[#2f3136] p-4 rounded-lg border border-[#202225] h-64">
        <h3 className="text-gray-400 text-xs uppercase font-bold mb-4">Sentiment Timeline (Last 20)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sentimentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#40444b" />
            <XAxis dataKey="time" hide />
            <YAxis domain={[-1, 1]} stroke="#96989d" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#202225', border: 'none', borderRadius: '4px' }}
              itemStyle={{ color: '#dcddde' }}
            />
            <Line type="monotone" dataKey="sentiment" stroke="#5865F2" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="col-span-1 md:col-span-2 bg-[#2f3136] p-4 rounded-lg border border-[#202225] h-64">
        <h3 className="text-gray-400 text-xs uppercase font-bold mb-4">Topic Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.topicCounts} layout="vertical">
             <CartesianGrid strokeDasharray="3 3" stroke="#40444b" horizontal={false} />
            <XAxis type="number" stroke="#96989d" hide />
            <YAxis dataKey="name" type="category" width={100} stroke="#96989d" style={{ fontSize: '12px' }} />
            <Tooltip 
              cursor={{fill: '#40444b', opacity: 0.3}}
              contentStyle={{ backgroundColor: '#202225', border: 'none', borderRadius: '4px' }}
              itemStyle={{ color: '#dcddde' }}
            />
            <Bar dataKey="value" fill="#57F287" radius={[0, 4, 4, 0]}>
              {stats.topicCounts.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardStats;