import { Metadata } from 'next';
import AppLayout from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "AuraShield Dashboard",
  description: "Monitor your personal brand mentions, trends, and risks in one place.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
} 