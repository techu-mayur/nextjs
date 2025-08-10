import type { Metadata } from "next";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import NavBar from "./components/NavBar";

export const metadata: Metadata = {
  title: "Mayur & Jinal Wedding Album | Share Beautiful Moments",
  description: "Experience and share the beautiful moments of Mayur & Jinal's special day. View, download, and relive our wedding memories in high quality.",
  keywords: "wedding, photos, videos, album, memories, Mayur, Jinal, celebration",
  authors: [{ name: "Mayur & Jinal" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#0B666A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&family=Playfair+Display:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
        {/* Move heavy scripts to end of body via Next Script or load lazily in pages where needed */}
      </head>
      <body className="d-flex flex-column min-vh-100">
        <NavBar />
        <main className="flex-grow-1">
          <div id="root">{children}</div>
        </main>
        {/* Load Bootstrap JS and Plyr at the bottom for better FCP */}
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js" async defer></script>
        <script src="https://cdn.plyr.io/3.7.8/plyr.polyfilled.js" async defer></script>
      </body>
    </html>
  );
}
