'use client';
import { Metadata } from "next";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SettingsPage() {
  const { user } = useAuth();
  const [twitterHandle, setTwitterHandle] = useState("");
  const [entities, setEntities] = useState<{ id?: string; type: string; value: string }[]>([]);
  const [newEntity, setNewEntity] = useState<{ type: string; value: string }>({ type: "keyword", value: "" });
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      if (!user) return;
      setLoading(true);
      const supabase = getSupabaseClient();
      setTwitterHandle(user.user_metadata?.username || "");
      // Fetch tracked entities
      const { data: tracked } = await supabase
        .from("tracked_entities")
        .select("id, type, value")
        .eq("user_id", user.id);
      setEntities((tracked as { id: string; type: string; value: string }[]) || []);
      // Fetch alerts setting
      const { data: settings } = await supabase
        .from("settings")
        .select("alerts_enabled")
        .eq("user_id", user.id)
        .single();
      setAlertsEnabled(Boolean(settings?.alerts_enabled));
      setLoading(false);
    }
    fetchSettings();
  }, [user]);

  async function saveTwitterHandle() {
    if (!twitterHandle.trim()) {
      toast.error("Twitter handle cannot be empty");
      return;
    }
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.updateUser({
      data: { username: twitterHandle.trim() },
    });
    if (error) toast.error("Failed to update Twitter handle");
    else toast.success("Twitter handle updated");
  }

  async function addEntity() {
    if (!newEntity.value.trim()) {
      toast.error("Value cannot be empty");
      return;
    }
    const supabase = getSupabaseClient();
    const { error, data } = await supabase
      .from("tracked_entities")
      .insert([{ user_id: user.id, type: newEntity.type, value: newEntity.value.trim() }])
      .select();
    if (error) toast.error("Failed to add entity");
    else {
      setEntities([...entities, ...(data as { id: string; type: string; value: string }[])]);
      setNewEntity({ type: "keyword", value: "" });
      toast.success("Entity added");
    }
  }

  async function removeEntity(id: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("tracked_entities").delete().eq("id", id);
    if (error) toast.error("Failed to remove entity");
    else {
      setEntities(entities.filter((e) => e.id !== id));
      toast.success("Entity removed");
    }
  }

  async function saveAlertsSetting() {
    const supabase = getSupabaseClient();
    // Upsert user settings
    const { error } = await supabase
      .from("settings")
      .upsert([{ user_id: user.id, alerts_enabled: alertsEnabled }], { onConflict: "user_id" });
    if (error) toast.error("Failed to update alerts setting");
    else toast.success("Alerts setting updated");
  }

  if (loading) return <div className="min-h-screen bg-gray-50 py-8">Loading...</div>;
  if (error) return (
    <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Settings</h1>
        <Card className="shadow-sm divide-y divide-gray-200">
          {/* Twitter Handle */}
          <CardHeader>
            <CardTitle>Twitter Handle</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Input
                type="text"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                placeholder="@yourhandle"
                className="w-full"
              />
              <Button onClick={saveTwitterHandle} variant="default">
                Save
              </Button>
            </div>
          </CardContent>

          {/* Tracked Entities */}
          <CardHeader>
            <CardTitle>Competitors & Crisis Keywords</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex space-x-2 mb-4">
              <select
                value={newEntity.type}
                onChange={(e) => setNewEntity((ne) => ({ ...ne, type: e.target.value }))}
                className="border-gray-300 rounded-md px-2 py-1"
              >
                <option value="keyword">Keyword</option>
                <option value="reddit">Competitor (Reddit)</option>
              </select>
              <Input
                type="text"
                value={newEntity.value}
                onChange={(e) => setNewEntity((ne) => ({ ...ne, value: e.target.value }))}
                placeholder="Add keyword or competitor"
                className="w-full"
              />
              <Button onClick={addEntity} variant="default">
                Add
              </Button>
            </div>
            <ul className="space-y-2">
              {entities.map((entity) => (
                <li key={entity.id} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
                  <span>{entity.type}: {entity.value}</span>
                  <Button onClick={() => removeEntity(entity.id!)} variant="destructive" size="sm">
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>

          {/* Alerts Toggle */}
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span>Email & Crisis Alerts</span>
              <Switch
                checked={alertsEnabled}
                onCheckedChange={(v) => { setAlertsEnabled(v); setTimeout(saveAlertsSetting, 100); }}
                aria-checked={alertsEnabled}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 