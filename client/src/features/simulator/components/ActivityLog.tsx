import { ScrollArea } from "@/components/ui/scroll-area";
import { formatTime } from "@/lib/date";

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: "request" | "response";
  action: string;
  detail: string;
}

interface ActivityLogProps {
  entries: LogEntry[];
}

export function ActivityLog({ entries }: ActivityLogProps) {
  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-125 text-sm text-muted-foreground">
        Activity will appear here after sending requests.
      </div>
    );
  }

  return (
    <ScrollArea className="h-125">
      <div className="space-y-2 pr-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`rounded-md border px-3 py-2 text-sm ${
              entry.type === "request" ? "border-blue-500/30 bg-blue-500/5" : "border-emerald-500/30 bg-emerald-500/5"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-muted-foreground">{formatTime(entry.timestamp)}</span>
              <span className={`text-xs font-medium uppercase ${entry.type === "request" ? "text-blue-500" : "text-emerald-500"}`}>
                {entry.type}
              </span>
              <span className="text-xs font-medium">{entry.action}</span>
            </div>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all font-mono">{entry.detail}</pre>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
