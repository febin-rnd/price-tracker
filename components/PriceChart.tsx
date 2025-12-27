
import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { PricePoint } from '../types';

interface PriceChartProps {
  data: PricePoint[];
  currency: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ data, currency }) => {
  const formattedData = data.map(p => ({
    ...p,
    date: new Date(p.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    val: p.price
  }));

  return (
    <div className="h-44 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4}/>
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0}/>
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
          </defs>
          <CartesianGrid 
            strokeDasharray="4 4" 
            vertical={false} 
            stroke="rgba(255, 255, 255, 0.05)" 
          />
          <XAxis 
            dataKey="date" 
            hide={true}
          />
          <YAxis 
            hide={true}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip 
            contentStyle={{ 
                backgroundColor: '#0f172a',
                borderRadius: '8px', 
                border: '1px solid #22d3ee', 
                boxShadow: '0 0 15px rgba(34, 211, 238, 0.2)',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace',
                color: '#fff'
            }}
            itemStyle={{ color: '#22d3ee' }}
            cursor={{ stroke: 'rgba(34, 211, 238, 0.2)', strokeWidth: 1 }}
            formatter={(value: number) => [`${currency}${value.toLocaleString()}`, 'INDEX']}
          />
          <Area 
            type="stepAfter" 
            dataKey="val" 
            stroke="#22d3ee" 
            strokeWidth={1.5}
            fillOpacity={1} 
            fill="url(#chartGradient)" 
            animationDuration={2000}
            filter="url(#glow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
