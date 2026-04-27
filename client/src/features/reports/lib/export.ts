import type { EnrichedAttendanceDto, SessionDto } from "@/types/api";
import { formatTime } from "@/lib/date";

export function exportCsv(session: SessionDto, attendance: EnrichedAttendanceDto[]): void {
  const headers = ["NO", "NAMA LENGKAP", "NIM", "JURUSAN", "CHECK-IN", "CHECK-OUT"];
  const rows = attendance.map((a, index) => [
    String(index + 1),
    a.memberName,
    a.memberNim,
    a.memberMajor,
    formatTime(a.checkInAt),
    a.checkOutAt ? formatTime(a.checkOutAt) : "",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${session.name}-attendance.csv`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
