import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface ActionCardProps {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ActionCard({ to, icon: Icon, title, description }: ActionCardProps) {
  return (
    <Link to={to} className="group">
      <Card className="transition-all duration-200 hover:shadow-md hover:border-primary/30 group-hover:-translate-y-0.5">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-xs">{description}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
