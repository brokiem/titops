import { Navigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { RequireAuth } from "@/features/auth/RequireAuth";
import { LoginPage } from "@/features/auth/LoginPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { MembersPage } from "@/features/members/MembersPage";
import { ScannersPage } from "@/features/scanners/ScannersPage";
import { SessionDetailPage } from "@/features/session/SessionDetailPage";
import { ReportsPage } from "@/features/reports/ReportsPage";
import { ReportDetailPage } from "@/features/reports/ReportDetailPage";
import { SimulatorPage } from "@/features/simulator/SimulatorPage";
import { AdminAccountsPage } from "@/features/admin/AdminAccountsPage";

export const routes = [
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: "members",
            element: <MembersPage />,
          },
          {
            path: "scanners",
            element: <ScannersPage />,
          },
          {
            path: "session/:id",
            element: <SessionDetailPage />,
          },
          {
            path: "reports",
            element: <ReportsPage />,
          },
          {
            path: "reports/:id",
            element: <ReportDetailPage />,
          },
          {
            path: "scanner-simulator",
            element: <SimulatorPage />,
          },
          {
            path: "admins",
            element: <AdminAccountsPage />,
          },
        ],
      },
    ],
  },
];
