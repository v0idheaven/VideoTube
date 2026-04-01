import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { apiRequest } from "../lib/api.js";
import { useAuth } from "../state/AuthContext.jsx";

const CHIPS = [
  "All",
  "JavaScript",
  "React",
  "Node.js",
  "Music",
  "Gaming",
  "Podcasts",
  "Live",
  "Education",
  "New to you",
  "Trending",
  "Recently uploaded",
];

const buildFeedRequest = ({ query, section, page = 1 }) => {
  const params = new URLSearchParams();
  params.set("limit", "24");
  params.set("page", String(page));

  if (section === "trending") {
    params.set("sortBy", "views");
    params.set("sortType", "desc");
  }

  if (section === "shorts") {
    params.set("sortBy", "duration");
    params.set("sortType", "asc");
  }

  if (section === "music" && !query) params.set("query", "music");
  if (section === "gaming" && !query) params.set("query", "gaming");
  if (query) params.set("query", query);

  return `?${params.toString()}`;
};

const FeedExperiencePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [activeChip, setActiveChip] = useState("All");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const query = searchParams.get("q")?.trim() || "";
  const section = searchParams.get("section")?.trim() || "";

  const sectionTitle = useMemo(() => {
    if (query) return `Results for "${query}"`;
    if (section === "trending") return "Trending";
    if (section === "shorts") return "Shorts";
    if (section === "music") return "Music";
    if (section === "gaming") return "Gaming";
    return null;
  }, [query, section]);

  const loadVideos = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
      setError("");
    } else {
      setLoadingMore(true);
    }

    try {
      const suffix = buildFeedRequest({ query, section, page: pageNum });
      const response = await apiRequest(`/api/v1/videos${suffix}`, {}, { skipRefresh: true });
      let docs = response?.data?.docs || [];

      if (section === "shorts") {
        docs = docs.filter((v) => (Number(v.duration) || 0) <= 180);
      }

      const totalPages = response?.data?.totalPages || 1;
      setHasMore(pageNum < totalPages);

      if (append) {
        setVideos((prev) => {
          const seen = new Set(prev.map((v) => v._id));
          return [...prev, ...docs.filter((v) => !seen.has(v._id))];
        });
      } else {
        setVideos(docs);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [query, section]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadVideos(1, false);
  }, [query, section, user]);

  useEffect(() => {
    setActiveChip("All");
  }, [query, section]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadVideos(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, loadVideos]);

  const filteredVideos = useMemo(() => {
    if (!videos.length || query || activeChip === "All") return videos;

    if (activeChip === "New to you") {
      return [...videos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (activeChip === "Recently uploaded") {
      return [...videos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (activeChip === "Trending") {
      return [...videos].sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0));
    }

    const lowered = activeChip.toLowerCase();
    const matches = videos.filter((v) =>
      [v.title, v.description, v.ownerDetails?.username, v.owner?.username]
        .filter(Boolean)
        .some((val) => val.toLowerCase().includes(lowered))
    );

    return matches.length ? matches : videos;
  }, [activeChip, query, videos]);

  if (authLoading) {
    return <FeedSkeleton />;
  }

  return (
    <div className="space-y-0 text-white">
      {/* Category chips - sticky below header */}
      <div className="sticky top-14 z-20 -mx-4 border-b border-white/10 bg-[#0f0f0f]/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {CHIPS.map((chip) => (
            <button
              className={`yt-chip whitespace-nowrap ${chip === activeChip ? "yt-chip-active" : ""}`}
              key={chip}
              onClick={() => setActiveChip(chip)}
              type="button"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {sectionTitle ? (
        <div className="pt-6 pb-2">
          <h1 className="text-2xl font-semibold text-white">{sectionTitle}</h1>
        </div>
      ) : null}

      {loading ? (
        <FeedSkeleton />
      ) : error ? (
        <EmptyState
          action={
            <button className="gradient-button" onClick={() => loadVideos(1, false)} type="button">
              Retry
            </button>
          }
          description={error}
          title="Could not load the feed"
        />
      ) : filteredVideos.length ? (
        <>
          <div className="grid gap-x-4 gap-y-10 pt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredVideos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>

          {/* Infinite scroll trigger */}
          <div ref={loaderRef} className="py-4">
            {loadingMore ? (
              <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div className="space-y-3" key={i}>
                    <div className="aspect-video animate-pulse rounded-xl bg-[#202020]" />
                    <div className="grid grid-cols-[40px,1fr] gap-3">
                      <div className="h-9 w-9 animate-pulse rounded-full bg-[#202020]" />
                      <div className="space-y-2">
                        <div className="h-4 animate-pulse rounded bg-[#202020]" />
                        <div className="h-3 w-2/3 animate-pulse rounded bg-[#202020]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <EmptyState
          action={
            user ? (
              <Link className="gradient-button" to="/upload">
                Upload your first video
              </Link>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Link className="gradient-button" to="/register">
                  Create account
                </Link>
                <Link className="alt-button" to="/login">
                  Sign in
                </Link>
              </div>
            )
          }
          description="No published videos are showing up yet."
          title="Your feed is empty"
        />
      )}
    </div>
  );
};

const FeedSkeleton = () => (
  <div className="grid gap-x-4 gap-y-10 pt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
    {Array.from({ length: 12 }).map((_, i) => (
      <div className="space-y-3" key={i}>
        <div className="aspect-video animate-pulse rounded-xl bg-[#202020]" />
        <div className="grid grid-cols-[40px,1fr] gap-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-[#202020]" />
          <div className="space-y-2">
            <div className="h-4 animate-pulse rounded bg-[#202020]" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-[#202020]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-[#202020]" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default FeedExperiencePage;
