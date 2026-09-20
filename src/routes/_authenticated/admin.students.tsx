import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireStaff } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/students")({
  beforeLoad: requireStaff,
  component: Outlet,
});
