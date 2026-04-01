import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuthGate from "../components/AuthGate.jsx";
import Avatar from "../components/Avatar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { apiRequest } from "../lib/api.js";
import { formatCount, formatDuration, formatTimeAgo } from "../lib/utils.js";
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
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),320px]">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="flex gap-4" key={i}>
              <div className="h-24 w-[168px] flex-shrink-0 animate-pulse rounded-xl bg-[#272727]" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 animate-pulse rounded bg-[#272727]" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-[#272727]" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-[#272727]" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-xl bg-[#272727]" />
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
      {/* Left: video list — YouTube-style compact rows */}
      <div className="space-y-1">
        <h1 className="mb-4 text-2xl font-semibold text-[#f1f1f1]">Watch history</h1>

        {filteredHistory.length === 0 && searchQuery ? (
          <EmptyState description={`No results for "${searchQuery}"`} title="No matches" />
        ) : (
          filteredHistory.map((video) => {
            const owner = video.owner || {};
            const thumb = video.thumbnail?.url || video.thumbnail;
            return (
              <div className="group flex gap-4 rounded-xl px-2 py-2 hover:bg-[#272727]" key={video._id}>
                {/* Thumbnail */}
                <Link className="relative block h-24 w-[168px] flex-shrink-0 overflow-hidden rounded-xl bg-[#3f3f3f]" to={`/watch/${video._id}`}>
                  {thumb
                    ? <img alt={video.title} className="h-full w-full object-cover" loading="lazy" src={thumb} />
                    : <div className="flex h-full items-center justify-center text-xs text-[#aaaaaa]">No thumbnail</div>}
                  {video.duration != null && (
                    <span className="absolute bottom-1 right-1 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-medium text-white">
                      {formatDuration(video.duration)}
                    </span>
                  )}
                </Link>

                {/* Meta */}
                <div className="min-w-0 flex-1">
                  <Link className="line-clamp-2 text-sm font-medium leading-5 text-[#f1f1f1] hover:text-white" to={`/watch/${video._id}`}>
                    {video.title}
                  </Link>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[#aaaaaa]">
                    <Link className="hover:text-[#f1f1f1]" to={`/channel/${owner.username}`}>
                      {owner.fullName || owner.username}
                    </Link>
                    <span>·</span>
                    <span>{formatCount(video.views)} views</span>
                    <span>·</span>
                    <span>{formatTimeAgo(video.createdAt)}</span>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  className="flex-shrink-0 self-start rounded-full p-1.5 text-[#aaaaaa] opacity-0 transition hover:bg-[#3f3f3f] hover:text-[#f1f1f1] group-hover:opacity-100"
                  title="Remove from history"
                  type="button"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Right: search + manage */}
      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        {/* Search history */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-4">
          <h2 className="mb-3 text-sm font-medium text-[#f1f1f1]">Search watch history</h2>
          <div className="flex overflow-hidden rounded-full border border-[rgba(255,255,255,0.1)] bg-[#272727]">
            <div className="flex items-center pl-3 text-[#aaaaaa]">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
              </svg>
            </div>
            <input
              className="w-full bg-transparent px-3 py-2 text-sm text-[#f1f1f1] outline-none placeholder:text-[#aaaaaa]"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search watch history"
              value={searchQuery}
            />
            {searchQuery && (
              <button className="px-3 text-[#aaaaaa] hover:text-[#f1f1f1]" onClick={() => setSearchQuery("")} type="button">✕</button>
            )}
          </div>
        </div>

        {/* Manage history */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-4">
          <h2 className="mb-3 text-sm font-medium text-[#f1f1f1]">Manage all history</h2>
          <div className="space-y-3">
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#f1f1f1] hover:bg-[#272727]" type="button">
              <svg className="h-5 w-5 text-[#aaaaaa]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </svg>
              Clear all watch history
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#f1f1f1] hover:bg-[#272727]" type="button">
              <svg className="h-5 w-5 text-[#aaaaaa]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M10 15V9M14 15V9" />
              </svg>
              Pause watch history
            </button>
          </div>
          <p className="mt-3 text-xs text-[#aaaaaa]">{formatCount(history.length)} videos in history</p>
        </div>
      </aside>
    </div>
  );
};

export default HistoryPage;
