import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings - AuraShield",
  description: "Configure your AuraShield dashboard settings.",
};

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Configure your AuraShield dashboard preferences and integrations.
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure your MenuIQ dashboard preferences and integrations.
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
          {/* API Keys Section */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">API Keys</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="openai-key" className="block text-sm font-medium text-gray-700">
                  OpenAI API Key
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="openai-key"
                    id="openai-key"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="sk-..."
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Required for AI-powered summaries and analysis.
                </p>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="notifications" className="block text-sm font-medium text-gray-700">
                    Email Notifications
                  </label>
                  <p className="mt-1 text-sm text-gray-500">
                    Receive updates about new reviews and mentions.
                  </p>
                </div>
                <button
                  type="button"
                  className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-gray-200"
                  role="switch"
                  aria-checked="false"
                >
                  <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 