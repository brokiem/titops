import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Radio,
  FileBarChart,
  Cpu,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/dashboard/members", icon: Users, label: "Members", end: false },
  { to: "/dashboard/scanners", icon: Radio, label: "Scanners", end: false },
  { to: "/dashboard/reports", icon: FileBarChart, label: "Reports", end: false },
  { to: "/dashboard/scanner-simulator", icon: Cpu, label: "Simulator", end: false },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex items-center h-14 px-6 border-b">
        <span className="text-lg font-bold tracking-tight">TITOPS</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <Separator className="bg-sidebar-border" />
      <div className="px-6 py-4">
        <p className="text-xs text-sidebar-foreground/50">TITOPS v1.0</p>
      </div>
    </aside>
  );
}
