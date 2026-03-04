import { describe, it, expect } from "vitest";
import { simulateHowMany } from "../src/utils/simulateHowMany";
import { simulateDuration } from "../src/utils/simulateDuration";

// -------------------------------------------------------
// simulateHowMany
// -------------------------------------------------------

describe("simulateHowMany", () => {
  it("returns zero results for empty throughput samples", () => {
    const result = simulateHowMany({ throughputSamples: [], days: 10, numSimulations: 100 });
    expect(result).toEqual({ p05: 0, p15: 0, p50: 0, sims: [] });
  });

  it("returns zero results for null throughput samples", () => {
    const result = simulateHowMany({ throughputSamples: null, days: 10, numSimulations: 100 });
    expect(result).toEqual({ p05: 0, p15: 0, p50: 0, sims: [] });
  });

  it("runs the correct number of simulations", () => {
    const result = simulateHowMany({
      throughputSamples: [1, 2, 3],
      days: 5,
      numSimulations: 500
    });
    expect(result.sims.length).toBe(500);
  });

  it("returns sorted simulation results", () => {
    const result = simulateHowMany({
      throughputSamples: [1, 2, 3],
      days: 7,
      numSimulations: 200
    });
    for (let i = 1; i < result.sims.length; i++) {
      expect(result.sims[i]).toBeGreaterThanOrEqual(result.sims[i - 1]);
    }
  });

  it("p05 <= p15 <= p50", () => {
    const result = simulateHowMany({
      throughputSamples: [1, 2, 3, 4, 5],
      days: 14,
      numSimulations: 1000
    });
    expect(result.p05).toBeLessThanOrEqual(result.p15);
    expect(result.p15).toBeLessThanOrEqual(result.p50);
  });

  it("produces deterministic bounds for a fixed-throughput dataset", () => {
    // All samples are exactly 2 — every simulation should total exactly days * 2
    const result = simulateHowMany({
      throughputSamples: [2],
      days: 10,
      numSimulations: 100
    });
    expect(result.p05).toBe(20);
    expect(result.p50).toBe(20);
  });

  it("returns zero completions when throughput is always zero", () => {
    const result = simulateHowMany({
      throughputSamples: [0],
      days: 10,
      numSimulations: 100
    });
    expect(result.p50).toBe(0);
  });

  it("simulates exactly the given number of days per run", () => {
    // With throughput always 1 and 3 days, each sim should produce exactly 3
    const result = simulateHowMany({
      throughputSamples: [1],
      days: 3,
      numSimulations: 50
    });
    expect(result.sims.every((v) => v === 3)).toBe(true);
  });
});

// -------------------------------------------------------
// simulateDuration
// -------------------------------------------------------

describe("simulateDuration", () => {
  it("returns zero results for empty throughput samples", () => {
    const result = simulateDuration({ throughputSamples: [], targetCount: 10, numSimulations: 100 });
    expect(result).toEqual({ p50: 0, p85: 0, p95: 0, sims: [] });
  });

  it("returns zero results for null throughput samples", () => {
    const result = simulateDuration({ throughputSamples: null, targetCount: 10, numSimulations: 100 });
    expect(result).toEqual({ p50: 0, p85: 0, p95: 0, sims: [] });
  });

  it("runs the correct number of simulations", () => {
    const result = simulateDuration({
      throughputSamples: [2, 3, 4],
      targetCount: 10,
      numSimulations: 300
    });
    expect(result.sims.length).toBe(300);
  });

  it("returns sorted simulation results", () => {
    const result = simulateDuration({
      throughputSamples: [1, 2, 3],
      targetCount: 15,
      numSimulations: 200
    });
    for (let i = 1; i < result.sims.length; i++) {
      expect(result.sims[i]).toBeGreaterThanOrEqual(result.sims[i - 1]);
    }
  });

  it("p50 <= p85 <= p95", () => {
    const result = simulateDuration({
      throughputSamples: [1, 2, 3, 4, 5],
      targetCount: 20,
      numSimulations: 1000
    });
    expect(result.p50).toBeLessThanOrEqual(result.p85);
    expect(result.p85).toBeLessThanOrEqual(result.p95);
  });

  it("produces deterministic results for a fixed-throughput dataset", () => {
    // Throughput always 5, target 10 → always takes exactly 2 days
    const result = simulateDuration({
      throughputSamples: [5],
      targetCount: 10,
      numSimulations: 100
    });
    expect(result.p50).toBe(2);
    expect(result.p95).toBe(2);
  });

  it("always produces at least 1 day per simulation", () => {
    const result = simulateDuration({
      throughputSamples: [100],
      targetCount: 1,
      numSimulations: 50
    });
    expect(result.sims.every((v) => v >= 1)).toBe(true);
  });
});
