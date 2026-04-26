import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";

interface MachineKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machineId: string;
  machineKey: string;
  machineName: string;
}

export function MachineKeyDialog({ open, onOpenChange, machineId, machineKey, machineName }: MachineKeyDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(machineKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scanner Created: {machineName}</DialogTitle>
          <DialogDescription>
            Copy this machine key now. It will not be shown again after you close this dialog.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Machine ID</Label>
            <Input value={machineId} readOnly className="font-mono text-xs bg-muted" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="machine-key">Machine Key</Label>
            <div className="flex gap-2">
              <Input id="machine-key" value={machineKey} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy machine key">
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
