import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AuthGate from "../components/AuthGate.jsx";
import Avatar from "../components/Avatar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { apiRequest } from "../lib/api.js";
import { formatCount, formatDuration, formatTimeAgo } from "../lib/utils.js";
import { useAuth } from "../state/AuthContext.jsx";

const PlaylistDetailPage = () => {
  const { playlistId } = useParams();
  const { user, loading } = useAuth();
  const [playlist, setPlaylist] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) { setPlaylist(null); setBusy(false); return; }
    let cancelled = false;
    setBusy(true);
    setError("");
    apiRequest(`/api/v1/playlists/${playlistId}`)
      .then((r) => { if (!cancelled) setPlaylist(r?.data || null); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, [playlistId, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#272727] border-t-[#f1f1f1]" />
      </div>
    );
  }

  if (!user) {
    return <AuthGate description="Sign in to view this playlist." title="Sign in to view playlist" />;
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

  if (error || !playlist) {
    return (
      <EmptyState
        action={<Link className="alt-button" to="/playlists">Back to playlists</Link>}
        description={error || "This playlist could not be loaded."}
        title="Playlist unavailable"
      />
    );
  }

  const ownerName = playlist.owner?.fullName || playlist.owner?.username || "VideoTube creator";
  const totalDuration = (playlist.videos || []).reduce((sum, v) => sum + (Number(v.duration) || 0), 0);
  const firstThumb = playlist.videos?.[0]?.thumbnail?.url || playlist.videos?.[0]?.thumbnail;

  return (
    <div className="grid gap-6 text-[#f1f1f1] lg:grid-cols-[360px,minmax(0,1fr)]">
      {/* Left panel */}
      <aside className="overflow-hidden rounded-xl bg-[#212121]">
        <div
          className="relative h-[200px] bg-cover bg-center"
          style={{
            backgroundImage: firstThumb
              ? `linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.75)), url(${firstThumb})`
              : "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          }}
        >
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h1 className="text-xl font-bold text-white">{playlist.name}</h1>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 rounded-full" name={ownerName} src={playlist.owner?.avatar} />
            <span className="text-sm text-[#aaaaaa]">{ownerName}</span>
          </div>
          <div className="mt-2 space-y-1 text-sm text-[#aaaaaa]">
            <p>{formatCount(playlist.totalVideos)} videos · {formatDuration(totalDuration)}</p>
            <p>{formatCount(playlist.totalViews)} views</p>
            <p>Updated {formatTimeAgo(playlist.updatedAt)}</p>
          </div>
          {playlist.description && (
            <p className="mt-3 text-sm text-[#aaaaaa]">{playlist.description}</p>
          )}
          <div className="mt-4 flex gap-2">
            {playlist.videos?.[0] && (
              <Link className="gradient-button flex-1 justify-center" to={`/watch/${playlist.videos[0]._id}`}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                Play all
              </Link>
            )}
            <button className="alt-button" type="button">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
              </svg>
              Shuffle
            </button>
          </div>
        </div>
      </aside>

      {/* Right: video list */}
      <div className="space-y-3">
        {playlist.videos?.length ? (
          playlist.videos.map((video, i) => (
            <div className="flex items-center gap-3" key={video._id}>
              <span className="w-5 flex-shrink-0 text-center text-sm text-[#aaaaaa]">{i + 1}</span>
              <div className="flex-1">
                <VideoCard compact video={{ ...video, ownerDetails: playlist.owner }} />
              </div>
            </div>
          ))
        ) : (
          <EmptyState description="This playlist has no videos yet." title="Empty playlist" />
        )}
      </div>
    </div>
  );
};

export default PlaylistDetailPage;
