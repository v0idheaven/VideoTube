import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthGate from "../components/AuthGate.jsx";
import EmptyState from "../components/EmptyState.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { apiRequest } from "../lib/api.js";
import { formatCount, formatTimeAgo } from "../lib/utils.js";
import { useAuth } from "../state/AuthContext.jsx";

const recommendationChips = [
  "All",
  "Recently uploaded",
  "Popular",
  "Backend",
  "Frontend",
  "APIs",
  "Creator tools",
  "Watched recently",
];

const FeedPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeChip, setActiveChip] = useState("All");
  const query = searchParams.get("q")?.trim() || "";

  useEffect(() => {
    if (!user) {
      setVideos([]);
      setLoading(false);
      setError("");
      return;
    }

    let cancelled = false;

    const loadVideos = async () => {
      setLoading(true);
      setError("");

      try {
        const suffix = query ? `?query=${encodeURIComponent(query)}` : "";
        const response = await apiRequest(`/api/v1/videos${suffix}`, {}, { skipRefresh: true });
        const docs = response?.data?.docs || [];

        if (!cancelled) {
          setVideos(docs);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadVideos();

    return () => {
      cancelled = true;
    };
  }, [query, user]);

  useEffect(() => {
    setActiveChip("All");
  }, [query]);

  const filteredVideos = useMemo(() => {
    if (!videos.length || activeChip === "All" || query) {
      return videos;
    }

    if (activeChip === "Recently uploaded") {
      return [...videos].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
    }

    if (activeChip === "Popular") {
      return [...videos].sort((left, right) => (Number(right.views) || 0) - (Number(left.views) || 0));
    }

    const lowered = activeChip.toLowerCase();

    return videos.filter((video) =>
      [video.title, video.description, video.ownerDetails?.username, video.owner?.username]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(lowered))
    );
  }, [activeChip, query, videos]);

  const featuredVideo = filteredVideos[0] || null;
  const spotlightVideos = filteredVideos.slice(1, 5);
  const trendingVideos = [...filteredVideos]
    .sort((left, right) => (Number(right.views) || 0) - (Number(left.views) || 0))
    .slice(0, 4);

  if (authLoading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#181818] p-10 text-white">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-red-500" />
          <div>
            <p className="font-medium">Preparing your feed</p>
            <p className="mt-1 text-sm text-white/45">Checking the session and pulling the latest videos.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthGate
        description="Sign in to open the full VideoTube experience with the YouTube-style feed, watch page, channel view, and studio."
        title="Sign in to open your feed"
      />
    );
  }

  return (
    <div className="space-y-8 text-white">
      <div className="sticky top-14 z-20 -mx-4 border-b border-white/10 bg-[#0f0f0f]/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {recommendationChips.map((chip) => (
            <button
              className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                chip === activeChip
                  ? "bg-white text-black"
                  : "bg-[#272727] text-white/86 hover:bg-[#323232]"
              }`}
              key={chip}
              onClick={() => setActiveChip(chip)}
              type="button"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {query ? (
        <section className="rounded-3xl border border-white/10 bg-[#181818] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">Search</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
            Results for "{query}"
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">
            Matching videos pulled live from your backend feed endpoint.
          </p>
        </section>
      ) : featuredVideo ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr),380px]">
          <article className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,#191919_0%,#181818_55%,#24110f_100%)]">
            <div className="grid gap-0 lg:grid-cols-[1.05fr,0.95fr]">
              <div className="flex flex-col justify-between p-6 md:p-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-red-300/80">
                    Recommended for you
                  </p>
                  <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
                    Welcome back, {user.fullName}.
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50">
                    The signed-in app now opens like a real video platform: recommended uploads, a creator rail, search, and a full watch flow on top of your backend.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link className="gradient-button" to={`/watch/${featuredVideo._id}`}>
                    Watch now
                  </Link>
                  <Link className="alt-button" to="/studio">
                    Open studio
                  </Link>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/35">Feed size</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{loading ? "--" : formatCount(videos.length)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/35">Featured creator</p>
                    <p className="mt-2 text-base font-medium text-white">
                      {featuredVideo.ownerDetails?.username || featuredVideo.owner?.username || "VideoTube"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/35">Freshness</p>
                    <p className="mt-2 text-base font-medium text-white">{formatTimeAgo(featuredVideo.createdAt)}</p>
                  </div>
                </div>
              </div>

              <Link className="relative block min-h-[320px] bg-[#0b0b0b]" to={`/watch/${featuredVideo._id}`}>
                {featuredVideo.thumbnail?.url || featuredVideo.thumbnail ? (
                  <img
                    alt={featuredVideo.title}
                    className="h-full w-full object-cover"
                    src={featuredVideo.thumbnail?.url || featuredVideo.thumbnail}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_center,#42231e_0%,#171717_58%,#111111_100%)]">
                    <div className="grid h-20 w-20 place-items-center rounded-full bg-[#ff2d2d] text-white shadow-[0_20px_60px_rgba(255,45,45,0.3)]">
                      <svg className="ml-1 h-7 w-7 fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent px-6 pb-6 pt-20">
                  <p className="max-w-[28rem] text-xl font-semibold text-white">{featuredVideo.title}</p>
                  <p className="mt-2 text-sm text-white/55">
                    {formatCount(featuredVideo.views)} views • {formatTimeAgo(featuredVideo.createdAt)}
                  </p>
                </div>
              </Link>
            </div>
          </article>

          <aside className="rounded-[28px] border border-white/10 bg-[#181818] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Up next</p>
            <div className="mt-4 space-y-4">
              {spotlightVideos.length ? (
                spotlightVideos.map((video) => <VideoCard compact key={video._id} video={video} />)
              ) : (
                <p className="text-sm text-white/45">More recommendations will appear as soon as more videos are published.</p>
              )}
            </div>
          </aside>
        </section>
      ) : null}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="space-y-3" key={index}>
              <div className="aspect-video animate-pulse rounded-2xl bg-[#202020]" />
              <div className="grid grid-cols-[40px,1fr] gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-[#202020]" />
                <div className="space-y-2">
                  <div className="h-4 animate-pulse rounded bg-[#202020]" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-[#202020]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          action={
            <Link
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              to="/feed"
            >
              Retry feed
            </Link>
          }
          description={error}
          title="Could not load the feed"
        />
      ) : filteredVideos.length ? (
        <section className="space-y-8">
          {!query && trendingVideos.length ? (
            <div className="rounded-[28px] border border-white/10 bg-[#181818] p-5">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Trending now</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Most watched right now</h2>
                </div>
                <p className="text-sm text-white/40">Sorted by views from your live feed</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {trendingVideos.map((video) => (
                  <VideoCard compact key={`trending-${video._id}`} video={video} />
                ))}
              </div>
            </div>
          ) : null}

          <section className="space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
                  {query ? "Search results" : activeChip}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                  {query ? `Results for "${query}"` : "Recommended videos"}
                </h2>
              </div>
              <p className="text-sm text-white/40">
                {formatCount(filteredVideos.length)} video{filteredVideos.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredVideos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          </section>
        </section>
      ) : (
        <EmptyState
          action={
            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                to="/studio"
              >
                Upload your first video
              </Link>
              <Link
                className="rounded-full border border-white/10 bg-[#272727] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#323232]"
                to="/settings"
              >
                Open settings
              </Link>
            </div>
          }
          description="No published videos are showing up yet. Upload something in studio and publish it to populate the home feed."
          title="Your feed is empty"
        />
      )}
    </div>
  );
};

export default FeedPage;
