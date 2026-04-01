import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AuthGate from "../components/AuthGate.jsx";
import Avatar from "../components/Avatar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { apiRequest } from "../lib/api.js";
import { formatCount, formatDuration, formatTimeAgo } from "../lib/utils.js";
import { useAuth } from "../state/AuthContext.jsx";

const PlaylistDetailPage = () => {
  const { playlistId } = useParams();
  const { user, loading } = useAuth();
  const [playlist, setPlaylist] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

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
  const videos = playlist.videos || [];

  return (
    <div className="grid gap-0 text-[#f1f1f1] lg:grid-cols-[360px,minmax(0,1fr)]">
      {/* Left panel — sticky */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="overflow-hidden rounded-xl bg-[#212121]">
          {/* Thumbnail */}
          <div
            className="relative h-[200px] bg-cover bg-center"
            style={{
              backgroundImage: firstThumb
                ? `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.6)), url(${firstThumb})`
                : "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            }}
          >
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h1 className="text-lg font-bold text-white">{playlist.name}</h1>
            </div>
          </div>

          <div className="p-4">
            {/* Owner */}
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 rounded-full" name={ownerName} src={playlist.owner?.avatar} />
              <span className="text-sm text-[#aaaaaa]">{ownerName}</span>
            </div>

            {/* Stats */}
            <div className="mt-2 text-xs text-[#aaaaaa]">
              {formatCount(videos.length)} videos · {formatDuration(totalDuration)} · {formatCount(playlist.totalViews)} views
            </div>
            {playlist.description && (
              <p className="mt-2 text-xs text-[#aaaaaa] line-clamp-3">{playlist.description}</p>
            )}
            <p className="mt-1 text-xs text-[#aaaaaa]">Updated {formatTimeAgo(playlist.updatedAt)}</p>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              {videos[0] && (
                <Link
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black hover:bg-[#e5e5e5]"
                  to={`/watch/${videos[0]._id}`}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  Play all
                </Link>
              )}
              <button
                className="flex items-center justify-center gap-2 rounded-full bg-[#272727] px-4 py-2 text-sm font-medium text-[#f1f1f1] hover:bg-[#3f3f3f]"
                type="button"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
                </svg>
                Shuffle
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Right: numbered video list */}
      <div className="space-y-1 lg:pl-4">
        {videos.length ? (
          videos.map((video, i) => {
            const thumb = video.thumbnail?.url || video.thumbnail;
            const isActive = i === currentIndex;
            return (
              <Link
                className={`group flex items-center gap-3 rounded-xl px-3 py-2 transition ${isActive ? "bg-[#272727]" : "hover:bg-[#272727]"}`}
                key={video._id}
                onClick={() => setCurrentIndex(i)}
                to={`/watch/${video._id}`}
              >
                {/* Index / playing indicator */}
                <span className="w-5 flex-shrink-0 text-center text-xs text-[#aaaaaa]">
                  {isActive ? (
                    <svg className="mx-auto h-4 w-4 text-[#f1f1f1]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : i + 1}
                </span>

                {/* Thumbnail */}
                <div className="relative h-[54px] w-24 flex-shrink-0 overflow-hidden rounded-lg bg-[#3f3f3f]">
                  {thumb
                    ? <img alt={video.title} className="h-full w-full object-cover" src={thumb} />
                    : <div className="flex h-full items-center justify-center text-xs text-[#aaaaaa]">—</div>}
                  {video.duration != null && (
                    <span className="absolute bottom-0.5 right-0.5 rounded bg-black/85 px-1 py-0.5 text-[10px] font-medium text-white">
                      {formatDuration(video.duration)}
                    </span>
                  )}
                </div>

                {/* Meta */}
                <div className="min-w-0 flex-1">
                  <p className={`line-clamp-2 text-sm font-medium leading-5 ${isActive ? "text-[#f1f1f1]" : "text-[#f1f1f1]"}`}>
                    {video.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[#aaaaaa]">
                    {playlist.owner?.fullName || playlist.owner?.username}
                  </p>
                </div>
              </Link>
            );
          })
        ) : (
          <EmptyState description="This playlist has no videos yet." title="Empty playlist" />
        )}
      </div>
    </div>
  );
};

export default PlaylistDetailPage;
