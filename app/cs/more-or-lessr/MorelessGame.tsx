"use client";

import { useEffect, useMemo, useReducer } from "react";
import CategorySelect from "@/components/cs/more-or-lessr/CategorySelect";
import ChainBoard from "@/components/cs/more-or-lessr/ChainBoard";
import ResultBanner from "@/components/cs/more-or-lessr/ResultBanner";
import type { MorelessData } from "@/lib/more-or-lessr/types";
import { createInitialState, createMorelessReducer } from "./reducer";

const REVEAL_MS = 1400; // temps d'affichage du résultat avant le round suivant

export default function MorelessGame({ data }: { data: MorelessData }) {
  // Reducer mémoïsé : créé une fois côté client (fige la date du jour pour la session).
  const reducer = useMemo(() => createMorelessReducer(data), [data]);
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  // Après un choix (status "revealed"), on laisse voir le résultat puis on avance.
  useEffect(() => {
    if (state.status !== "revealed") return;
    const id = setTimeout(() => dispatch({ type: "NEXT" }), REVEAL_MS);
    return () => clearTimeout(id);
  }, [state.status, state.round]);

  if (state.status === "select") {
    return (
      <CategorySelect
        onSelect={(category) => dispatch({ type: "START", category })}
      />
    );
  }

  if (state.status === "finished") {
    return (
      <ResultBanner
        score={state.score}
        onReplay={() => dispatch({ type: "REPLAY" })}
        onChangeCategory={() =>
          dispatch({
            type: "START",
            category: state.category === "rating" ? "prize" : "rating",
          })
        }
      />
    );
  }

  // playing | revealed : anchor & challenger sont garantis non-nuls.
  return (
    <ChainBoard
      anchor={state.anchor!}
      challenger={state.challenger!}
      category={state.category!}
      round={state.round}
      score={state.score}
      revealed={state.status === "revealed"}
      lastGuess={state.lastGuess}
      lastCorrect={state.lastCorrect}
      onGuess={(direction) => dispatch({ type: "GUESS", direction })}
    />
  );
}
