import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { Toaster } from "sonner";
import styles from "./tailwind.css?url";
import theme from "./theme.css?url";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: theme }
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <style dangerouslySetInnerHTML={{
          __html: `
            html, body {
              overscroll-behavior: none;
            }
          `
        }} />
      </head>
      <body className="bg-background text-foreground antialiased h-full">
        {children}
        <Toaster richColors position="top-right" duration={2500} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
