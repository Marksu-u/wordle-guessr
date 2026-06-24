"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import Board from "@/components/cs/wordle/Board";
import Keyboard from "@/components/cs/wordle/Keyboard";
import LengthTabs from "@/components/cs/wordle/LengthTabs";
import ResultBanner from "@/components/cs/wordle/ResultBanner";
import { deriveKeyStates } from "@/lib/wordle/engine";
import { availableLengths } from "@/lib/wordle/selection";
import type { WordleData } from "@/lib/wordle/types";
import { createInitialState, createWordleReducer } from "./reducer";

export default function WordleGame({ data }: { data: WordleData }) {
  const lengths = availableLengths(data);
  const defaultLength = lengths.includes(5) ? 5 : lengths[0];
  // Longueur max (8 ici) : sert à dimensionner les tuiles de TOUS les boards de
  // façon homogène (cf. Board), pour que la grille la plus large tienne à l'écran.
  const maxLength = Math.max(...lengths);

  // Reducer mémoïsé (fermé sur `data`, stable). L'init paresseuse tire le mot côté
  // client ; comme la cible n'est jamais rendue, aucun mismatch d'hydratation.
  const reducer = useMemo(() => createWordleReducer(data), [data]);
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    createInitialState(data, defaultLength),
  );
  const board = state.boards[state.activeLength];

  // Highlight de press : on illumine brièvement la touche correspondant au dernier
  // caractère produit (frappe physique OU clic). État purement visuel, hors reducer.
  const [flashKey, setFlashKey] = useState<string | null>(null);
  const flashTimer = useRef<number | null>(null);
  function flash(label: string) {
    setFlashKey(label);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashKey(null), 150);
  }

  // Handlers uniques partagés par le clavier physique et le clavier visuel (DRY) :
  // chaque saisie illumine la touche puis dispatche l'action.
  function input(char: string) {
    flash(char.toUpperCase());
    dispatch({ type: "KEY_INPUT", char });
  }
  function submit() {
    flash("ENTER");
    dispatch({ type: "SUBMIT" });
  }
  function del() {
    flash("DEL");
    dispatch({ type: "DELETE" });
  }

  // Clavier physique : event.key rend le caractère réellement produit, donc la
  // saisie marche quel que soit le layout physique (QWERTY/AZERTY/…). On lie une
  // seule fois ; les handlers n'utilisent que des références stables (dispatch, refs).
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter") submit();
      else if (e.key === "Backspace") del();
      else if (/^[a-zA-Z0-9]$/.test(e.key)) input(e.key);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // `invalid` déclenche le shake ; on le remet à zéro une fois l'animation finie.
  useEffect(() => {
    if (!board.invalid) return;
    const id = setTimeout(() => dispatch({ type: "CLEAR_INVALID" }), 400);
    return () => clearTimeout(id);
  }, [board.invalid]);

  const keyStates = deriveKeyStates(board.guesses, board.evaluations);

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-5">
      <LengthTabs
        lengths={lengths}
        active={state.activeLength}
        onSelect={(length) => dispatch({ type: "SELECT_LENGTH", length })}
      />
      {/* key={activeLength} : remonte le sous-arbre au changement d'onglet, ce qui
          rejoue l'animation d'entrée (transition de tab). */}
      <div
        key={state.activeLength}
        className="flex w-full flex-col items-center gap-5 animate-[wordle-tab_0.25s_ease]"
      >
        <Board board={board} maxLength={maxLength} />
        <ResultBanner board={board} onReplay={() => dispatch({ type: "REPLAY" })} />
      </div>
      <Keyboard keyStates={keyStates} flashKey={flashKey} onKey={input} onEnter={submit} onDelete={del} />
    </div>
  );
}
