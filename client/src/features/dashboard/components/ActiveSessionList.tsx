import { Link } from "react-router-dom";
import { Activity, ArrowRight } from "lucide-react";
import { useActiveSessions } from "../hooks/useSessions";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button.tsx";

export function ActiveSessionList() {
  const { activeSession, isLoading, isError, error, refetch } = useActiveSessions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" />
          Active Session
        </CardTitle>
        <CardDescription>View the current active session and manage it.</CardDescription>
      </CardHeader>
      <CardContent>
        {isError && <ErrorState message={error?.message} onRetry={refetch} />}
        {activeSession === null && !isLoading && !isError && (
          <EmptyState title="No active session" description="Create a session to get started." />
        )}
        {activeSession && (
          <div className="rounded-xl border bg-muted/20 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold tracking-tight">{activeSession.name}</h3>
                    <Badge variant={activeSession.mode === "IDLE" ? "secondary" : "default"}>
                      {activeSession.mode.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This is the only session currently available for live attendance operations.
                  </p>
                </div>
              </div>
              <Button asChild className="sm:w-fit">
                <Link to={`/dashboard/session/${activeSession.id}`}>
                  Open Session
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}