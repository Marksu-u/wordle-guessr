"use client";

import { useMemo, useReducer } from "react";
import GuessGrid from "@/components/cs/guessr/GuessGrid";
import GuessInput from "@/components/cs/guessr/GuessInput";
import ResultBanner from "@/components/cs/guessr/ResultBanner";
import type { GuessrData } from "@/lib/guessr/types";
import { createGuessrReducer, createInitialState } from "./reducer";

export default function GuessrGame({ data }: { data: GuessrData }) {
  const reducer = useMemo(() => createGuessrReducer(data), [data]);
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    createInitialState(data),
  );

  const guessedNames = state.guesses.map((g) => g.player.name);

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-5">
      {state.status === "playing" && (
        <GuessInput
          players={data.players}
          guessedNames={guessedNames}
          onGuess={(name) => dispatch({ type: "GUESS", name })}
        />
      )}

      {state.status === "won" && (
        <ResultBanner
          target={state.target}
          attempts={state.guesses.length}
          onReplay={() => dispatch({ type: "REPLAY" })}
        />
      )}

      <GuessGrid guesses={state.guesses} />
    </div>
  );
}
