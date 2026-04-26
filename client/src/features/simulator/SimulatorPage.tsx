import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/PageHeader";
import { ActivityLog } from "./components/ActivityLog";
import type { LogEntry } from "./components/ActivityLog";
import { useSendPing, useSendScan, useGetScanners } from "./hooks/useSimulator";
import { simulatorScanSchema } from "@/lib/schemas/simulator";
import type { SimulatorScanFormValues } from "@/lib/schemas/simulator";
import { Heart, Scan } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SimulatorPage() {
  const [selectedScannerId, setSelectedScannerId] = useState<string>("custom");
  const [machineId, setMachineId] = useState("");
  const [machineKey, setMachineKey] = useState("");
  const [entries, setEntries] = useState<LogEntry[]>([]);

  const { data: scanners, isLoading: isLoadingScanners } = useGetScanners();
  const sendPing = useSendPing();
  const sendScan = useSendScan();

  const form = useForm<SimulatorScanFormValues>({
    resolver: zodResolver(simulatorScanSchema),
    defaultValues: { cardUid: "" },
  });

  const addEntry = useCallback((entry: Omit<LogEntry, "id" | "timestamp">) => {
    setEntries((prev) => [
      { ...entry, id: crypto.randomUUID(), timestamp: new Date() },
      ...prev,
    ]);
  }, []);

  const handlePing = async () => {
    if (!machineId.trim() || !machineKey.trim()) return;
    addEntry({ type: "request", action: "PING", detail: `POST /api/machines/${machineId}/heartbeat` });
    try {
      const result = await sendPing.mutateAsync({ machineId, machineKey });
      addEntry({ type: "response", action: "PING OK", detail: JSON.stringify(result, null, 2) });
    } catch (err) {
      addEntry({ type: "response", action: "PING ERROR", detail: (err as Error).message });
    }
  };

  const handleScan = async (values: SimulatorScanFormValues) => {
    if (!machineId.trim() || !machineKey.trim()) return;
    const idempotencyKey = crypto.randomUUID();
    addEntry({
      type: "request",
      action: "SCAN",
      detail: `POST /api/machines/${machineId}/scan-requests\n${JSON.stringify({ cardUid: values.cardUid, idempotencyKey }, null, 2)}`,
    });
    try {
      const result = await sendScan.mutateAsync({
        machineId,
        machineKey,
        data: { cardUid: values.cardUid, idempotencyKey },
      });
      addEntry({ type: "response", action: `SCAN → ${result.outcome}`, detail: JSON.stringify(result, null, 2) });
    } catch (err) {
      addEntry({ type: "response", action: "SCAN ERROR", detail: (err as Error).message });
    }
  };

  const handleScannerChange = (value: string) => {
    setSelectedScannerId(value);
    if (value === "custom") {
      setMachineId("");
      setMachineKey("");
    } else {
      setMachineId(value);
      setMachineKey("");
    }
  };

  return (
    <>
      <PageHeader title="Scanner Simulator" description="Test scanner operations against the API" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Machine Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sim-scanner-select">Scanner</Label>
                <Select
                  value={selectedScannerId}
                  onValueChange={handleScannerChange}
                  disabled={isLoadingScanners}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scanner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom (Manual Entry)</SelectItem>
                    {scanners?.map((scanner) => (
                      <SelectItem key={scanner.id} value={scanner.id}>
                        {scanner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sim-machine-id">Machine ID</Label>
                <Input
                  id="sim-machine-id"
                  value={machineId}
                  onChange={(e) => setMachineId(e.target.value)}
                  readOnly={selectedScannerId !== "custom"}
                  placeholder={selectedScannerId !== "custom" ? "Selected scanner ID" : "Paste machine UUID"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sim-machine-key">Machine Key</Label>
                <Input
                  id="sim-machine-key"
                  type="password"
                  value={machineKey}
                  onChange={(e) => setMachineKey(e.target.value)}
                  placeholder="Paste machine key"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handlePing} disabled={!machineId.trim() || !machineKey.trim() || sendPing.isPending} className="w-full">
                <Heart className="mr-2 h-4 w-4" />
                {sendPing.isPending ? "Sending…" : "Send Ping"}
              </Button>

              <Separator />

              <form onSubmit={form.handleSubmit(handleScan)} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="sim-card-uid">Card UID</Label>
                  <Input id="sim-card-uid" {...form.register("cardUid")} placeholder="14 hex chars" maxLength={14} />
                  {form.formState.errors.cardUid && (
                    <p className="text-sm text-destructive">{form.formState.errors.cardUid.message}</p>
                  )}
                </div>
                <Button type="submit" disabled={!machineId.trim() || !machineKey.trim() || sendScan.isPending} className="w-full">
                  <Scan className="mr-2 h-4 w-4" />
                  {sendScan.isPending ? "Sending…" : "Send Scan"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityLog entries={entries} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
