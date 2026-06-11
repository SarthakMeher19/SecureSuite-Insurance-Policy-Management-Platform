import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/policies")({
  component: PoliciesLayout,
});

function PoliciesLayout() {
  return <Outlet />;
}
