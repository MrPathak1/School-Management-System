import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-primary-50 text-primary-600',
    green: 'bg-success-50 text-success-600',
    yellow: 'bg-warning-50 text-warning-600',
    red: 'bg-danger-50 text-danger-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  const iconBgClasses = {
    blue: 'bg-primary-100',
    green: 'bg-success-100',
    yellow: 'bg-warning-100',
    red: 'bg-danger-100',
    purple: 'bg-purple-100',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>
          )}
          {trend && (
            <div className={`mt-2 flex items-center text-sm ${trend.isPositive ? 'text-success-600' : 'text-danger-600'}`}>
              <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="ml-1 text-neutral-400">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBgClasses[color]}`}>
          <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[1]}`} />
        </div>
      </div>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function SectionCard({ title, subtitle, children, action, className = '' }: SectionCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-neutral-100 ${className}`}>
      <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
