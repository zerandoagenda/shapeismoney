import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { pillarLabels, type PillarKey } from "@/lib/sim-score";
import type { RadarAnalysis } from "@/lib/radar-analysis.server";

const ink = rgb(0.07, 0.065, 0.055);
const ivory = rgb(0.94, 0.91, 0.82);
const gold = rgb(0.66, 0.52, 0.29);
const paper = rgb(0.97, 0.96, 0.92);

function wrap(text: string, max = 84) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = []; let line = "";
  for (const word of words) { const next = `${line} ${word}`.trim(); if (next.length > max && line) { lines.push(line); line = word; } else line = next; }
  if (line) lines.push(line); return lines;
}

export async function buildRadarPdf(input: { name: string; date: string; score: Record<PillarKey, number> & { total: number }; analysis: RadarAnalysis; responses: Array<{ question: string; answer: number; low: string; high: string }> }) {
  const doc = await PDFDocument.create();
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const serifBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const addPage = (dark = false) => { const page = doc.addPage([595, 842]); page.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: dark ? ink : paper }); return page; };
  const title = (page: any, text: string, y: number, dark = false, size = 28) => page.drawText(text, { x: 48, y, size, font: serifBold, color: dark ? ivory : ink });
  const paragraph = (page: any, text: string, y: number, dark = false, max = 82) => { let cursor = y; for (const line of wrap(text, max)) { page.drawText(line, { x: 48, y: cursor, size: 10.5, font: sans, color: dark ? ivory : ink }); cursor -= 16; } return cursor; };

  let page = addPage(true);
  page.drawText("SHAPE IS MONEY", { x: 48, y: 772, size: 12, font: sans, color: gold });
  title(page, "RADAR DA PERFORMANCE", 610, true, 34);
  title(page, input.name.toUpperCase(), 562, true, 22);
  page.drawText("SIM PERFORMANCE SCORE", { x: 48, y: 392, size: 10, font: sans, color: gold });
  page.drawText(`${input.score.total} / 100`, { x: 48, y: 328, size: 54, font: serifBold, color: ivory });
  page.drawText(input.date, { x: 48, y: 64, size: 9, font: sans, color: ivory });

  page = addPage(); title(page, "SEU RADAR", 764);
  const keys = Object.keys(pillarLabels) as PillarKey[];
  keys.forEach((key, index) => { const y = 690 - index * 92; page.drawText(pillarLabels[key].toUpperCase(), { x: 48, y, size: 10, font: sans, color: gold }); page.drawRectangle({ x: 48, y: y - 26, width: 440, height: 7, color: rgb(.84,.82,.76) }); page.drawRectangle({ x: 48, y: y - 26, width: 4.4 * input.score[key], height: 7, color: gold }); page.drawText(String(input.score[key]), { x: 505, y: y - 28, size: 13, font: serifBold, color: ink }); });

  page = addPage(); title(page, "LEITURA EXECUTIVA", 764);
  let y = paragraph(page, input.analysis.executive_summary, 718);
  y -= 28; page.drawText("PRINCIPAL ATIVO", { x: 48, y, size: 9, font: sans, color: gold }); y = paragraph(page, `${input.analysis.primary_strength.title}. ${input.analysis.primary_strength.explanation}`, y - 24);
  y -= 22; page.drawText("PRINCIPAL GARGALO", { x: 48, y, size: 9, font: sans, color: gold }); y = paragraph(page, `${input.analysis.primary_bottleneck.title}. ${input.analysis.primary_bottleneck.explanation}`, y - 24);
  y -= 22; page.drawText("PRIORIDADE", { x: 48, y, size: 9, font: sans, color: gold }); paragraph(page, input.analysis.priority, y - 24);

  for (const key of keys) { page = addPage(); title(page, pillarLabels[key].toUpperCase(), 764); page.drawText(`${input.score[key]} / 100`, { x: 48, y: 704, size: 34, font: serifBold, color: gold }); const analysisKey = `${key}_analysis` as keyof RadarAnalysis; paragraph(page, String(input.analysis[analysisKey]), 650); }

  page = addPage(); title(page, "RESPOSTAS DO RADAR", 764); y = 720;
  for (const [index, item] of input.responses.entries()) { if (y < 100) { page = addPage(); title(page, "RESPOSTAS DO RADAR", 764); y = 720; } page.drawText(`${String(index + 1).padStart(2, "0")}  ${item.question}`, { x: 48, y, size: 9, font: sans, color: ink, maxWidth: 495 }); y -= 24; page.drawText(`${item.answer}/5 — ${item.answer === 1 ? item.low : item.answer === 5 ? item.high : "posição intermediária"}`, { x: 48, y, size: 9, font: sans, color: gold }); y -= 34; }

  page = addPage(true); title(page, "SEU PRÓXIMO MOVIMENTO", 700, true); paragraph(page, input.analysis.next_movement, 640, true); page.drawText("Shape Is Money", { x: 48, y: 110, size: 22, font: serif, color: gold }); page.drawText("O corpo é o primeiro ativo de reputação.", { x: 48, y: 80, size: 10, font: sans, color: ivory });
  return doc.save();
}
