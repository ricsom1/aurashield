import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppProviders from "@/components/AppProviders";
import AppLayout from "@/components/AppLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AuraShield",
  description: "Reputation & Crisis Monitoring for Creators & Brands.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Avoid double-wrapping dashboard pages (they have their own layout)
  const isDashboard = typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard");
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProviders>
          {/* Only wrap in AppLayout if not already in dashboard */}
          {isDashboard ? children : <AppLayout>{children}</AppLayout>}
        </AppProviders>
      </body>
    </html>
  );
}
