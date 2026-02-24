// src/components/ThroughputPreviewChart.jsx

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea
} from "recharts";

export default function ThroughputPreviewChart({
  throughputRun,
  startDate,
  endDate
}) {
  // -------------------------------------------------------
  // Stable date values (prevents input flicker)
  // -------------------------------------------------------
  const stableStart = useMemo(() => startDate || null, [startDate]);
  const stableEnd = useMemo(() => endDate || null, [endDate]);

  // -------------------------------------------------------
  // Memoized shading data
  // -------------------------------------------------------
  const shadedData = useMemo(() => {
    if (!throughputRun || throughputRun.length === 0) return [];

    return throughputRun.map((d) => {
      const inRange =
        stableStart &&
        stableEnd &&
        d.date >= stableStart &&
        d.date <= stableEnd;

      return {
        ...d,
        shaded: inRange
      };
    });
  }, [throughputRun, stableStart, stableEnd]);

  // -------------------------------------------------------
  // Only shade if BOTH dates are set
  // -------------------------------------------------------
  const hasRange = Boolean(stableStart && stableEnd);

  // -------------------------------------------------------
  // First date label for context
  // -------------------------------------------------------
  const firstDate = throughputRun?.[0]?.date || null;

  return (
    <div style={{ width: "100%", height: 260 }}>
      {/* Contextual start date */}
      {firstDate && (
        <div
          style={{
            fontSize: "0.75rem",
            opacity: 0.6,
            marginBottom: "0.25rem"
          }}
        >
          Starting {firstDate}
        </div>
      )}

      <ResponsiveContainer>
        <AreaChart data={shadedData}>
          {/* CLEAN X-AXIS: no ticks, no labels, no clutter */}
        <XAxis
  dataKey="date"
  tick={false}
 hide={true}
 axisLine={false}
  tickLine={false}
  interval="preserveStart"
  minTickGap={9999}
/>


          <YAxis
            width={30}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip />

          {/* Base throughput line */}
          <Area
            type="monotone"
            dataKey="count"
            stroke="#2563eb"
            fill="#93c5fd"
            fillOpacity={0.3}
            isAnimationActive={false}
          />

          {/* Shaded region only if both dates are set */}
          {hasRange && (
            <ReferenceArea
              x1={stableStart}
              x2={stableEnd}
              ifOverflow="extendDomain"
              fill="#2563eb"
              fillOpacity={0.15}
              strokeOpacity={0}
              isAnimationActive={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}