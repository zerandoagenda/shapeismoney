import { describe, expect, test } from "bun:test";
import { dayGreeting, prioritizeToday, type TodayAction } from "../src/lib/today-first";

const action = (title: string, scheduledMinutes: number, completed = false): TodayAction => ({ kind: "training", title, detail: "", completed, scheduledMinutes, to: "/training" });

describe("Today First", () => {
  test("mostra primeiro a próxima ação incompleta do dia", () => {
    const result = prioritizeToday([action("manhã", 480), action("treino", 1230), action("check", 1350)], new Date("2026-10-04T20:00:00"));
    expect(result.map(item => item.title)).toEqual(["treino", "check", "manhã"]);
  });

  test("ações concluídas retraem para o fim", () => {
    const result = prioritizeToday([action("treino", 1230, true), action("check", 1350)], new Date("2026-10-04T20:00:00"));
    expect(result[0]?.title).toBe("check");
  });

  test("saudação acompanha o período real", () => {
    expect(dayGreeting(new Date("2026-10-04T23:00:00"))).toBe("Boa noite");
  });
});
