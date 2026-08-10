"use client";

import { useEffect, useRef, useState } from "react";
import { formaterDuree, msAvantProchainMot } from "@/lib/daily";

type CountdownProps = {
    //Est appelé quand le compte à rebours atteint 0
    onFin?: () => void;
    className?: string;
};

export default function Countdown({ onFin, className }: CountdownProps) {
    const [restant, setRestant] = useState<number | null>(null);

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