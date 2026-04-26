import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2, Edit2, Activity, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { MachineDto } from "@/types/api";
import { formatRelativeTime } from "@/lib/date";
import { cn } from "@/lib/utils";

interface ScannerCardProps {
  scanner: MachineDto;
  onEdit: (scanner: MachineDto) => void;
  onDelete: (scanner: MachineDto) => void;
}

function isOnline(lastHeartbeatAt: Date | string | null): boolean {
  if (!lastHeartbeatAt) return false;
  const lastPing = typeof lastHeartbeatAt === "string" ? new Date(lastHeartbeatAt) : lastHeartbeatAt;
  return Date.now() - lastPing.getTime() < 60_000;
}

export function ScannerCard({ scanner, onEdit, onDelete }: ScannerCardProps) {
  const online = isOnline(scanner.lastHeartbeatAt);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md gap-3!">
      <CardHeader className="pb-0!">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold leading-none flex items-center gap-2">
              {scanner.name}
            </CardTitle>
            <CardDescription className="font-mono text-[10px] uppercase tracking-wider flex items-center gap-1">
              {scanner.id}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(scanner)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit name</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(scanner)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete scanner</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={online ? "default" : "secondary"}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5",
              online ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20" : ""
            )}
          >
            <Activity className="h-3 w-3" />
            {online ? "Active" : "Inactive"}
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground gap-1.5 ml-auto">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {scanner.lastHeartbeatAt
                ? `Seen ${formatRelativeTime(scanner.lastHeartbeatAt).toLowerCase()}`
                : "Never seen"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
