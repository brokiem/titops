import { useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatRelativeTime } from "@/lib/date";
import { AlertTriangle, ChevronsUpDown, CreditCard, X } from "lucide-react";
import type { ScanRequestDto } from "@/types/api";
import { AssignCardDialog } from "./AssignCardDialog";

interface UnknownCardAlertProps {
  scans: ScanRequestDto[] | undefined;
}

export function UnknownCardAlert({ scans }: UnknownCardAlertProps) {
  const [dismissedSignature, setDismissedSignature] = useState<string | null>(null);
  const [assigningCardUid, setAssigningCardUid] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const unknownCards = useMemo(() => {
    const cards = new Map<string, { cardUid: string; scanCount: number; latestScanAt: Date | string }>();

    for (const scan of scans ?? []) {
      const current = cards.get(scan.cardUid);
      const scanAt = new Date(scan.createdAt).getTime();
      const currentAt = current ? new Date(current.latestScanAt).getTime() : 0;

      cards.set(scan.cardUid, {
        cardUid: scan.cardUid,
        scanCount: (current?.scanCount ?? 0) + 1,
        latestScanAt: scanAt > currentAt ? scan.createdAt : current?.latestScanAt ?? scan.createdAt,
      });
    }

    return Array.from(cards.values()).sort(
      (a, b) => new Date(b.latestScanAt).getTime() - new Date(a.latestScanAt).getTime()
    );
  }, [scans]);

  const scanSignature = useMemo(
    () => unknownCards.map((card) => `${card.cardUid}:${card.scanCount}:${new Date(card.latestScanAt).getTime()}`).join("|"),
    [unknownCards]
  );

  if (unknownCards.length === 0 || dismissedSignature === scanSignature) return null;

  const cardLabel = unknownCards.length === 1 ? "card" : "cards";
  const titleVerb = unknownCards.length === 1 ? "needs" : "need";

  return (
    <>
      <Alert className="mb-4 border-border/70 bg-card/95 pr-20 shadow-sm">
        <AlertTriangle className="text-amber-500 dark:text-amber-400" />
        <AlertTitle className="line-clamp-none flex flex-wrap items-center gap-2 text-sm">
          {unknownCards.length} unknown {cardLabel} {titleVerb} assignment
        </AlertTitle>
        {!collapsed && (
          <AlertDescription className="mt-2 gap-3">
            <p>
              Assign these card UIDs to members so future scans are recorded automatically.
            </p>
            <ScrollArea className="group max-h-56 w-full rounded-md border bg-background/70 **:data-[slot=scroll-area-thumb]:opacity-0 **:data-[slot=scroll-area-thumb]:transition-opacity hover:**:data-[slot=scroll-area-thumb]:opacity-100 focus-within:**:data-[slot=scroll-area-thumb]:opacity-100">
              <div>
                {unknownCards.map((card, index) => (
                  <div key={card.cardUid}>
                    <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <CreditCard className="size-4" />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <code className="block truncate font-mono text-xs font-semibold text-foreground">
                            {card.cardUid}
                          </code>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                            <Badge variant="outline" className="font-normal">
                              {card.scanCount} {card.scanCount === 1 ? "attempt" : "attempts"}
                            </Badge>
                            <span>Last scanned {formatRelativeTime(card.latestScanAt)}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => setAssigningCardUid(card.cardUid)}
                      >
                        <CreditCard />
                        Assign Card
                      </Button>
                    </div>
                    {index < unknownCards.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </AlertDescription>
        )}
        <Button
          variant="ghost"
          size="icon-xs"
          className="absolute right-10 top-3"
          onClick={() => setCollapsed((current) => !current)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand unknown card alert" : "Collapse unknown card alert"}
        >
          <ChevronsUpDown />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          className="absolute right-3 top-3"
          onClick={() => setDismissedSignature(scanSignature)}
          aria-label="Dismiss unknown card alert"
        >
          <X />
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
