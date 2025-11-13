'use client';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineMiniProps {
  data: { value: number }[];
  color?: string;
}

export function SparklineMini({ data, color = '#3b82f6' }: SparklineMiniProps) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}