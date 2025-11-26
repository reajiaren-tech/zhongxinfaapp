import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { LocationPoint, IterationStep } from '../types';

interface Props {
  points: LocationPoint[];
  history: IterationStep[];
  currentIteration: number;
}

export const Visualization: React.FC<Props> = ({ points, history, currentIteration }) => {
  const facilityData = points.map(p => ({
    x: p.x,
    y: p.y,
    z: p.weight,
    name: p.name,
    type: p.type,
    volume: p.volume,
    rate: p.rate
  }));

  const currentCenter = history[currentIteration];
  const centerData = currentCenter ? [{ x: currentCenter.x, y: currentCenter.y, z: 1200, name: 'Center' }] : [];
  
  const trailData = history.slice(0, currentIteration + 1).map((h, idx) => ({
    x: h.x,
    y: h.y,
    z: 150,
    iteration: h.step,
    name: `Step ${h.step}`
  }));

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="X Coord" 
            stroke="#64748b" 
            tick={{ fill: '#64748b', fontSize: 10 }} 
            domain={[0, 100]} 
            tickLine={true}
            axisLine={true}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Y Coord" 
            stroke="#64748b" 
            tick={{ fill: '#64748b', fontSize: 10 }} 
            domain={[0, 100]} 
            tickLine={true}
            axisLine={true}
          />
          <ZAxis type="number" dataKey="z" range={[100, 1200]} />
          
          <Tooltip 
            cursor={{ strokeDasharray: '3 3', stroke: '#3B82F6' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                if (data.name === 'Center' || (data.name && data.name.startsWith('Step'))) {
                   return (
                      <div className="bg-white/95 p-3 rounded border shadow-lg text-sm font-mono">
                          <p className="font-bold text-red-600 border-b mb-1">{data.name}</p>
                          <div className="space-y-1">
                             <div className="flex justify-between gap-4"><span>X:</span> <span>{data.x.toFixed(2)}</span></div>
                             <div className="flex justify-between gap-4"><span>Y:</span> <span>{data.y.toFixed(2)}</span></div>
                          </div>
                      </div>
                   );
                }
                return (
                  <div className="bg-white/95 p-3 rounded border shadow-lg text-sm font-mono text-gray-700 min-w-[180px]">
                    <p className="font-bold border-b pb-1 mb-2 text-blue-900">{data.name}</p>
                    <div className="space-y-1">
                       <div className="flex justify-between">
                         <span className="text-gray-500">供货量 (Vol):</span> 
                         <span className="font-bold">{data.volume} t</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-500">费率 (Rate):</span> 
                         <span className="font-bold">{data.rate}</span>
                       </div>
                       <div className="flex justify-between pt-1 border-t border-gray-100 mt-1">
                         <span className="text-orange-600 font-bold">权重 (Weight):</span> 
                         <span className="font-bold text-orange-600">{data.z.toFixed(0)}</span>
                       </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400 text-right">({data.x}, {data.y})</div>
                  </div>
                );
              }
              return null;
            }}
          />
          
          {/* Facilities */}
          <Scatter name="Facilities" data={facilityData} animationDuration={800}>
            {facilityData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill="#F97316" // Orange for all Demand Points
                stroke="white"
                strokeWidth={2}
              />
            ))}
            <LabelList 
              dataKey="name" 
              position="top" 
              style={{ 
                fill: '#475569', 
                fontSize: '11px', 
                fontWeight: 'bold' 
              }} 
            />
          </Scatter>

          {/* Trail */}
          <Scatter 
            name="History" 
            data={trailData} 
            fill="#94A3B8" 
            line={{ stroke: '#94A3B8', strokeWidth: 2, strokeDasharray: '4 4' }} 
            shape="circle" 
            opacity={0.6} 
          />

          {/* Center */}
          <Scatter 
            name="Optimal Center" 
            data={centerData} 
            shape={<TargetShape />} 
          />

        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

const TargetShape = (props: any) => {
  const { cx, cy } = props;
  return (
    <g className="filter drop-shadow-md transition-all duration-500 ease-out">
      {/* Target reticle look */}
      <circle cx={cx} cy={cy} r={20} fill="none" stroke="#DC2626" strokeWidth="1" strokeDasharray="4 2" className="animate-spin-slow" />
      <circle cx={cx} cy={cy} r={12} fill="#DC2626" stroke="white" strokeWidth="2" />
      <line x1={cx-25} y1={cy} x2={cx+25} y2={cy} stroke="#DC2626" strokeWidth="1" opacity={0.5} />
      <line x1={cx} y1={cy-25} x2={cx} y2={cy+25} stroke="#DC2626" strokeWidth="1" opacity={0.5} />
    </g>
  );
};