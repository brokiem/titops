import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createScannerSchema } from "@/lib/schemas/scanner";
import type { CreateScannerFormValues } from "@/lib/schemas/scanner";
import { useEffect } from "react";

interface CreateScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateScannerFormValues) => Promise<void>;
  isPending: boolean;
  initialValues?: CreateScannerFormValues;
  mode?: "create" | "edit";
}

export function CreateScannerDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  initialValues,
  mode = "create",
}: CreateScannerDialogProps) {
  const form = useForm<CreateScannerFormValues>({
    resolver: zodResolver(createScannerSchema),
    defaultValues: initialValues || { name: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset(initialValues || { name: "" });
    }
  }, [open, form, initialValues]);

  const handleSubmit = async (values: CreateScannerFormValues) => {
    await onSubmit(values);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Scanner" : "Edit Scanner"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new scanner machine to your system."
              : "Update the name of this scanner."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scanner-name">Scanner Name</Label>
            <Input id="scanner-name" {...form.register("name")} placeholder="e.g. Main Entrance" />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (mode === "create" ? "Creating…" : "Updating…") : mode === "create" ? "Create" : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
