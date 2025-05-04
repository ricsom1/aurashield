"use client";

import React from "react";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import DashboardHeader from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ShieldCheck className="w-10 h-10 text-blue-500 animate-bounce-slow mr-3" />
        <span className="text-xl font-semibold text-gray-700">Loading Crisis Center...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-blue-500" /> Crisis Center
          </h1>
          <Button
            onClick={generatePlaybook}
            disabled={generating}
            variant="destructive"
            className="px-6 py-2 text-lg font-semibold shadow-md"
          >
            {generating ? "Generating..." : "Generate Response Plan"}
          </Button>
        </div>

        {/* Crisis Mentions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Active Crisis Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Playbook */}
        {playbook && (
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Response Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
} 