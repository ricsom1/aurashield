import { Metadata } from "next";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import toast from "react-hot-toast";

export const metadata: Metadata = {
  title: "Settings - AuraShield",
  description: "Configure your AuraShield dashboard settings.",
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [twitterHandle, setTwitterHandle] = useState("");
  const [entities, setEntities] = useState<{ id?: string; type: string; value: string }[]>([]);
  const [newEntity, setNewEntity] = useState<{ type: string; value: string }>({ type: "keyword", value: "" });
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Settings</h1>
        <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
          {/* Twitter Handle */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Twitter Handle</h2>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="@yourhandle"
              />
              <button
                onClick={saveTwitterHandle}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>

          {/* Tracked Entities */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Competitors & Crisis Keywords</h2>
            <div className="flex space-x-2 mb-4">
              <select
                value={newEntity.type}
                onChange={(e) => setNewEntity((ne) => ({ ...ne, type: e.target.value }))}
                className="border-gray-300 rounded-md"
              >
                <option value="keyword">Keyword</option>
                <option value="reddit">Competitor (Reddit)</option>
              </select>
              <input
                type="text"
                value={newEntity.value}
                onChange={(e) => setNewEntity((ne) => ({ ...ne, value: e.target.value }))}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Add keyword or competitor"
              />
              <button
                onClick={addEntity}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add
              </button>
            </div>
            <ul className="space-y-2">
              {entities.map((entity) => (
                <li key={entity.id} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
                  <span>{entity.type}: {entity.value}</span>
                  <button
                    onClick={() => removeEntity(entity.id!)}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Alerts Toggle */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Alerts</h2>
            <div className="flex items-center justify-between">
              <span>Email & Crisis Alerts</span>
              <button
                type="button"
                onClick={() => { setAlertsEnabled((v) => !v); setTimeout(saveAlertsSetting, 100); }}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${alertsEnabled ? "bg-blue-600" : "bg-gray-200"}`}
                role="switch"
                aria-checked={alertsEnabled}
              >
                <span
                  className={`$${alertsEnabled ? "translate-x-5" : "translate-x-0"} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 