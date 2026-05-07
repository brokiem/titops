import {useEffect, useState} from "react";

interface LiveIndicatorProps {
    intervalMs: number;
    className?: string;
}

export function LiveIndicator({intervalMs, className}: LiveIndicatorProps) {
    const totalSeconds = Math.round(intervalMs / 1000);
    const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

    // Countdown timer
    useEffect(() => {
        setSecondsLeft(totalSeconds);

        const timer = setInterval(() => {
            setSecondsLeft((prev) => (prev <= 1 ? totalSeconds : prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [totalSeconds]);

    return (
        <div className={`flex items-center gap-2 ${className ?? ""}`} id="live-indicator">
      <span className="tabular-nums text-muted-foreground/70 select-none whitespace-nowrap">
        {secondsLeft}s
      </span>
        </div>
    );
}
