import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { Card } from '../common/Card';
import { formatNumber } from '../../utils/formatters';

// Custom Tooltip component for consistent fintech aesthetic
const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-fintech-border shadow-modal text-xs space-y-1">
        {label && <p className="font-semibold text-fintech-text border-b border-fintech-borderLight pb-1">{label}</p>}
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-fintech-muted">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              {entry.name}:
            </span>
            <span className="font-bold text-fintech-text">
              {prefix}{formatNumber(entry.value)}{suffix}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function RiskDistributionChart({ data }) {
  const COLORS = ['#10B981', '#EF4444'];
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card
      title="Risk Classification Ratio"
      subtitle="Experimental Target: 50% split at $2,320 median credit amount"
    >
      <div className="h-64 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip suffix=" applications" />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-xs text-fintech-text font-medium">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <span className="text-2xl font-bold text-fintech-text">{formatNumber(total)}</span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-fintech-muted">Total Loans</span>
        </div>
      </div>
    </Card>
  );
}

export function CreditAmountChart({ data }) {
  return (
    <Card
      title="Credit Amount Distribution"
      subtitle="Volume of applications across loan size brackets (median: $2,320)"
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F7" vertical={false} />
            <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#778198' }} tickLine={false} axisLine={{ stroke: '#E8EAF2' }} />
            <YAxis tick={{ fontSize: 11, fill: '#778198' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip suffix=" loans" />} />
            <Legend verticalAlign="top" align="right" height={30} formatter={(val) => <span className="text-xs text-fintech-muted">{val}</span>} />
            <Bar dataKey="lowRisk" name="Low Risk (<= $2,320)" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" />
            <Bar dataKey="highRisk" name="High Risk (> $2,320)" fill="#EF4444" radius={[4, 4, 0, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function PurposeChart({ data }) {
  return (
    <Card
      title="Applications Grouped by Loan Purpose"
      subtitle="Highest credit volumes concentrated in Car purchases and Radio/TV financing"
    >
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F7" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#778198' }} tickLine={false} axisLine={{ stroke: '#E8EAF2' }} />
            <YAxis
              type="category"
              dataKey="purpose"
              tick={{ fontSize: 11, fill: '#182033', fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip content={<CustomTooltip suffix=" loans" />} />
            <Legend verticalAlign="top" align="right" height={25} formatter={(val) => <span className="text-xs text-fintech-muted">{val}</span>} />
            <Bar dataKey="lowRisk" name="Low Risk" fill="#10B981" radius={[0, 4, 4, 0]} stackId="a" />
            <Bar dataKey="highRisk" name="High Risk" fill="#6C4CF1" radius={[0, 4, 4, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function DurationChart({ data }) {
  return (
    <Card
      title="Loan Duration Distribution (Months)"
      subtitle="Repayment timelines ranging from 4 to 72 months (mean: 20.9 months)"
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="durationGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6C4CF1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6C4CF1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F7" vertical={false} />
            <XAxis dataKey="bracket" tick={{ fontSize: 11, fill: '#778198' }} tickLine={false} axisLine={{ stroke: '#E8EAF2' }} />
            <YAxis tick={{ fontSize: 11, fill: '#778198' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip suffix=" applicants" />} />
            <Area
              type="monotone"
              dataKey="count"
              name="Applications"
              stroke="#6C4CF1"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#durationGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function AgeDistributionChart({ data }) {
  return (
    <Card
      title="Applicant Age Distribution"
      subtitle="Demographics spanning ages 19 to 75 (mean: 35.5 years, median: 33 years)"
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F7" vertical={false} />
            <XAxis dataKey="bracket" tick={{ fontSize: 11, fill: '#778198' }} tickLine={false} axisLine={{ stroke: '#E8EAF2' }} />
            <YAxis tick={{ fontSize: 11, fill: '#778198' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip suffix=" applicants" />} />
            <Bar dataKey="count" name="Applicant Count" fill="#4285F4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
