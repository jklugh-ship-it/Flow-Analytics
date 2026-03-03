import { describe, it, expect } from "vitest";
import { normalizeVisibility } from "../src/utils/workflow/normalizeVisibility";

describe("normalizeVisibility", () => {
  it("adds missing states with default visibility true", () => {
    const prev = { A: false };
    const states = ["A", "B"];

    expect(normalizeVisibility(prev, states)).toEqual({
      A: false,
      B: true
    });
  });

  it("removes visibility entries for deleted states", () => {
    const prev = { A: true, B: false };
    const states = ["A"];

    expect(normalizeVisibility(prev, states)).toEqual({
      A: true
    });
  });

  it("returns empty object for empty workflow", () => {
    const prev = { A: true };
    const states = [];

    expect(normalizeVisibility(prev, states)).toEqual({});
  });
});