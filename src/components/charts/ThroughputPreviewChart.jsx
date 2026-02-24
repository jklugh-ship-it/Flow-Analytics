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
  // Memoized shading data (CRITICAL FIX)
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
  // Compute shaded region boundaries
  // -------------------------------------------------------
  const hasRange = stableStart && stableEnd;

  return (
    <div style={{ width: "100%", height: 250 }}>
      <ResponsiveContainer>
        <AreaChart data={shadedData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />

          {/* Base throughput line */}
          <Area
            type="monotone"
            dataKey="count"
            stroke="#2563eb"
            fill="#93c5fd"
            fillOpacity={0.3}
            isAnimationActive={false} // prevents flicker
          />

          {/* Shaded region */}
          {hasRange && (
            <ReferenceArea
              x1={stableStart}
              x2={stableEnd}
              ifOverflow="extendDomain"
              fill="#2563eb"
              fillOpacity={0.15}
              strokeOpacity={0}
              isAnimationActive={false} // prevents flicker
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}