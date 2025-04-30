import AppProviders from "@/components/AppProviders";
import Header from "@/components/Header";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <AppProviders>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  );
}
