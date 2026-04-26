import { useState } from "react";
import { Plus, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ScannerCard } from "./components/ScannerCard";
import { CreateScannerDialog } from "./components/CreateScannerDialog";
import { MachineKeyDialog } from "./components/MachineKeyDialog";
import { useScanners, useCreateScanner, useDeleteScanner, useUpdateScanner } from "./hooks/useScanners";
import type { MachineDto } from "@/types/api";
import type { CreateScannerFormValues } from "@/lib/schemas/scanner";

export function ScannersPage() {
  const { scanners, isError, error, refetch } = useScanners();
  const createScanner = useCreateScanner();
  const deleteScanner = useDeleteScanner();
  const updateScanner = useUpdateScanner();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingScanner, setEditingScanner] = useState<MachineDto | null>(null);
  const [deletingScanner, setDeletingScanner] = useState<MachineDto | null>(null);
  const [createdKey, setCreatedKey] = useState<{ id: string; key: string; name: string } | null>(null);

  const handleCreate = async (values: CreateScannerFormValues) => {
    const result = await createScanner.mutateAsync(values);
    setCreateOpen(false);
    setCreatedKey({ id: result.id, key: result.machineKey, name: result.name });
  };

  const handleUpdate = async (values: CreateScannerFormValues) => {
    if (!editingScanner) return;
    await updateScanner.mutateAsync({ id: editingScanner.id, data: values });
    setEditingScanner(null);
  };

  const handleDelete = async () => {
    if (!deletingScanner) return;
    await deleteScanner.mutateAsync(deletingScanner.id);
    setDeletingScanner(null);
  };

  return (
    <>
      <PageHeader
        title="Scanners"
        description="Manage scanner machines"
        action={
          <Button onClick={() => setCreateOpen(true)} id="create-scanner-btn">
            <Plus className="mr-2 h-4 w-4" />
            Create Scanner
          </Button>
        }
      />

      {isError && <ErrorState message={error?.message} onRetry={refetch} />}
      {scanners && scanners.length === 0 && (
        <EmptyState icon={<Radio className="h-10 w-10" />} title="No scanners" description="Create a scanner to get started." />
      )}
      {scanners && scanners.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {scanners.map((scanner) => (
            <ScannerCard
              key={scanner.id}
              scanner={scanner}
              onEdit={setEditingScanner}
              onDelete={setDeletingScanner}
            />
          ))}
        </div>
      )}

      <CreateScannerDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        isPending={createScanner.isPending}
      />

      <CreateScannerDialog
        open={!!editingScanner}
        onOpenChange={(open) => !open && setEditingScanner(null)}
        onSubmit={handleUpdate}
        isPending={updateScanner.isPending}
        initialValues={editingScanner ? { name: editingScanner.name } : undefined}
        mode="edit"
      />

      {createdKey && (
        <MachineKeyDialog
          open={!!createdKey}
          onOpenChange={(open) => !open && setCreatedKey(null)}
          machineId={createdKey.id}
          machineKey={createdKey.key}
          machineName={createdKey.name}
        />
      )}

      <ConfirmDialog
        open={!!deletingScanner}
        onOpenChange={(open) => !open && setDeletingScanner(null)}
        title="Delete Scanner"
        description={`Are you sure you want to delete "${deletingScanner?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteScanner.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
