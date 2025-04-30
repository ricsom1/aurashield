import { Metadata } from "next";
import RedditContent from "@/components/RedditContent";

export const metadata: Metadata = {
  title: "Reddit Monitoring - AuraShield",
  description: "Monitor and analyze Reddit discussions about your brand.",
};

export default function RedditPage() {
  return <RedditContent />;
} 