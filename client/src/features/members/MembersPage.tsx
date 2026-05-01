import {useState, useMemo} from "react";
import {Plus, Search, Users, Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {PageHeader} from "@/components/PageHeader";
import {EmptyState} from "@/components/EmptyState";
import {ErrorState} from "@/components/ErrorState";
import {ConfirmDialog} from "@/components/ConfirmDialog";
import {MemberTable} from "./components/MemberTable";
import {MemberTableSkeleton} from "./components/MemberTableSkeleton";
import {MemberFormDialog} from "./components/MemberFormDialog";
import {useMembers, useCreateMember, useUpdateMember, useDeleteMember} from "./hooks/useMembers";
import {useDebounce} from "@/hooks/use-debounce";
import type {MemberDto} from "@/types/api";
import { Card, CardContent } from "@/components/ui/card";

export function MembersPage() {
    const {members, isLoading, isError, error, refetch} = useMembers();
    const createMember = useCreateMember();
    const updateMember = useUpdateMember();
    const deleteMember = useDeleteMember();

    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search);

    const [formOpen, setFormOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<MemberDto | null>(null);
    const [deletingMember, setDeletingMember] = useState<MemberDto | null>(null);

    const filteredMembers = useMemo(() => {
        if (!members) return undefined;
        if (!debouncedSearch) return members;
        const q = debouncedSearch.toLowerCase();
        return members.filter(
            (m) => m.name.toLowerCase().includes(q) || m.nim.includes(q),
        );
    }, [members, debouncedSearch]);

    const handleEdit = (member: MemberDto) => {
        setEditingMember(member);
        setFormOpen(true);
    };

    const handleCreate = () => {
        setEditingMember(null);
        setFormOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingMember) return;
        await deleteMember.mutateAsync(deletingMember.id);
        setDeletingMember(null);
    };

    return (
        <>
            <PageHeader
                title="Members"
                description="Manage organization members"
                action={
                    <Button onClick={handleCreate} id="create-member-btn">
                        <Plus className="mr-2 h-4 w-4"/>
                        Create Member
                    </Button>
                }
            />

            <div className="mb-4 relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <Input
                    placeholder="Search by name or NIM…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-9"
                    id="member-search"
                />
                {search !== debouncedSearch && search.length > 0 && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />}
            </div>

          {isError && <ErrorState message={error?.message} onRetry={refetch}/>}

          {isLoading && (
              <Card className="gap-0 overflow-hidden border-border/70 bg-card/95 shadow-sm py-0">
                  <CardContent className="px-0">
                      <MemberTableSkeleton/>
                  </CardContent>
              </Card>
          )}

          {!isLoading && filteredMembers && filteredMembers.length === 0 && (
              <EmptyState icon={<Users className="h-10 w-10 mt-10"/>} title="No members found" description={search ? "Try a different search term." : "Create your first member to get started."}/>
          )}

            {!isLoading && filteredMembers && filteredMembers.length > 0 && (
                <Card className="gap-0 overflow-hidden border-border/70 bg-card/95 shadow-sm py-0">
                    <CardContent className="px-0">
                        <MemberTable members={filteredMembers} onEdit={handleEdit} onDelete={setDeletingMember}/>
                    </CardContent>
                </Card>
            )}

            <MemberFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                member={editingMember}
                onSubmitCreate={async (values) => {
                    await createMember.mutateAsync(values);
                    setFormOpen(false);
                }}
                onSubmitUpdate={async (values) => {
                    if (!editingMember) return;
                    await updateMember.mutateAsync({id: editingMember.id, data: values});
                    setFormOpen(false);
                }}
                isPending={createMember.isPending || updateMember.isPending}
            />

            <ConfirmDialog
                open={!!deletingMember}
                onOpenChange={(open) => !open && setDeletingMember(null)}
                title="Delete Member"
                description={`Are you sure you want to delete "${deletingMember?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="destructive"
                loading={deleteMember.isPending}
                onConfirm={handleDelete}
            />
        </>
    );
}
