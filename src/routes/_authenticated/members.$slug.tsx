import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/members/$slug")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Club — Shape Is Money" },
      { name: "description", content: "Club temporariamente indisponível." },
      { property: "og:title", content: "Club — Shape Is Money" },
      { property: "og:description", content: "Club temporariamente indisponível." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => null,
});