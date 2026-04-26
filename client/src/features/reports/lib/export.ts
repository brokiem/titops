import type { EnrichedAttendanceDto, SessionDto } from "@/types/api";
import { formatDate, formatTime } from "@/lib/date";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function exportCsv(session: SessionDto, attendance: EnrichedAttendanceDto[]): void {
  const headers = ["Member", "Card UID", "Check In", "Check Out"];
  const rows = attendance.map((a) => [
    a.memberName,
    a.cardUid,
    formatTime(a.checkInAt),
    a.checkOutAt ? formatTime(a.checkOutAt) : "",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${session.name}-attendance.csv`);
}

export function exportPdf(session: SessionDto, attendance: EnrichedAttendanceDto[]): void {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text(session.name, 14, 20);
  doc.setFontSize(10);
  doc.text(`Date: ${formatDate(session.startedAt ?? session.createdAt)}`, 14, 28);
  doc.text(`Total Records: ${attendance.length}`, 14, 34);

  autoTable(doc, {
    startY: 42,
    head: [["Member", "Card UID", "Check In", "Check Out"]],
    body: attendance.map((a) => [
      a.memberName,
      a.cardUid,
      formatTime(a.checkInAt),
      a.checkOutAt ? formatTime(a.checkOutAt) : "—",
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 30, 30] },
  });

  doc.save(`${session.name}-attendance.pdf`);
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
