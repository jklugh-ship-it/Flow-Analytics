// src/components/ThroughputPreviewChart.jsx

import React, { useMemo, useState, useCallback } from "react";
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
  endDate,
  onRangeSelect
}) {
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const stableStart = useMemo(() => startDate || null, [startDate]);
  const stableEnd = useMemo(() => endDate || null, [endDate]);

  const shadedData = useMemo(() => {
    if (!throughputRun || throughputRun.length === 0) return [];
    return throughputRun.map((d) => ({ ...d }));
  }, [throughputRun]);

  const hasRange = Boolean(stableStart && stableEnd);
  const firstDate = throughputRun?.[0]?.date || null;

  // Drag handlers — Recharts passes activeLabel (the date string) in the event payload
  const handleMouseDown = useCallback((e) => {
    if (!e || !e.activeLabel) return;
    setDragStart(e.activeLabel);
    setDragEnd(null);
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !e || !e.activeLabel) return;
    setDragEnd(e.activeLabel);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragStart && dragEnd && onRangeSelect) {
      // Ensure start <= end regardless of drag direction
      const [a, b] = [dragStart, dragEnd].sort();
      onRangeSelect(a, b);
    }

    setDragStart(null);
    setDragEnd(null);
  }, [isDragging, dragStart, dragEnd, onRangeSelect]);

  // Show drag-in-progress highlight OR committed selection
  const showDragPreview = isDragging && dragStart && dragEnd;
  const [previewA, previewB] = showDragPreview
    ? [dragStart, dragEnd].sort()
    : [null, null];

  return (
    <div style={{ width: "100%", height: 260 }}>
      {firstDate && (
        <div style={{ fontSize: "0.75rem", opacity: 0.6, marginBottom: "0.25rem" }}>
          Starting {firstDate}
          {hasRange && !isDragging && (
            <span style={{ marginLeft: "1rem", opacity: 0.8 }}>
              Selection: {stableStart} → {stableEnd}
            </span>
          )}
          {!hasRange && !isDragging && (
            <span style={{ marginLeft: "1rem", opacity: 0.6, fontStyle: "italic" }}>
              Drag to select a window
            </span>
          )}
        </div>
      )}

      <ResponsiveContainer>
        <AreaChart
          data={shadedData}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: isDragging ? "col-resize" : "crosshair" }}
        >
          <XAxis
            dataKey="date"
            tick={false}
            tickLine={false}
            axisLine={true}
          />

          <YAxis
            width={30}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />

          <Tooltip active={!isDragging} />

          <Area
            type="monotone"
            dataKey="count"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.25}
            isAnimationActive={false}
          />

          {/* Committed selection */}
          {hasRange && !showDragPreview && (
            <ReferenceArea
              x1={stableStart}
              x2={stableEnd}
              ifOverflow="extendDomain"
              fill="#10b981"
              fillOpacity={0.2}
              stroke="#10b981"
              strokeOpacity={0.5}
              isAnimationActive={false}
            />
          )}

          {/* Live drag preview */}
          {showDragPreview && (
            <ReferenceArea
              x1={previewA}
              x2={previewB}
              ifOverflow="extendDomain"
              fill="#2563eb"
              fillOpacity={0.15}
              stroke="#2563eb"
              strokeOpacity={0.6}
              isAnimationActive={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
