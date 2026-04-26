import { Navigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { MembersPage } from "@/features/members/MembersPage";
import { ScannersPage } from "@/features/scanners/ScannersPage";
import { SessionDetailPage } from "@/features/session/SessionDetailPage";
import { ReportsPage } from "@/features/reports/ReportsPage";
import { ReportDetailPage } from "@/features/reports/ReportDetailPage";
import { SimulatorPage } from "@/features/simulator/SimulatorPage";

export const routes = [
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
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
    ],
  },
];
