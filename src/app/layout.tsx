import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppProviders from "@/components/AppProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AuraShield",
  description: "Reputation & Crisis Monitoring for Creators & Brands.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
