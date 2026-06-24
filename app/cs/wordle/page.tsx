import Link from "next/link";

export default function CsWordlePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-20 text-center">
      <p className="mb-3 text-xs tracking-[0.25em] text-[color:var(--accent)] uppercase">
        Counter-Strike 2 · Wordle
      </p>
      <h1 className="cs2-display text-foreground text-5xl font-extrabold uppercase italic">
        Bientôt disponible
      </h1>
      <p className="mt-4 max-w-md text-sm text-[color:var(--muted)]">
        Le mode Wordle CS2 arrive bientôt. Reviens vite !
      </p>
      <Link
        href="/cs"
        className="mt-8 inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-[color:var(--accent-hot)] uppercase"
      >
        &larr; Retour au hub
      </Link>
    </main>
  );
}
