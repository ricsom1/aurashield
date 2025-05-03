interface Mention {
  id: string;
  text: string;
  source: string;
  created_at: string;
  sentiment: string;
  is_crisis: boolean;
  url: string;
  creator_handle: string;
  matched_keyword: string;
}

interface MentionsListProps {
  mentions: Mention[];
}

export default function MentionsList({ mentions }: MentionsListProps) {
  if (!mentions.length) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Mentions</h3>
        <p className="text-gray-500">No mentions available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Mentions</h3>
      <div className="space-y-4">
        {mentions.map((mention) => (
          <div
            key={mention.id}
            className={`p-4 rounded-lg ${
              mention.is_crisis ? "bg-red-50" : "bg-gray-50"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">
                  @{mention.creator_handle} • {new Date(mention.created_at).toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-gray-900">{mention.text}</p>
                {mention.matched_keyword && (
                  <p className="mt-1 text-xs text-blue-600">
                    Matched keyword: {mention.matched_keyword}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    mention.sentiment === "positive"
                      ? "bg-green-100 text-green-800"
                      : mention.sentiment === "negative"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {mention.sentiment}
                </span>
                {mention.url && (
                  <a
                    href={mention.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    View on {mention.source}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 