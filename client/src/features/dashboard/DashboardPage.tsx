import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Radio, FileBarChart, Cpu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { ActionCard } from "./components/ActionCard";
import { ActiveSessionList } from "./components/ActiveSessionList";
import { CreateSessionDialog } from "./components/CreateSessionDialog";
import { useActiveSessions, useCreateSession } from "./hooks/useSessions";

export function DashboardPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const createSession = useCreateSession();
  const { activeSession } = useActiveSessions();
  const navigate = useNavigate();

  const handleCreate = async (values: { name: string }) => {
    const session = await createSession.mutateAsync(values);
    setCreateOpen(false);
    navigate(`/dashboard/session/${session.id}`);
  };

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview and quick actions"
        action={
          <Button
            onClick={() => setCreateOpen(true)}
            id="create-session-btn"
            disabled={createSession.isPending || !!activeSession}
          >
            <Plus className="h-4 w-4" />
            Create Session
          </Button>
        }
      />
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ActionCard to="/dashboard/members" icon={Users} title="Members" description="Manage members and cards" />
        <ActionCard to="/dashboard/scanners" icon={Radio} title="Scanners" description="View scanner status" />
        <ActionCard to="/dashboard/reports" icon={FileBarChart} title="Reports" description="View session reports" />
        <ActionCard to="/dashboard/scanner-simulator" icon={Cpu} title="Simulator" description="Test scanner operations" />
      </section>
      <ActiveSessionList />

      <CreateSessionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        isPending={createSession.isPending}
      />
    </>
  );
}
