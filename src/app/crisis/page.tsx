"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import DashboardHeader from "@/components/DashboardHeader";

interface CrisisMention {
  id: string;
  text: string;
  source: string;
  created_at: string;
  crisis_score: number;
  url: string;
  is_crisis: boolean;
}

interface Playbook {
  severity: string;
  statement: string;
  timeline: string[];
  mitigation: string[];
  channels: string[];
  talkingPoints: string[];
}

export default function CrisisCenter() {
  const [crisisMentions, setCrisisMentions] = useState<CrisisMention[]>([]);
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function fetchCrisisMentions() {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("mentions")
        .select("*")
        .eq("is_crisis", true)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching crisis mentions:", error);
        setLoading(false);
        return;
      }

      if (data) {
        const typedData = data.map((item: any) => ({
          id: item.id,
          text: item.text,
          source: item.source,
          created_at: item.created_at,
          crisis_score: item.crisis_score,
          url: item.url,
          is_crisis: item.is_crisis,
        })) as CrisisMention[];
        setCrisisMentions(typedData);
      }
      setLoading(false);
    }

    fetchCrisisMentions();
  }, []);

  async function generatePlaybook() {
    setGenerating(true);
    try {
      const response = await fetch("/api/crisis/playbook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ creatorHandle: "your-handle" }), // Replace with actual handle
      });

      if (response.ok) {
        const data = await response.json();
        setPlaybook(data);
      }
    } catch (error) {
      console.error("Failed to generate playbook:", error);
    }
    setGenerating(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Crisis Center</h1>
          <button
            onClick={generatePlaybook}
            disabled={generating}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate Response Plan"}
          </button>
        </div>

        {/* Crisis Mentions */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Active Crisis Alerts</h2>
          <div className="space-y-4">
            {crisisMentions.map((mention) => (
              <div key={mention.id} className="p-4 bg-red-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">{mention.source}</p>
                    <p className="mt-1 text-gray-900">{mention.text}</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                    Crisis Score: {mention.crisis_score}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                  <span>{new Date(mention.created_at).toLocaleString()}</span>
                  <a
                    href={mention.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-800"
                  >
                    View Source
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Playbook */}
        {playbook && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">AI-Generated Response Plan</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Severity Assessment</h3>
                <p className="text-gray-600">{playbook.severity}</p>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Recommended Statement</h3>
                <p className="text-gray-600">{playbook.statement}</p>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Response Timeline</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {playbook.timeline.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Risk Mitigation Steps</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {playbook.mitigation.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Communication Channels</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {playbook.channels.map((channel, i) => (
                    <li key={i}>{channel}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-2">Key Talking Points</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {playbook.talkingPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 