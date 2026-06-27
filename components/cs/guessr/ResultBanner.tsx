import { nationToFlag } from "@/lib/more-or-lessr/flags";
import type { Player } from "@/lib/guessr/types";

type Props = {
  target: Player;
  attempts: number;
  onReplay: () => void;
};

export default function ResultBanner({ target, attempts, onReplay }: Props) {
  return (
    <div className="mt-6 w-full max-w-md rounded-xl border border-emerald-500/40 bg-emerald-600/10 p-5 text-center">
      <p className="text-xs tracking-[0.2em] text-emerald-400 uppercase">
        Trouvé en {attempts} essai{attempts > 1 ? "s" : ""}
      </p>
      <h2 className="cs2-display mt-1 text-3xl font-extrabold uppercase italic">
        {nationToFlag(target.nationality)} {target.name}
      </h2>
      <p className="mt-1 text-sm text-[color:var(--muted)]">
        {target.current_team} · {target.role.join(" / ")}
      </p>
      {target.achievements.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm">
          {target.achievements.map((a) => (
            <li key={a}>🏆 {a}</li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={onReplay}
        className="mt-4 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold tracking-widest uppercase hover:bg-white/10"
      >
        Rejouer
      </button>
    </div>
  );
}
