import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

function ModernAreaChart({ data }) {
  return (
    <div className="h-64 w-full rounded-[2rem] border border-slate-100 bg-white p-6 shadow-premium transition-all hover:shadow-premium-lg">
      <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Decision Traffic Trends</h3>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
            />
            <Area 
               type="monotone" 
               dataKey="value" 
               stroke="#2563eb" 
               strokeWidth={3}
               fillOpacity={1} 
               fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ModernPieChart({ data }) {
  const COLORS = ["#2563eb", "#6366f1", "#06b6d4", "#f43f5e"];

  return (
    <div className="h-64 w-full rounded-[2rem] border border-slate-100 bg-white p-6 shadow-premium transition-all hover:shadow-premium-lg">
      <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Distribution Analysis</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={8}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
               contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px' }}
            />
            <Legend 
               verticalAlign="bottom" 
               align="center"
               iconType="circle"
               formatter={(value) => <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ChartComponent({ type, data }) {
  if (type === "line") return <ModernAreaChart data={data} />;
  return <ModernPieChart data={data} />;
}

export default ChartComponent;
