import {useState, useMemo} from "react";
import {Plus, Search, Users, Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select, SelectTrigger, SelectContent, SelectItem, SelectValue} from "@/components/ui/select";
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
import {Card, CardContent} from "@/components/ui/card";
import {MAJORS} from "server/contracts";

export function MembersPage() {
    const {members, isLoading, isError, error, refetch} = useMembers();
    const createMember = useCreateMember();
    const updateMember = useUpdateMember();
    const deleteMember = useDeleteMember();

    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search);
    const [majorFilter, setMajorFilter] = useState("all");
    const [cardFilter, setCardFilter] = useState("all");

    const [formOpen, setFormOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<MemberDto | null>(null);
    const [deletingMember, setDeletingMember] = useState<MemberDto | null>(null);

    const hasActiveFilters =
        search.trim().length > 0 ||
        majorFilter !== "all" ||
        cardFilter !== "all";

    const filteredMembers = useMemo(() => {
        if (!members) return undefined;
        const q = debouncedSearch.trim().toLowerCase();

        return members.filter((member) => {
            return (
                (!q || member.name.toLowerCase().includes(q) || member.nim.toLowerCase().includes(q)) &&
                (majorFilter === "all" || member.major === majorFilter) &&
                (cardFilter !== "without-card" || !member.cardUid) &&
                (cardFilter !== "with-card" || !!member.cardUid)
            );
        });
    }, [members, debouncedSearch, majorFilter, cardFilter]);

    const resetFilters = () => {
        setSearch("");
        setMajorFilter("all");
        setCardFilter("all");
    };

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

            {isError && <ErrorState message={error?.message} onRetry={refetch}/>}

            <Card className="gap-0 overflow-hidden border-border/70 bg-card/95 shadow-sm py-0 mb-4">
                <div className="border-b px-6 py-4">
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_180px_auto] items-end">
                        <div className="relative max-w-md">
                            <Search className="pointer-events-none absolute left-3 inset-y-0 my-auto h-4 w-4 text-muted-foreground"/>
                            <Input
                                id="member-search"
                                placeholder="Search by name or NIM…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 pr-9"
                            />
                            {search !== debouncedSearch && search.length > 0 && (
                                <Loader2 className="pointer-events-none absolute right-3 inset-y-0 my-auto h-4 w-4 animate-spin text-muted-foreground"/>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Select value={majorFilter} onValueChange={setMajorFilter}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All majors"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All majors</SelectItem>
                                    {MAJORS.map((major) => (
                                        <SelectItem key={major} value={major}>
                                            {major}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Select value={cardFilter} onValueChange={setCardFilter}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All members"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All members</SelectItem>
                                    <SelectItem value="without-card">No card assigned</SelectItem>
                                    <SelectItem value="with-card">Has card assigned</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <CardContent className="px-0">
                    {isLoading ? (
                        <div className="px-0">
                            <MemberTableSkeleton/>
                        </div>
                    ) : members && members.length === 0 ? (
                        <div className="p-6">
                            <EmptyState
                                icon={<Users className="h-10 w-10"/>}
                                title="No members yet"
                                description="Create your first member to get started."
                            />
                        </div>
                    ) : filteredMembers && filteredMembers.length === 0 ? (
                        <div className="p-6">
                            <EmptyState
                                icon={<Users className="h-10 w-10"/>}
                                title="No members match your filters"
                                description={hasActiveFilters ? "Try adjusting or clearing filters to find members." : "Try a different search term."}
                                action={hasActiveFilters ? (
                                    <Button variant="outline" onClick={resetFilters}>
                                        Clear filters
                                    </Button>
                                ) : undefined}
                            />
                        </div>
                    ) : filteredMembers && filteredMembers.length > 0 ? (
                        <div className="px-0">
                            <MemberTable members={filteredMembers} onEdit={handleEdit} onDelete={setDeletingMember}/>
                        </div>
                    ) : null}
                </CardContent>
            </Card>

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
