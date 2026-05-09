import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { createAdmin } from "@/api/auth";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAdminSchema, type CreateAdminFormValues } from "@/lib/schemas/auth";
import { useAuth } from "../auth/hooks/useAuth";

export function AdminAccountsPage() {
  const { admin } = useAuth();
  const form = useForm<CreateAdminFormValues>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  if (admin?.role !== "SUPERADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (values: CreateAdminFormValues) => {
    try {
      const { confirmPassword, ...adminData } = values;
      await createAdmin(adminData);
      form.reset();
      toast.success("Admin account created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create admin account");
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Admin Accounts" description="Create admin accounts for CHAKRA users." />
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Create Admin</CardTitle>
          <CardDescription>New accounts receive admin access. Superadmin access is reserved for the seeded account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="admin-name">Name</Label>
                <Input id="admin-name" autoComplete="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input id="admin-email" type="email" autoComplete="email" {...form.register("email")} />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input id="admin-password" type="password" autoComplete="new-password" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-confirm-password">Confirm Password</Label>
              <Input id="admin-confirm-password" type="password" autoComplete="new-password" {...form.register("confirmPassword")} />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              <UserPlus className="h-4 w-4" />
              {form.formState.isSubmitting ? "Creating..." : "Create admin"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
