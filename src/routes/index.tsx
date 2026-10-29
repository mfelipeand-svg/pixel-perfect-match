import { createFileRoute, redirect } from "@tanstack/react-router";

// The site is the original HTML file served unchanged from public/site.html.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ href: "/site.html", reloadDocument: true });
  },
  head: () => ({
    meta: [
      { title: "Instituto Performance | Dermatologia clínica, estética e tricologia em Salvador" },
      { name: "description", content: "Instituto Performance: dermatologia clínica, dermatologia estética e tricologia no Caminho das Árvores, Salvador." },
      { property: "og:title", content: "Instituto Performance" },
      { property: "og:description", content: "Dermatologia clínica, estética e tricologia em Salvador." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => null,
});
