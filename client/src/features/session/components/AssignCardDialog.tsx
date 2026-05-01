import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMembers, useAssignCard } from "@/features/members/hooks/useMembers";
import { useDebounce } from "@/hooks/use-debounce";
import { Search, Loader2 } from "lucide-react";

interface AssignCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardUid: string;
}

export function AssignCardDialog({ open, onOpenChange, cardUid }: AssignCardDialogProps) {
  const { members } = useMembers();
  const assignCard = useAssignCard();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    if (!debouncedSearch) return members;
    const q = debouncedSearch.toLowerCase();
    return members.filter((m) => m.name.toLowerCase().includes(q) || m.nim.includes(q));
  }, [members, debouncedSearch]);

  const handleAssign = async () => {
    if (!selectedMemberId) return;
    await assignCard.mutateAsync({ memberId: selectedMemberId, data: { cardUid } });
    onOpenChange(false);
    setSearch("");
    setSelectedMemberId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Card</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Card UID</Label>
            <p className="font-mono text-sm text-muted-foreground">{cardUid}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-search">Search Member</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="member-search"
                placeholder="Search by name or NIM…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9"
              />
              {search !== debouncedSearch && search.length > 0 && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />}
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto border rounded-md">
            {filteredMembers.length === 0 && (
              <p className="text-sm text-muted-foreground p-3">No members found</p>
            )}
            {filteredMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                  selectedMemberId === member.id ? "bg-muted font-medium" : ""
                }`}
                onClick={() => setSelectedMemberId(member.id)}
              >
                {member.name} <span className="text-muted-foreground">({member.nim})</span>
                {member.cardUid && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                    Has Card: {member.cardUid}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={assignCard.isPending}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedMemberId || assignCard.isPending}>
            {assignCard.isPending ? "Assigning…" : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
