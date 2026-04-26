import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import type { ScanRequestDto } from "@/types/api";
import { AssignCardDialog } from "./AssignCardDialog";

interface UnknownCardAlertProps {
  scans: ScanRequestDto[] | undefined;
}

export function UnknownCardAlert({ scans }: UnknownCardAlertProps) {
  const [dismissed, setDismissed] = useState(false);
  const [assigningCardUid, setAssigningCardUid] = useState<string | null>(null);

  if (dismissed || !scans || scans.length === 0) return null;

  const uniqueCards = [...new Set(scans.map((s) => s.cardUid))];

  return (
    <>
      <Alert variant="destructive" className="mb-4 relative">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Unknown Cards Detected</AlertTitle>
        <AlertDescription>
          <ul className="mt-2 space-y-1">
            {uniqueCards.map((uid) => (
              <li key={uid} className="flex items-center gap-2">
                <code className="text-xs font-mono">{uid}</code>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setAssigningCardUid(uid)}>
                  Assign Card
                </Button>
              </li>
            ))}
          </ul>
        </AlertDescription>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss unknown card alert"
        >
          <X className="h-3 w-3" />
        </Button>
      </Alert>

      <AssignCardDialog
        open={!!assigningCardUid}
        onOpenChange={(open) => !open && setAssigningCardUid(null)}
        cardUid={assigningCardUid ?? ""}
      />
    </>
  );
}
