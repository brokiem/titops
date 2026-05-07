import {useState} from "react";
import {FileBarChart, Loader2} from "lucide-react";
import {PageHeader} from "@/components/PageHeader";
import {EmptyState} from "@/components/EmptyState";
import {ErrorState} from "@/components/ErrorState";
import {ConfirmDialog} from "@/components/ConfirmDialog";
import {ReportsTable} from "./components/ReportsTable";
import {ReportsTableSkeleton} from "./components/ReportsTableSkeleton";
import {MonthlyReportDialog} from "./components/MonthlyReportDialog";
import {useAllSessions, useDeleteSession} from "./hooks/useReports";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Download} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Select, SelectTrigger, SelectContent, SelectItem, SelectValue} from "@/components/ui/select";
import {useDebounce} from "@/hooks/use-debounce";
import type {SessionDto} from "@/types/api";

export function ReportsPage() {
    const {sessions, isLoading, isError, error, refetch} = useAllSessions();
    const deleteSession = useDeleteSession();

    const [sessionToDelete, setSessionToDelete] = useState<SessionDto | null>(null);
    const [isMonthlyDialogOpen, setIsMonthlyDialogOpen] = useState(false);

    // Filtering state
    const MONTHS = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const [nameFilter, setNameFilter] = useState("");
    const debouncedName = useDebounce(nameFilter, 250);
    const [monthFilter, setMonthFilter] = useState<string>("all");
    const [yearFilter, setYearFilter] = useState<string>("all");

    const availableYears = Array.from(new Set((sessions ?? []).map((s) => new Date(s.startedAt ?? s.createdAt).getFullYear()))).sort((a, b) => b - a);

    const filteredSessions = (sessions ?? []).filter((s) => {
        const d = new Date(s.startedAt ?? s.createdAt);

        if (monthFilter !== "all" && d.getMonth().toString() !== monthFilter) return false;
        if (yearFilter !== "all" && d.getFullYear().toString() !== yearFilter) return false;

        if (debouncedName) {
            const q = debouncedName.trim().toLowerCase();
            if (!s.name?.toLowerCase().includes(q)) return false;
        }

        return true;
    });

    const sortedFilteredSessions = [...filteredSessions].sort((a, b) => {
        const dateA = new Date(a.startedAt ?? a.createdAt).getTime();
        const dateB = new Date(b.startedAt ?? b.createdAt).getTime();
        return dateB - dateA;
    });

    const resetFilters = () => {
        setNameFilter("");
        setMonthFilter("all");
        setYearFilter("all");
    };

    const handleDelete = async () => {
        if (!sessionToDelete) return;
        await deleteSession.mutateAsync(sessionToDelete.id);
        setSessionToDelete(null);
    };

    return (
        <>
            <PageHeader
                title="Reports"
                description="Review session history and open detailed attendance exports."
                action={
                    <Button onClick={() => setIsMonthlyDialogOpen(true)}>
                        <Download className="mr-2 h-4 w-4"/>
                        Monthly Report
                    </Button>
                }
            />

            {isError && <ErrorState message={error?.message} onRetry={refetch}/>}

            <Card className="gap-0 overflow-hidden border-border/70 bg-card/95 shadow-sm py-0 mb-4">
                <div className="border-b px-6 py-4">
                    <div className="grid gap-3 sm:grid-cols-[1fr_160px_120px_auto] items-end">
                        <div className="relative max-w-md">
                            <Input
                                id="reports-filter-name"
                                className="w-full pr-9"
                                placeholder="Filter by session name"
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                            />
                            {nameFilter !== debouncedName && nameFilter.length > 0 && (
                                <Loader2 className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 animate-spin text-muted-foreground"/>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Select value={monthFilter} onValueChange={setMonthFilter}>
                                <SelectTrigger id="reports-filter-month" className="w-full">
                                    <SelectValue placeholder="All months"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All months</SelectItem>
                                    {MONTHS.map((m, idx) => (
                                        <SelectItem key={m} value={idx.toString()}>
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Select value={yearFilter} onValueChange={setYearFilter}>
                                <SelectTrigger id="reports-filter-year" className="w-full">
                                    <SelectValue placeholder="All years"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All years</SelectItem>
                                    {availableYears.map((y) => (
                                        <SelectItem key={y} value={y.toString()}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <CardContent className="px-0">
                    {isLoading ? (
                        <div className="px-0">
                            <ReportsTableSkeleton/>
                        </div>
                    ) : sessions && sessions.length === 0 ? (
                        <div className="p-6">
                            <EmptyState
                                icon={<FileBarChart className="h-10 w-10"/>}
                                title="No sessions yet"
                                description="Session reports will appear here after sessions are created."
                            />
                        </div>
                    ) : sortedFilteredSessions.length === 0 ? (
                        <div className="p-6">
                            <EmptyState
                                icon={<FileBarChart className="h-10 w-10"/>}
                                title="No sessions match your filters"
                                description="Try adjusting or clearing filters to find sessions."
                                action={
                                    <Button variant="outline" onClick={resetFilters}>
                                        Clear filters
                                    </Button>
                                }
                            />
                        </div>
                    ) : (
                        <div className="px-0">
                            <ReportsTable sessions={sortedFilteredSessions} onDelete={setSessionToDelete}/>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ConfirmDialog
                open={!!sessionToDelete}
                onOpenChange={(open) => !open && setSessionToDelete(null)}
                title="Are you absolutely sure?"
                description={`This will permanently delete the session "${sessionToDelete?.name}" and all of its attendance records. This action cannot be undone.`}
                confirmLabel="Delete"
                variant="destructive"
                loading={deleteSession.isPending}
                onConfirm={handleDelete}
            />

            <MonthlyReportDialog
                open={isMonthlyDialogOpen}
                onOpenChange={setIsMonthlyDialogOpen}
                sessions={sessions}
            />
        </>
    );
}
