import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "RFQ Management System",
  description: "RFQ Registration and Assignment System",
  icons: {
    icon: "/favicon.png?v=2",
    shortcut: "/favicon.png?v=2",
    apple: "/favicon.png?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
