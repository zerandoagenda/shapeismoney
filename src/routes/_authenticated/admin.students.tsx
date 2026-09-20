import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireStaff } from "@/lib/admin-guard";

export const Route = createFileRoute("/_authenticated/admin/students")({
  head: () => ({
    meta: [
      { title: "Alunos — Shape Is Money" },
      { name: "description", content: "Gestão privada de alunos e prontidão operacional." },
      { property: "og:title", content: "Alunos — Shape Is Money" },
      { property: "og:description", content: "Gestão privada de alunos e prontidão operacional." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: requireStaff,
  component: Outlet,
});
