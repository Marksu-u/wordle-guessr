import { nationToFlag } from "@/lib/more-or-lessr/flags";
import type { FieldResult, GuessResult, Match } from "@/lib/guessr/types";

// Couleurs par état, alignées sur le thème CS2 (cs2-theme.css).
const MATCH_BG: Record<Match, string> = {
  exact: "bg-emerald-600/25 border-emerald-500/60",
  partial: "bg-amber-500/20 border-amber-500/50",
  miss: "bg-white/5 border-white/10",
};

function arrow(dir: "up" | "down" | "equal"): string {
  return dir === "up" ? " ▲" : dir === "down" ? " ▼" : "";
}

function cellText(field: FieldResult): string {
  if (field.kind === "set")
    return field.value.length ? field.value.join(", ") : "—";
  if (field.kind === "number") return `${field.value}${arrow(field.direction)}`;
  return field.value;
}

function Cell({ field }: { field: FieldResult }) {
  return (
    <div
      className={`flex min-h-[58px] items-center justify-center rounded-lg border px-2 py-1 text-center text-[13px] font-semibold ${MATCH_BG[field.match]}`}
    >
      {cellText(field)}
    </div>
  );
}

export default function GuessRow({ result }: { result: GuessResult }) {
  const p = result.player;
  return (
    <div className="grid grid-cols-[0.85fr_0.95fr_1fr_1.3fr_0.9fr_0.7fr_0.75fr_0.8fr] gap-1.5">
      <div className="flex min-h-[58px] items-center justify-center rounded-lg border border-white/10 bg-white/5 px-2 text-center text-[13px] font-bold">
        {p.name}
      </div>
      <div
        className={`flex min-h-[58px] flex-col items-center justify-center rounded-lg border px-2 text-center text-[13px] font-semibold ${MATCH_BG[result.nationality.match]}`}
      >
        <span className="text-base">{nationToFlag(p.nationality)}</span>
        <span className="text-[11px] opacity-80">{p.nationality}</span>
      </div>
      <Cell field={result.current_team} />
      <Cell field={result.previous_teams} />
      <Cell field={result.role} />
      <Cell field={result.age} />
      <Cell field={result.majors} />
      <Cell field={result.tournaments_won} />
    </div>
  );
}
