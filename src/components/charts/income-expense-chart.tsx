'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface DailyData {
  date: string;
  income: number;
  expense: number;
}

interface IncomeExpenseChartProps {
  data: DailyData[];
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  // Format date for display
  const formattedData = data.map((d) => {
    const date = new Date(d.date);
    return {
      ...d,
      label: date.toLocaleDateString('en-KE', {
        weekday: 'short',
        day: 'numeric',
      }),
    };
  });

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
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
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            labelStyle={{ color: '#1E293B', fontWeight: 500 }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            iconType="circle"
            iconSize={8}
          />
          <Bar
            dataKey="income"
            name="Income"
            fill="#10B981"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            dataKey="expense"
            name="Expenses"
            fill="#EF4444"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
