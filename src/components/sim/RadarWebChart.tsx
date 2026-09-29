import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { pillarLabels, type PillarKey } from "@/lib/sim-score";

export function RadarWebChart({ scores }: { scores: Record<PillarKey, number> }) {
  const data = (Object.keys(pillarLabels) as PillarKey[]).map((key) => ({ pillar: pillarLabels[key], score: scores[key], fullMark: 100 }));
  return <div className="aspect-square min-h-72 w-full" role="img" aria-label={`Gráfico radar: ${data.map(item => `${item.pillar} ${item.score}`).join(", ")}`}><ResponsiveContainer width="100%" height="100%"><RadarChart data={data} outerRadius="72%"><PolarGrid stroke="var(--border)"/><PolarAngleAxis dataKey="pillar" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}/><Radar dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.22} strokeWidth={2}/></RadarChart></ResponsiveContainer></div>;
}