import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuthGate from "../components/AuthGate.jsx";
import Avatar from "../components/Avatar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { apiRequest } from "../lib/api.js";
import { formatCount, formatDuration } from "../lib/utils.js";
import { useAuth } from "../state/AuthContext.jsx";

const LikedVideosPage = () => {
  const { user, loading } = useAuth();
  const [videos, setVideos] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) { setVideos([]); setBusy(false); return; }
    let cancelled = false;
    setBusy(true);
    setError("");
    apiRequest("/api/v1/likes/videos")
      .then((r) => { if (!cancelled) setVideos((r?.data || []).map((i) => i.likedVideo).filter(Boolean)); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [user]);

  const totalDuration = useMemo(
    () => videos.reduce((sum, v) => sum + (Number(v.duration) || 0), 0),
    [videos]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#272727] border-t-[#f1f1f1]" />
      </div>
    );
  }

  if (!user) {
    return <AuthGate description="Sign in to see videos you've liked." title="Sign in to view liked videos" />;
  }

  if (busy) {
    return (
      <div className="grid gap-6 lg:grid-cols-[360px,minmax(0,1fr)]">
        <div className="h-[480px] animate-pulse rounded-xl bg-[#272727]" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="flex gap-3" key={i}>
              <div className="h-20 w-36 animate-pulse rounded-xl bg-[#272727]" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 animate-pulse rounded bg-[#272727]" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-[#272727]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <EmptyState action={<button className="alt-button" onClick={() => window.location.reload()} type="button">Retry</button>} description={error} title="Could not load liked videos" />;
  }

  if (!videos.length) {
    return (
      <EmptyState
        action={<Link className="alt-button" to="/feed">Browse videos</Link>}
        description="Videos you like will appear here."
        title="No liked videos"
      />
    );
  }

  const firstThumb = videos[0]?.thumbnail?.url || videos[0]?.thumbnail;

  return (
    <div className="grid gap-6 text-[#f1f1f1] lg:grid-cols-[360px,minmax(0,1fr)]">
      {/* Left panel */}
      <aside className="overflow-hidden rounded-xl bg-[#212121]">
        <div
          className="relative h-[240px] bg-cover bg-center"
          style={{
            backgroundImage: firstThumb
              ? `linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.7)), url(${firstThumb})`
              : "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          }}
        >
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h1 className="text-2xl font-bold text-white">Liked videos</h1>
            <div className="mt-1 flex items-center gap-2">
              <Avatar className="h-5 w-5 rounded-full" name={user.fullName} src={user.avatar} />
              <span className="text-sm text-white/80">{user.fullName}</span>
            </div>
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm text-[#aaaaaa]">{formatCount(videos.length)} videos · {formatDuration(totalDuration)}</p>
          <div className="mt-4 flex gap-2">
            <Link className="gradient-button flex-1 justify-center" to={`/watch/${videos[0]._id}`}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              Play all
            </Link>
            <button className="alt-button" type="button">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
              </svg>
              Shuffle
            </button>
          </div>

          {/* Mini list */}
          <div className="mt-4 space-y-2">
            {videos.slice(0, 5).map((video, i) => (
              <Link className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-[#272727]" key={video._id} to={`/watch/${video._id}`}>
                <span className="w-4 flex-shrink-0 text-center text-xs text-[#aaaaaa]">{i + 1}</span>
                <div className="h-10 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[#272727]">
                  {video.thumbnail?.url ? <img alt={video.title} className="h-full w-full object-cover" src={video.thumbnail.url} /> : null}
                </div>
                <p className="line-clamp-2 flex-1 text-xs text-[#f1f1f1]">{video.title}</p>
              </Link>
            ))}
            {videos.length > 5 && (
              <p className="px-2 text-xs text-[#aaaaaa]">+{videos.length - 5} more videos</p>
            )}
          </div>
        </div>
      </aside>

      {/* Right: full list */}
      <div className="space-y-3">
        {videos.map((video, i) => (
          <div className="flex items-center gap-3" key={video._id}>
            <span className="w-5 flex-shrink-0 text-center text-sm text-[#aaaaaa]">{i + 1}</span>
            <div className="flex-1">
              <VideoCard compact video={video} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikedVideosPage;
