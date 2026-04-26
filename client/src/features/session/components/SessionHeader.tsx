import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SessionDto } from "@/types/api";
import { formatDate } from "@/lib/date";

interface SessionHeaderProps {
  session: SessionDto;
  attendanceCount: number;
  onToggleMode: () => void;
  onClose: () => void;
  modeLoading: boolean;
}

export function SessionHeader({ session, attendanceCount, onToggleMode, onClose, modeLoading }: SessionHeaderProps) {
  const modeColors: Record<string, string> = {
    IDLE: "",
    CLOCK_IN: "bg-emerald-600 hover:bg-emerald-700",
    CLOCK_OUT: "bg-amber-600 hover:bg-amber-700",
    CLOSED: "bg-muted text-muted-foreground",
  };

  const nextMode = session.mode === "CLOCK_IN" ? "CLOCK_OUT" : "CLOCK_IN";

  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{session.name}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge className={modeColors[session.mode]}>{session.mode.replace("_", " ")}</Badge>
          <span>Started: {formatDate(session.startedAt)}</span>
          <span>·</span>
          <span>{attendanceCount} attendance record{attendanceCount !== 1 ? "s" : ""}</span>
        </div>
      </div>
      {session.isActive && (
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onToggleMode} disabled={modeLoading}>
            Switch to {nextMode.replace("_", " ")}
          </Button>
          <Button variant="destructive" onClick={onClose}>
            Close Session
          </Button>
        </div>
      )}
    </section>
  );
}
