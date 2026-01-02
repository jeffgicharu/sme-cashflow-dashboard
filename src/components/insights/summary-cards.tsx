'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

interface SummaryCardsProps {
  revenue: number;
  expenses: number;
  profit: number;
  revenueChange: number;
  expensesChange: number;
  profitChange: number;
}

export function SummaryCards({
  revenue,
  expenses,
  profit,
  revenueChange,
  expensesChange,
  profitChange,
}: SummaryCardsProps) {
  const cards = [
    {
      label: 'Revenue',
      value: revenue,
      change: revenueChange,
      valueColor: 'text-green-600',
      isPositiveGood: true,
    },
    {
      label: 'Expenses',
      value: expenses,
      change: expensesChange,
      valueColor: 'text-red-600',
      isPositiveGood: false,
    },
    {
      label: 'Profit',
      value: profit,
      change: profitChange,
      valueColor: profit >= 0 ? 'text-green-600' : 'text-red-600',
      isPositiveGood: true,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {cards.map((card) => {
        const isPositive = card.change > 0;
        const isNeutral = card.change === 0;
        const isGood = card.isPositiveGood ? isPositive : !isPositive;

        return (
          <div
            key={card.label}
            className="rounded-lg border border-slate-200 bg-white p-3"
          >
            <p className="text-xs text-slate-500">{card.label}</p>
            <p
              className={cn(
                'mt-1 text-lg font-bold tabular-nums',
                card.valueColor
              )}
            >
              {card.label === 'Expenses' ? '-' : ''}
              {formatCurrency(Math.abs(card.value))}
            </p>
            <div className="mt-1 flex items-center gap-1">
              {isNeutral ? (
                <Minus className="h-3 w-3 text-slate-400" />
              ) : isGood ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span
                className={cn(
                  'text-xs',
                  isNeutral
                    ? 'text-slate-400'
                    : isGood
                      ? 'text-green-600'
                      : 'text-red-600'
                )}
              >
                {isNeutral
                  ? '0%'
                  : `${isPositive ? '+' : ''}${Math.round(card.change)}%`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
