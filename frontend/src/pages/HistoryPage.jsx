import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuthGate from "../components/AuthGate.jsx";
import EmptyState from "../components/EmptyState.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { apiRequest } from "../lib/api.js";
import { formatCount } from "../lib/utils.js";
import { useAuth } from "../state/AuthContext.jsx";

const HistoryPage = () => {
  const { user, loading } = useAuth();
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) { setHistory([]); setBusy(false); return; }
    let cancelled = false;
    setBusy(true);
    setError("");
    apiRequest("/api/v1/users/watch-history")
      .then((r) => { if (!cancelled) setHistory(r?.data || []); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [user]);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter((v) =>
      v.title?.toLowerCase().includes(q) ||
      (v.owner?.fullName || v.owner?.username || "").toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#272727] border-t-[#f1f1f1]" />
      </div>
    );
  }

  if (!user) {
    return <AuthGate description="Sign in to see your watch history." title="Sign in to view history" />;
  }

  if (busy) {
    return (
      <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="space-y-3" key={i}>
            <div className="aspect-video animate-pulse rounded-xl bg-[#272727]" />
            <div className="flex gap-3">
              <div className="h-9 w-9 animate-pulse rounded-full bg-[#272727]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 animate-pulse rounded bg-[#272727]" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-[#272727]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <EmptyState action={<button className="alt-button" onClick={() => window.location.reload()} type="button">Retry</button>} description={error} title="Could not load history" />;
  }

  if (!history.length) {
    return (
      <EmptyState
        action={<Link className="alt-button" to="/feed">Start watching</Link>}
        description="Videos you watch will appear here."
        title="No watch history"
      />
    );
  }

  return (
    <div className="grid gap-6 text-[#f1f1f1] lg:grid-cols-[minmax(0,1fr),320px]">
      {/* Main: video grid */}
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-[#f1f1f1]">Watch history</h1>

        <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
          {filteredHistory.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>

        {filteredHistory.length === 0 && searchQuery && (
          <EmptyState description={`No results for "${searchQuery}"`} title="No matches" />
        )}
      </div>

      {/* Right: search + manage */}
      <aside className="space-y-4">
        <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-4">
          <h2 className="mb-3 text-sm font-medium text-[#f1f1f1]">Search history</h2>
          <div className="flex overflow-hidden rounded-full border border-[rgba(255,255,255,0.1)] bg-[#272727]">
            <input
              className="w-full bg-transparent px-4 py-2 text-sm text-[#f1f1f1] outline-none placeholder:text-[#aaaaaa]"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search watch history"
              value={searchQuery}
            />
            {searchQuery && (
              <button className="px-3 text-[#aaaaaa] hover:text-[#f1f1f1]" onClick={() => setSearchQuery("")} type="button">✕</button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-4">
          <h2 className="mb-3 text-sm font-medium text-[#f1f1f1]">Manage history</h2>
          <div className="space-y-2 text-sm text-[#aaaaaa]">
            <p>{formatCount(history.length)} videos in history</p>
            <p className="text-xs">History is stored on your account and helps improve recommendations.</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default HistoryPage;
