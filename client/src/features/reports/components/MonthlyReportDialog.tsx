import {useMemo, useState} from "react";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Checkbox} from "@/components/ui/checkbox";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Badge} from "@/components/ui/badge";
import type {EnrichedAttendanceDto, SessionDto} from "@/types/api";
import {useMembers} from "@/features/members/hooks/useMembers";
import {fetchEnrichedAttendance} from "@/api/sessions";
import {exportMonthlyReportExcel} from "../lib/export";
import {formatDateShort} from "@/lib/date";
import {CalendarDays, FileSpreadsheet, Loader2} from "lucide-react";
import {toast} from "sonner";

interface MonthlyReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: SessionDto[] | undefined;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function MonthlyReportDialog({ open, onOpenChange, sessions }: MonthlyReportDialogProps) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth.toString());
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [excludedSessionIds, setExcludedSessionIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const { members } = useMembers();

  // Extract available years from sessions or default to current year
  const availableYears = useMemo(() => {
    if (!sessions?.length) return [currentYear];
    const years = new Set(sessions.map(s => new Date(s.startedAt ?? s.createdAt).getFullYear()));
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [sessions, currentYear]);

  // Filter sessions by selected month and year
  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    return sessions.filter(s => {
      const date = new Date(s.startedAt ?? s.createdAt);
      return date.getMonth().toString() === selectedMonth && date.getFullYear().toString() === selectedYear;
    }).sort((a, b) => new Date(a.startedAt ?? a.createdAt).getTime() - new Date(b.startedAt ?? b.createdAt).getTime());
  }, [sessions, selectedMonth, selectedYear]);

  const selectedSessionIds = useMemo(() => {
    return new Set(filteredSessions.filter(s => !excludedSessionIds.has(s.id)).map(s => s.id));
  }, [excludedSessionIds, filteredSessions]);

  const handleToggleSession = (id: string, checked: boolean) => {
    setExcludedSessionIds(prev => {
      const next = new Set(prev);
      if (checked) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedCount = selectedSessionIds.size;
  const hasSessionsForPeriod = filteredSessions.length > 0;
  const allVisibleSelected = hasSessionsForPeriod && selectedCount === filteredSessions.length;
  const selectedMonthLabel = `${MONTHS[parseInt(selectedMonth, 10)]} ${selectedYear}`;
  const reportSummary = hasSessionsForPeriod
    ? `${selectedCount} of ${filteredSessions.length} sessions selected`
    : "No sessions available";

  const handleExport = async () => {
    if (!members) {
      toast.error("Members data not loaded yet.");
      return;
    }

    const sessionsToExport = filteredSessions.filter(s => selectedSessionIds.has(s.id));
    if (sessionsToExport.length === 0) {
      toast.error("Please select at least one session to export.");
      return;
    }

    try {
      setIsExporting(true);
      
      // Fetch attendance for all selected sessions in parallel
      const attendancesData: Record<string, EnrichedAttendanceDto[]> = {};
      await Promise.all(
        sessionsToExport.map(async (session) => {
          attendancesData[session.id] = await fetchEnrichedAttendance(session.id);
        })
      );

      await exportMonthlyReportExcel(selectedMonthLabel, members, sessionsToExport, attendancesData);
      
      toast.success("Monthly report exported successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader>
          <div className="border-b px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <DialogTitle>Export Monthly Report</DialogTitle>
                <DialogDescription>
                  Build an Excel attendance report from the sessions in a selected month.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="monthly-report-month">Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger id="monthly-report-month" className="w-full">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly-report-year">Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger id="monthly-report-year" className="w-full">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border bg-card">
            <div className="flex flex-col gap-3 border-b bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label>Sessions to include</Label>
                  {hasSessionsForPeriod ? (
                    <Badge variant={allVisibleSelected ? "default" : "secondary"}>{reportSummary}</Badge>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose exactly which sessions should be included in the Excel workbook.
                </p>
              </div>
            </div>
            <div>
              <ScrollArea className="h-[280px]">
                {filteredSessions.length === 0 ? (
                  <div className="flex h-[240px] flex-col items-center justify-center px-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-foreground">No sessions found</p>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                      Try another month or year to find sessions that can be exported.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredSessions.map(session => (
                      <label
                        key={session.id}
                        htmlFor={`monthly-report-session-${session.id}`}
                        className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                      >
                        <Checkbox
                          id={`monthly-report-session-${session.id}`}
                          className="mt-1"
                          checked={selectedSessionIds.has(session.id)}
                          onCheckedChange={(checked) => handleToggleSession(session.id, checked as boolean)}
                          disabled={isExporting}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <span className="truncate text-sm font-medium text-foreground">{session.name}</span>
                            <span className="text-xs font-medium text-muted-foreground">
                              {formatDateShort(session.startedAt ?? session.createdAt)}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {session.isActive ? (
                              <Badge variant="secondary" className="rounded-md">Live</Badge>
                            ) : null}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={!hasSessionsForPeriod || selectedCount === 0 || isExporting}>
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <></>}
            Export {selectedCount > 0 ? `${selectedCount} ` : ""}to Excel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
