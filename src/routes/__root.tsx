import { createRootRoute, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { localeFromPath } from "@/lib/seo";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#f4f2ec" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  // The page language follows the route: "/" is French, "/en" is English.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <html lang={localeFromPath(pathname)}>
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
