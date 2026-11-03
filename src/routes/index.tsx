import { createFileRoute, redirect } from "@tanstack/react-router";

// The site is the original HTML file served unchanged from public/site.html.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ href: "/site.html", reloadDocument: true });
  },
  head: () => ({
    meta: [
      { title: "Dra. Ana Helena | Dermatologia Clínica e Estética em Salvador" },
      { name: "description", content: "Dra. Ana Helena, médica CRM-BA 43.424, pós-graduada em Dermatologia Clínica e Estética. Estética avançada, rejuvenescimento e tricologia em Salvador." },
      { property: "og:title", content: "Dra. Ana Helena | Dermatologia Clínica e Estética" },
      { property: "og:description", content: "Uma estética que respeita a individualidade. Ciência, tecnologia e sensibilidade para valorizar a beleza natural." },
      { property: "og:image", content: "https://performanceinstituto.lovable.app/assets/dra-ana-01.jpg" },
      { name: "twitter:image", content: "https://performanceinstituto.lovable.app/assets/dra-ana-01.jpg" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => null,
});
