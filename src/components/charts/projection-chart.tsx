'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface ProjectionPoint {
  day: number;
  date: string;
  balance: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface ProjectionChartProps {
  data: ProjectionPoint[];
  threshold: number;
  currentBalance: number;
}

export function ProjectionChart({
  data,
  threshold,
  currentBalance: _currentBalance,
}: ProjectionChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        No projection data available
      </div>
    );
  }

  // Format data for display
  const formattedData = data.map((d) => ({
    ...d,
    label:
      d.day === 0
        ? 'Today'
        : d.day === 15
          ? '+15d'
          : d.day === 30
            ? '+30d'
            : '',
  }));

  // Determine overall status for gradient color
  const finalStatus = data[data.length - 1]?.status || 'healthy';
  const gradientColor =
    finalStatus === 'healthy'
      ? '#10B981'
      : finalStatus === 'warning'
        ? '#F59E0B'
        : '#EF4444';

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="projectionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={gradientColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E2E8F0"
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#64748B' }}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#64748B' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            domain={[0, 'auto']}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value)), 'Balance']}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                const date = new Date(payload[0].payload.date);
                return date.toLocaleDateString('en-KE', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                });
              }
              return label;
            }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <ReferenceLine
            y={threshold}
            stroke="#EF4444"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: `Threshold: ${formatCurrency(threshold)}`,
              position: 'right',
              fill: '#EF4444',
              fontSize: 10,
            }}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke={gradientColor}
            strokeWidth={2}
            fill="url(#projectionGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
