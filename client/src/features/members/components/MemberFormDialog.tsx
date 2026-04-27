import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createMemberSchema, updateMemberSchema } from "@/lib/schemas/member";
import type { CreateMemberFormValues, UpdateMemberFormValues } from "@/lib/schemas/member";
import type { MemberDto } from "@/types/api";
import { useEffect } from "react";
import { MAJORS } from "shared";

interface MemberFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member?: MemberDto | null;
    onSubmitCreate: (values: CreateMemberFormValues) => Promise<void>;
    onSubmitUpdate: (values: UpdateMemberFormValues) => Promise<void>;
    isPending: boolean;
}

export function MemberFormDialog({
    open,
    onOpenChange,
    member,
    onSubmitCreate,
    onSubmitUpdate,
    isPending,
}: MemberFormDialogProps) {
    const isEdit = !!member;

    const createForm = useForm<CreateMemberFormValues>({
        resolver: zodResolver(createMemberSchema),
        defaultValues: { name: "", nim: "", major: "" },
    });

    const editForm = useForm<UpdateMemberFormValues>({
        resolver: zodResolver(updateMemberSchema),
        defaultValues: { name: "", nim: "", major: "" },
    });

    useEffect(() => {
        if (open && member) {
            editForm.reset({ name: member.name, nim: member.nim, major: member.major });
        } else if (open && !member) {
            createForm.reset({ name: "", nim: "", major: "" });
        }
    }, [open, member, createForm, editForm]);

    const handleCreate = async (values: CreateMemberFormValues) => {
        await onSubmitCreate(values);
        createForm.reset();
    };

    const handleUpdate = async (values: UpdateMemberFormValues) => {
        await onSubmitUpdate(values);
        editForm.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Member" : "Create Member"}</DialogTitle>
                </DialogHeader>
                {isEdit ? (
                    <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input id="edit-name" {...editForm.register("name")} />
                            {editForm.formState.errors.name && (
                                <p className="text-sm text-destructive">{editForm.formState.errors.name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-nim">NIM</Label>
                            <Input id="edit-nim" {...editForm.register("nim")} maxLength={10} />
                            {editForm.formState.errors.nim && (
                                <p className="text-sm text-destructive">{editForm.formState.errors.nim.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Major</Label>
                            <Controller
                                control={editForm.control}
                                name="major"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a major" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MAJORS.map((major) => (
                                                <SelectItem key={major} value={major}>
                                                    {major}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {editForm.formState.errors.major && (
                                <p className="text-sm text-destructive">{editForm.formState.errors.major.message}</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Saving…" : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-name">Name</Label>
                            <Input id="create-name" {...createForm.register("name")} />
                            {createForm.formState.errors.name && (
                                <p className="text-sm text-destructive">{createForm.formState.errors.name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-nim">NIM</Label>
                            <Input id="create-nim" {...createForm.register("nim")} placeholder="e.g. 2312345678" maxLength={10} />
                            {createForm.formState.errors.nim && (
                                <p className="text-sm text-destructive">{createForm.formState.errors.nim.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Major</Label>
                            <Controller
                                control={createForm.control}
                                name="major"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a major" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MAJORS.map((major) => (
                                                <SelectItem key={major} value={major}>
                                                    {major}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {createForm.formState.errors.major && (
                                <p className="text-sm text-destructive">{createForm.formState.errors.major.message}</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Creating…" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

