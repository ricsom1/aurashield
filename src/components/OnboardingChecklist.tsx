"use client";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { getSupabaseClient } from "@/lib/supabase";

const steps = [
  {
    key: "twitterHandle",
    label: "Add your Twitter handle",
    check: (user: any) => !!user?.user_metadata?.username,
  },
  {
    key: "keywords",
    label: "Choose keywords or competitors",
    check: (flags: any) => flags.keywords,
  },
  {
    key: "alerts",
    label: "Set up alerts",
    check: (flags: any) => flags.alerts,
  },
  {
    key: "email",
    label: "Connect email",
    check: (user: any) => !!user?.email,
  },
  {
    key: "mentions",
    label: "Review first mentions",
    check: (flags: any) => flags.mentions,
  },
];

export default function OnboardingChecklist() {
  const { user } = useAuth();
  const [flags, setFlags] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFlags() {
      if (!user) return;
      const supabase = getSupabaseClient();
      // Example: check if user has tracked entities (keywords/competitors) and mentions
      const { data: tracked, error: trackedError } = await supabase
        .from("tracked_entities")
        .select("id")
        .eq("user_id", user.id);
      const { data: mentions, error: mentionsError } = await supabase
        .from("mentions")
        .select("id")
        .eq("user_id", user.id);
      setFlags({
        keywords: tracked && tracked.length > 0,
        alerts: true, // You can add a real check for alert setup if needed
        mentions: mentions && mentions.length > 0,
      });
      setLoading(false);
    }
    fetchFlags();
  }, [user]);

  if (loading) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Get Started Checklist</h3>
      <ul className="space-y-3">
        {steps.map((step) => {
          const completed =
            step.key === "twitterHandle" || step.key === "email"
              ? step.check(user)
              : step.check(flags);
          return (
            <li key={step.key} className="flex items-center">
              <span
                className={`inline-block w-5 h-5 rounded-full mr-3 flex items-center justify-center text-white ${
                  completed ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                {completed ? "✓" : ""}
              </span>
              <span className={completed ? "text-gray-700" : "text-gray-400"}>{step.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
} 