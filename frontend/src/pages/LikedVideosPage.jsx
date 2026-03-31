import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuthGate from "../components/AuthGate.jsx";
import EmptyState from "../components/EmptyState.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { apiRequest } from "../lib/api.js";
import { formatCount } from "../lib/utils.js";
import { useAuth } from "../state/AuthContext.jsx";

const LikedVideosPage = () => {
  const { user, loading } = useAuth();
  const [videos, setVideos] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setVideos([]);
      setBusy(false);
      return;
    }

    let cancelled = false;

    const loadLikedVideos = async () => {
      setBusy(true);
      setError("");

      try {
        const response = await apiRequest("/api/v1/likes/videos");
        const mappedVideos = (response?.data || [])
          .map((item) => item.likedVideo)
          .filter(Boolean);

        if (!cancelled) {
          setVideos(mappedVideos);
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

    loadLikedVideos();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const featuredVideo = videos[0] || null;
  const compactShelf = useMemo(() => videos.slice(0, 5), [videos]);

  if (loading) {
    return (
      <div className="glass-panel flex items-center gap-4 p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-red-500" />
        <div>
          <p className="font-semibold text-white">Loading liked videos</p>
          <p className="text-sm text-white/45">Gathering the videos you have liked.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthGate
        description="Liked videos are stored against your account, so this page opens after sign-in."
        title="Sign in to view liked videos"
      />
    );
  }

  if (busy) {
    return (
      <div className="grid gap-6 xl:grid-cols-[340px,minmax(0,1fr)]">
        <div className="h-[520px] animate-pulse rounded-[28px] bg-[#1b1b1b]" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="h-60 animate-pulse rounded-[24px] bg-[#1b1b1b]" key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        action={
          <button className="gradient-button" onClick={() => window.location.reload()} type="button">
            Retry
          </button>
        }
        description={error}
        title="Could not load liked videos"
      />
    );
  }

  if (!videos.length) {
    return (
      <EmptyState
        action={
          <Link className="gradient-button" to="/feed">
            Browse videos
          </Link>
        }
        description="Like a few videos and they will show up here as your own watch-later style library."
        title="No liked videos yet"
      />
    );
  }

  const thumbnail = featuredVideo?.thumbnail?.url || featuredVideo?.thumbnail;

  return (
    <div className="grid gap-6 xl:grid-cols-[340px,minmax(0,1fr)] text-white">
      <aside className="overflow-hidden rounded-[28px] border border-white/10 bg-[#181818]">
        <div
          className="aspect-[0.92] bg-cover bg-center"
          style={{
            backgroundImage: thumbnail
              ? `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.86)), url(${thumbnail})`
              : "linear-gradient(135deg, #161616 0%, #2b1616 100%)",
          }}
        >
          <div className="flex h-full flex-col justify-end p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">Playlist style shelf</p>
            <h1 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-white">Liked videos</h1>
            <p className="mt-3 text-sm text-white/55">{user.fullName}</p>
            <p className="mt-2 text-sm text-white/45">{formatCount(videos.length)} saved likes</p>

            <div className="mt-6 space-y-2 rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
              {compactShelf.map((video) => (
                <Link
                  className="block truncate text-sm text-white/82 transition hover:text-white"
                  key={video._id}
                  to={`/watch/${video._id}`}
                >
                  {video.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">Library</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">Videos you liked</h2>
          </div>
          <p className="text-sm text-white/40">{formatCount(videos.length)} videos</p>
        </div>

        <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default LikedVideosPage;
