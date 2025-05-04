"use client";
import React from "react";
import { useEffect, useState } from "react";
import { getSupabaseAdmin } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const [totalUsers, setTotalUsers] = useState(0);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [crisisMentions, setCrisisMentions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple admin check (replace with your own logic)
  const isAdmin = user?.email && user.email.endsWith("@aurashield.ai");

  useEffect(() => {
    async function fetchAdminData() {
      setLoading(true);
      setError(null);
      try {
        const supabase = getSupabaseAdmin();
        // Total users
        const { count: userCount } = await supabase
          .from("users")
          .select("id", { count: "exact", head: true });
        setTotalUsers(userCount || 0);
        // Top users by mentions
        const { data: top } = await supabase
          .from("mentions")
          .select("user_id, count:user_id")
          .order("count", { ascending: false })
          .limit(5);
        setTopUsers(top || []);
        // Latest crisis mentions
        const { data: crisis } = await supabase
          .from("mentions")
          .select("id, user_id, handle, text, created_at")
          .eq("is_crisis", true)
          .order("created_at", { ascending: false })
          .limit(10);
        setCrisisMentions(crisis || []);
      } catch (err) {
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, [user]);

  async function runPollTwitter() {
    setPolling(true);
    setError(null);
    try {
      const res = await fetch("/api/edge/poll-twitter", { method: "POST" });
      if (!res.ok) throw new Error("Failed to trigger poll-twitter");
      alert("poll-twitter triggered successfully!");
    } catch (err) {
      setError("Failed to trigger poll-twitter");
    } finally {
      setPolling(false);
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        <Alert variant="destructive">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You do not have admin access.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold mt-2 text-blue-700">{totalUsers}</p>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Top Users by Mentions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {topUsers.map((u, i) => (
                  <li key={u.user_id} className="mb-1 text-gray-700">
                    <span className="font-semibold">{i + 1}.</span> {u.user_id} — <span className="font-bold text-blue-600">{u.count}</span> mentions
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Latest Crisis Mentions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {crisisMentions.map((m) => (
                <li key={m.id} className="mb-2">
                  <span className="font-bold text-blue-700">{m.handle}</span>: {m.text.slice(0, 80)}{m.text.length > 80 ? "..." : ""} <span className="text-xs text-gray-500">({new Date(m.created_at).toLocaleString()})</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button
            onClick={runPollTwitter}
            disabled={polling}
            className="px-6 py-2 text-lg font-semibold shadow-md"
          >
            {polling ? "Running..." : "Run poll-twitter now"}
          </Button>
        </div>
      </div>
    </div>
  );
} 