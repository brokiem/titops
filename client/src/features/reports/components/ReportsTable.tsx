import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye, FileText, History, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { SessionDto } from "@/types/api";
import { formatDate, formatDateShort, formatRelativeTime } from "@/lib/date";

interface ReportsTableProps {
  sessions: SessionDto[];
  onDelete: (session: SessionDto) => void;
}

export function ReportsTable({ sessions, onDelete }: ReportsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-6">Session</TableHead>
          <TableHead>Recorded</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="pr-6 text-right"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => {
          const sessionDate = session.startedAt ?? session.createdAt;
          const statusLabel = session.isActive ? session.mode.replace("_", " ") : "CLOSED";

          return (
            <TableRow key={session.id} className="group">
              <TableCell className="pl-6 py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="truncate font-semibold text-foreground">{session.name}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{session.isActive ? "Live session" : "Archived report"}</span>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="space-y-1">
                  <div className="font-medium text-foreground">{formatDateShort(sessionDate)}</div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <History className="h-3.5 w-3.5" />
                    <span>{formatRelativeTime(sessionDate)}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="space-y-2">
                  <Badge variant={session.isActive ? "default" : "secondary"}>{statusLabel}</Badge>
                  <div className="text-xs text-muted-foreground">
                    {session.isActive ? `Started ${formatDate(session.startedAt)}` : `Closed ${formatDate(session.closedAt)}`}
                  </div>
                </div>
              </TableCell>
              <TableCell className="pr-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/dashboard/reports/${session.id}`} aria-label={`Open report for ${session.name}`}>
                      <Eye className="h-4 w-4" />
                      View
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" aria-label={`Download options for ${session.name}`}>
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/dashboard/reports/${session.id}?export=csv`}>Download CSV</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/dashboard/reports/${session.id}?export=pdf`}>Download PDF</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(session)}
                    aria-label="Delete Session"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
