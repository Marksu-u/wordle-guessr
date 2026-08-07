"use client";

import { useEffect, useRef, useState } from "react";
import { formaterDuree, msAvantProchainMot } from "@/lib/daily";

type CountdownProps = {
  /** Appelé quand le compte à rebours atteint zéro (nouveau mot disponible). */
  onFin?: () => void;
  className?: string;
};

/** Compte à rebours jusqu'au prochain mot du jour. */
export default function Countdown({ onFin, className }: CountdownProps) {
  // `null` au premier rendu : le serveur ne connaît pas l'heure du client, on
  // évite ainsi une erreur d'hydratation.
  const [restant, setRestant] = useState<number | null>(null);

  // La callback change à chaque rendu du parent : on la garde dans une ref
  // pour ne pas relancer le setInterval toutes les secondes.
  const onFinRef = useRef(onFin);
  useEffect(() => {
    onFinRef.current = onFin;
  });

  useEffect(() => {
    let dejaNotifie = false;

    const tic = () => {
      const ms = msAvantProchainMot();
      setRestant(ms);
      if (ms <= 0 && !dejaNotifie) {
        dejaNotifie = true;
        onFinRef.current?.();
      }
    };

    tic();
    const timer = setInterval(tic, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className={className}>
      {restant === null ? "--:--:--" : formaterDuree(restant)}
    </span>
  );
}
