import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-navy">404</h1>
        <h2 className="mt-4 font-display text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-navy px-4 py-2 text-sm font-medium text-navy-foreground transition-colors hover:bg-navy-light"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Magi BD — Prestigious Rankings & Lists" },
      { name: "description", content: "Magi BD র‍্যাঙ্কিং  
বাংলাদেশের সবচেয়ে সেক্সি ও অশ্লীল পর্ণস্টারদের লিস্ট।  
Top = সবচেয়ে বেশি চোদনপ্রিয়।" },
      { property: "og:title", content: "Magi BD — Prestigious Rankings & Lists" },
      { property: "og:description", content: "Magi BD র‍্যাঙ্কিং  
বাংলাদেশের সবচেয়ে সেক্সি ও অশ্লীল পর্ণস্টারদের লিস্ট।  
Top = সবচেয়ে বেশি চোদনপ্রিয়।" },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Magi BD — Prestigious Rankings & Lists" },
      { name: "twitter:description", content: "Magi BD র‍্যাঙ্কিং  
বাংলাদেশের সবচেয়ে সেক্সি ও অশ্লীল পর্ণস্টারদের লিস্ট।  
Top = সবচেয়ে বেশি চোদনপ্রিয়।" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/4UbGQbwFkdbYt5GWgxpjBvnt6Ho2/social-images/social-1776341475096-image-5.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/4UbGQbwFkdbYt5GWgxpjBvnt6Ho2/social-images/social-1776341475096-image-5.webp" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
