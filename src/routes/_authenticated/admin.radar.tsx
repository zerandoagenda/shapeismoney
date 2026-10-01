import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/radar")({
  component: RadarLayout,
});

function RadarLayout() {
  return <Outlet />;
}
