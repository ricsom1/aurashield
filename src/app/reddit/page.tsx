import { Metadata } from "next";
import RedditContent from "@/components/RedditContent";

export const metadata: Metadata = {
  title: "Reddit Monitoring - MenuIQ",
  description: "Track real-time Reddit sentiment and mentions about your restaurant.",
};

export default function RedditPage() {
  return <RedditContent />;
} 