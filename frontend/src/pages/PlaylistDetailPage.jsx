import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AuthGate from "../components/AuthGate.jsx";
import Avatar from "../components/Avatar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { apiRequest } from "../lib/api.js";
import { formatCount, formatTimeAgo } from "../lib/utils.js";
import { useAuth } from "../state/AuthContext.jsx";

const PlaylistDetailPage = () => {
  const { playlistId } = useParams();
  const { user, loading } = useAuth();
  const [playlist, setPlaylist] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setPlaylist(null);
      setBusy(false);
      return;
    }

    let cancelled = false;

    const loadPlaylist = async () => {
      setBusy(true);
      setError("");

      try {
        const response = await apiRequest(`/api/v1/playlists/${playlistId}`);

        if (!cancelled) {
          setPlaylist(response?.data || null);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message);
        }
      } finally {
        if (!cancelled) {
          setBusy(false);
        }
      }
    };

    loadPlaylist();

    return () => {
      cancelled = true;
    };
  }, [playlistId, user]);

  if (loading) {
    return (
      <div className="glass-panel flex items-center gap-4 p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-red-500" />
        <div>
          <p className="font-semibold text-white">Opening playlist</p>
          <p className="text-sm text-white/45">Loading playlist details and saved videos.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthGate
        description="Playlist details are currently protected by your backend, so they open after sign-in."
        title="Sign in to open playlists"
      />
    );
  }

  if (busy) {
    return (
      <div className="space-y-6">
        <div className="aspect-[2.2/1] animate-pulse rounded-[28px] bg-[#1b1b1b]" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="h-60 animate-pulse rounded-[24px] bg-[#1b1b1b]" key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <EmptyState
        action={
          <Link className="gradient-button" to="/playlists">
            Back to playlists
          </Link>
        }
        description={error || "This playlist could not be loaded."}
        title="Playlist unavailable"
      />
    );
  }

  const ownerName = playlist.owner?.fullName || playlist.owner?.username || "VideoTube creator";

  return (
    <div className="space-y-8 text-white">
      <section className="grid gap-6 xl:grid-cols-[340px,minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-[28px] border border-white/10 bg-[#181818]">
          <div className="aspect-[0.9] bg-[linear-gradient(135deg,#151515_0%,#2a1515_100%)] p-6">
            <div className="flex h-full flex-col justify-between">
              <div className="inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
                Playlist
              </div>

              <div>
                <h1 className="text-[2rem] font-semibold tracking-[-0.05em] text-white">{playlist.name}</h1>
                <p className="mt-3 text-sm leading-7 text-white/48">{playlist.description}</p>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar className="h-10 w-10 rounded-full" name={ownerName} src={playlist.owner?.avatar} />
                  <div>
                    <p className="text-sm font-medium text-white">{ownerName}</p>
                    <p className="text-xs text-white/40">@{playlist.owner?.username}</p>
                  </div>
                </div>
                <div className="mt-6 space-y-2 text-sm text-white/45">
                  <p>{formatCount(playlist.totalVideos)} videos</p>
                  <p>{formatCount(playlist.totalViews)} total views</p>
                  <p>Updated {formatTimeAgo(playlist.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">Playlist videos</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">Saved in this playlist</h2>
          </div>

          {playlist.videos?.length ? (
            <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
              {playlist.videos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={{
                    ...video,
                    ownerDetails: playlist.owner,
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              description="This playlist does not have any published videos yet."
              title="No videos in playlist"
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default PlaylistDetailPage;
