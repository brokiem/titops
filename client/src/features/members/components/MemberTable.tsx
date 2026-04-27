import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Info, UserRound, CreditCard, Clock3 } from "lucide-react";
import type { MemberDto } from "@/types/api";
import { formatDate, formatRelativeTime } from "@/lib/date";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MemberTableProps {
  members: MemberDto[];
  onEdit: (member: MemberDto) => void;
  onDelete: (member: MemberDto) => void;
}

export function MemberTable({ members, onEdit, onDelete }: MemberTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-6">Member</TableHead>
          <TableHead>Major</TableHead>
          <TableHead>
            <div className="inline-flex items-center gap-1.5 align-middle">
              <span>Card UID</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="Card UID help"
                  >
                    <Info className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-center">
                  A card UID can be assigned only after a session is started. Once the session is active, scan an unassigned card to link it.
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="pr-6 text-right"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id} className="group">
            <TableCell className="pl-6 py-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <UserRound className="h-4 w-4" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="truncate font-semibold text-foreground">{member.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {member.nim}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell className="py-4">
              {member.major ? (
                <div className="text-muted-foreground">{member.major}</div>
              ) : (
                  <div className="text-muted-foreground">Unknown</div>
              )}
            </TableCell>
            <TableCell className="py-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                {member.cardUid ? (
                  <code className="font-mono text-foreground">{member.cardUid}</code>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </div>
            </TableCell>
            <TableCell className="py-4">
              <div className="space-y-1">
                <div className="font-medium text-foreground">{formatDate(member.createdAt)}</div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5" />
                  <span>{formatRelativeTime(member.createdAt)}</span>
                </div>
              </div>
            </TableCell>
            <TableCell className="pr-6 py-4">
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(member)} aria-label={`Edit ${member.name}`}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(member)}
                  aria-label={`Delete ${member.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
