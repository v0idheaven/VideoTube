import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuthGate from "../components/AuthGate.jsx";
import EmptyState from "../components/EmptyState.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { apiRequest } from "../lib/api.js";
import { formatCount, formatTimeAgo } from "../lib/utils.js";
import { useAuth } from "../state/AuthContext.jsx";

const HistoryPage = () => {
  const { user, loading } = useAuth();
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setHistory([]);
      setBusy(false);
      return;
    }

    let cancelled = false;

    const loadHistory = async () => {
      setBusy(true);
      setError("");

      try {
        const response = await apiRequest("/api/v1/users/watch-history");

        if (!cancelled) {
          setHistory(response?.data || []);
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

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const latestVideo = history[0] || null;
  const groupedHistory = useMemo(() => history.slice(1), [history]);

  if (loading) {
    return (
      <div className="glass-panel flex items-center gap-4 p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-red-500" />
        <div>
          <p className="font-semibold text-white">Loading history</p>
          <p className="text-sm text-white/45">Pulling your recently watched videos.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthGate
        description="Watch history belongs to your account, so this page is available after sign-in."
        title="Sign in to view history"
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

  if (error) {
    return (
      <EmptyState
        action={
          <button className="gradient-button" onClick={() => window.location.reload()} type="button">
            Retry
          </button>
        }
        description={error}
        title="Could not load history"
      />
    );
  }

  if (!history.length) {
    return (
      <EmptyState
        action={
          <Link className="gradient-button" to="/feed">
            Start watching
          </Link>
        }
        description="Once you watch videos, they will appear here in a more YouTube-like history layout."
        title="No watch history yet"
      />
    );
  }

  const latestThumbnail = latestVideo?.thumbnail?.url || latestVideo?.thumbnail;

  return (
    <div className="space-y-8 text-white">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#181818]">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1.15fr),380px]">
          <Link className="block bg-black" to={`/watch/${latestVideo._id}`}>
            <div className="aspect-video">
              {latestThumbnail ? (
                <img alt={latestVideo.title} className="h-full w-full object-cover" src={latestThumbnail} />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-white/35">No thumbnail</div>
              )}
            </div>
          </Link>

          <div className="flex flex-col justify-between p-6 md:p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">History</p>
              <h1 className="mt-3 text-[2.1rem] font-semibold tracking-[-0.05em] text-white">
                Continue from where you left off
              </h1>
              <p className="mt-3 text-sm leading-7 text-white/48">
                Your latest session stays pinned here, with the rest of your watch history arranged underneath.
              </p>
            </div>

            <div className="mt-8 rounded-[24px] border border-white/10 bg-[#121212] p-5">
              <p className="line-clamp-2 text-lg font-semibold text-white">{latestVideo.title}</p>
              <p className="mt-2 text-sm text-white/45">
                {latestVideo.owner?.fullName || latestVideo.owner?.username || "VideoTube creator"}
              </p>
              <p className="mt-2 text-xs text-white/38">
                {formatCount(history.length)} videos in history | last watched {formatTimeAgo(latestVideo.createdAt)}
              </p>
              <Link className="gradient-button mt-5 justify-center !px-4 !py-2 text-sm" to={`/watch/${latestVideo._id}`}>
                Resume watching
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">Recently watched</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">Your history shelf</h2>
          </div>
          <p className="text-sm text-white/40">{formatCount(history.length)} total videos</p>
        </div>

        <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {groupedHistory.length ? (
            groupedHistory.map((video) => <VideoCard key={video._id} video={video} />)
          ) : (
            <VideoCard video={latestVideo} />
          )}
        </div>
      </section>
    </div>
  );
};

export default HistoryPage;
