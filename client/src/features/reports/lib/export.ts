import type { EnrichedAttendanceDto, SessionDto, MemberDto } from "@/types/api";
import { formatTime } from "@/lib/date";
import ExcelJS from "exceljs";

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

export async function exportMonthlyReportExcel(
  monthLabel: string,
  members: MemberDto[],
  sessions: SessionDto[],
  attendances: Record<string, EnrichedAttendanceDto[]>
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Monthly Report");

  const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  const numSessions = sessions.length;

  // Create first header row
  const row1 = ["NO", "NAMA LENGKAP", "NIM", "JURUSAN", "MINGGU"];
  for (let i = 1; i < numSessions; i++) {
    row1.push("");
  }
  row1.push("TOTAL");
  sheet.addRow(row1);

  // Create second header row
  const row2 = ["", "", "", ""];
  for (let i = 0; i < numSessions; i++) {
    row2.push(romanNumerals[i] || String(i + 1));
  }
  row2.push("");
  sheet.addRow(row2);

  // Merge headers
  sheet.mergeCells("A1:A2");
  sheet.mergeCells("B1:B2");
  sheet.mergeCells("C1:C2");
  sheet.mergeCells("D1:D2");

  if (numSessions > 1) {
    const startCol = 5; // Column E
    const endCol = 4 + numSessions;
    sheet.mergeCells(1, startCol, 1, endCol);
  }

  const totalColIndex = 5 + numSessions;
  sheet.mergeCells(1, totalColIndex, 2, totalColIndex);

  // Style headers
  for (let i = 1; i <= 2; i++) {
    const row = sheet.getRow(i);
    row.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
  }

  // Set column widths
  sheet.getColumn(1).width = 5; // NO
  sheet.getColumn(2).width = 30; // NAMA LENGKAP
  sheet.getColumn(3).width = 15; // NIM
  sheet.getColumn(4).width = 25; // JURUSAN
  for (let i = 0; i < numSessions; i++) {
    sheet.getColumn(5 + i).width = 10; // MINGGU I, II...
  }
  sheet.getColumn(totalColIndex).width = 10; // TOTAL

  // Sort members by Name
  const sortedMembers = [...members].sort((a, b) => a.name.localeCompare(b.name));

  // Add data rows
  sortedMembers.forEach((member, index) => {
    const rowData: any[] = [
      index + 1,
      member.name,
      member.nim,
      member.major
    ];

    let total = 0;
    sessions.forEach(session => {
      const sessionAttendance = attendances[session.id] || [];
      const didAttend = sessionAttendance.some(a => a.id === member.id);
      const val = didAttend ? 1 : 0;
      rowData.push(val);
      total += val;
    });

    rowData.push(total);
    sheet.addRow(rowData);
  });

  // Add borders to all cells
  sheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };

      // Center align everything except Name (unless it's a header)
      if (Number(cell.col) !== 2 || rowNumber <= 2) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else {
        cell.alignment = { vertical: "middle" };
      }
    });
  });

  // Generate buffer and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  downloadBlob(blob, `Attendance-Report-${monthLabel.replace(/\s+/g, '-')}.xlsx`);
}
