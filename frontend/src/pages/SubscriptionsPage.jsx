import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuthGate from "../components/AuthGate.jsx";
import Avatar from "../components/Avatar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { apiRequest } from "../lib/api.js";
import { formatCount } from "../lib/utils.js";
import { useAuth } from "../state/AuthContext.jsx";

const SubscriptionsPage = () => {
  const { user, loading } = useAuth();
  const [channels, setChannels] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!user?._id) { setChannels([]); setBusy(false); return; }
    let cancelled = false;
    setBusy(true);
    setError("");
    apiRequest(`/api/v1/subscriptions/u/${user._id}`)
      .then((r) => { if (!cancelled) setChannels((r?.data || []).map((i) => i.subscribedChannel).filter(Boolean)); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [user?._id]);

  const channelsWithVideos = useMemo(() => channels.filter((c) => c.latestVideo), [channels]);

  const allVideos = useMemo(() => {
    return channelsWithVideos.map((ch) => ({
      ...ch.latestVideo,
      ownerDetails: { username: ch.username, fullName: ch.fullName, avatar: ch.avatar },
    })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [channelsWithVideos]);

  const todayVideos = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return allVideos.filter((v) => new Date(v.createdAt) >= today);
  }, [allVideos]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#272727] border-t-[#f1f1f1]" />
      </div>
    );
  }

  if (!user) {
    return <AuthGate description="Sign in to see updates from your favourite channels." title="Sign in to see subscriptions" />;
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
    return <EmptyState action={<button className="alt-button" onClick={() => window.location.reload()} type="button">Retry</button>} description={error} title="Could not load subscriptions" />;
  }

  if (!channels.length) {
    return (
      <EmptyState
        action={<Link className="alt-button" to="/feed">Explore videos</Link>}
        description="Subscribe to channels to see their latest videos here."
        title="No subscriptions yet"
      />
    );
  }

  const displayVideos = activeTab === "today" ? todayVideos : allVideos;

  return (
    <div className="space-y-4 text-[#f1f1f1]">
      {/* Channel avatars row */}
      <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 pt-1">
        {channels.map((ch) => (
          <Link className="flex flex-shrink-0 flex-col items-center gap-1.5" key={ch._id} to={`/channel/${ch.username}`}>
            <div className="relative">
              <Avatar className="h-12 w-12 rounded-full" name={ch.fullName || ch.username} src={ch.avatar} />
              {ch.latestVideo && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0f0f0f] bg-[#ff0000]" />
              )}
            </div>
            <span className="max-w-[56px] truncate text-center text-[11px] text-[#aaaaaa]">{ch.fullName || ch.username}</span>
          </Link>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-[rgba(255,255,255,0.1)]">
        <div className="flex">
          {[
            { id: "all", label: "All" },
            { id: "today", label: "Today" },
            { id: "channels", label: "Channels" },
          ].map((tab) => (
            <button
              className={`border-b-2 px-6 py-3 text-sm font-medium transition ${activeTab === tab.id ? "border-[#f1f1f1] text-[#f1f1f1]" : "border-transparent text-[#aaaaaa] hover:text-[#f1f1f1]"}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === "channels" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {channels.map((ch) => (
            <Link
              className="flex items-center gap-4 rounded-xl px-4 py-3 hover:bg-[#272727]"
              key={ch._id}
              to={`/channel/${ch.username}`}
            >
              <Avatar className="h-12 w-12 rounded-full" name={ch.fullName || ch.username} src={ch.avatar} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#f1f1f1]">{ch.fullName || ch.username}</p>
                <p className="text-xs text-[#aaaaaa]">@{ch.username}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : displayVideos.length ? (
        <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayVideos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        <EmptyState
          description={activeTab === "today" ? "No new uploads from your subscriptions today." : "No recent uploads from your subscriptions."}
          title="Nothing new"
        />
      )}
    </div>
  );
};

export default SubscriptionsPage;
