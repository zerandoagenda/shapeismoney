import { describe, expect, test } from "bun:test";
import { adherencePercent, changeFromFirst, readPerformance } from "../src/lib/performance-insights";

describe("performance insights", () => {
  test("classifica adesão de 2 em 4 treinos como ponto de atenção", () => {
    const adherence = adherencePercent(2, 4);
    expect(adherence).toBe(50);
    expect(readPerformance({ adherence, energy: 4, sleep: 4, stress: 2, pain: 1 }).label).toBe("Precisa de atenção");
  });

  test("considera evolução apenas com pelo menos dois sinais fortes", () => {
    expect(readPerformance({ adherence: 100, energy: 4, sleep: 4, stress: 2, pain: 1 }).label).toBe("Em evolução");
  });

  test("calcula a mudança entre a primeira e a última leitura", () => {
    expect(changeFromFirst([62, 67, 74])).toBe(12);
    expect(changeFromFirst([74])).toBeNull();
  });
});