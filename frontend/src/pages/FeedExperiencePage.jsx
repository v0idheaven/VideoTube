import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { apiRequest } from "../lib/api.js";
import { formatCount } from "../lib/utils.js";
import { useAuth } from "../state/AuthContext.jsx";

const recommendationChips = [
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
];

const sectionMeta = {
  shorts: {
    eyebrow: "Shorts",
    title: "Short-form picks",
    description: "A fast vertical-style mix of clips and quick creator drops from across VideoTube.",
  },
  subscriptions: {
    eyebrow: "Subscriptions",
    title: "Latest from channels you follow",
    description: "Fresh uploads from creators you keep up with, laid out in your main home feed.",
  },
  history: {
    eyebrow: "History",
    title: "Keep watching",
    description: "Recent-style picks so you can jump back into long-form sessions without losing momentum.",
  },
  playlists: {
    eyebrow: "Playlists",
    title: "Series and saved collections",
    description: "Binge-friendly uploads arranged like playlist shelves while playlist pages are still being built out.",
  },
  liked: {
    eyebrow: "Liked videos",
    title: "Videos worth revisiting",
    description: "A replay-friendly mix that feels closer to a real liked-videos shelf.",
  },
  trending: {
    eyebrow: "Trending",
    title: "Trending now",
    description: "The most clickable mix across development, creator content, and broader entertainment.",
  },
  music: {
    eyebrow: "Music",
    title: "Music and sound-driven videos",
    description: "A music-first shelf layered into the same YouTube-style browsing surface.",
  },
  gaming: {
    eyebrow: "Gaming",
    title: "Gaming picks",
    description: "Streams, highlights, and creator uploads arranged as a clean gaming destination.",
  },
};

const FeedExperiencePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeChip, setActiveChip] = useState("All");
  const query = searchParams.get("q")?.trim() || "";
  const section = searchParams.get("section")?.trim() || "";
  const activeSectionMeta = sectionMeta[section] || null;

  useEffect(() => {
    let cancelled = false;

    const loadVideos = async () => {
      setLoading(true);
      setError("");

      try {
        const suffix = query ? `?query=${encodeURIComponent(query)}` : "";
        const response = await apiRequest(`/api/v1/videos${suffix}`, {}, { skipRefresh: true });

        if (!cancelled) {
          setVideos(response?.data?.docs || []);
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
  }, [query, section]);

  const filteredVideos = useMemo(() => {
    if (!videos.length || query || activeChip === "All") {
      return videos;
    }

    if (activeChip === "New to you") {
      return [...videos]
        .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt))
        .reverse();
    }

    const lowered = activeChip.toLowerCase();
    const matches = videos.filter((video) =>
      [video.title, video.description, video.ownerDetails?.username, video.owner?.username]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(lowered))
    );

    return matches.length ? matches : videos;
  }, [activeChip, query, videos]);

  if (authLoading) {
    return (
      <div className="yt-surface p-10 text-white">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-red-500" />
          <div>
            <p className="font-medium">Preparing your feed</p>
            <p className="mt-1 text-sm text-white/45">Checking the session and pulling the latest published videos.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div className="sticky top-14 z-20 -mx-4 border-b border-white/10 bg-[#0f0f0f]/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {recommendationChips.map((chip) => (
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

      {query || activeSectionMeta ? (
        <section className="flex flex-wrap items-end justify-between gap-4 rounded-[22px] border border-white/10 bg-[#181818] px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
              {query ? "Search" : activeSectionMeta.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
              {query ? `Results for "${query}"` : activeSectionMeta.title}
            </h1>
            {!query ? (
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/48">{activeSectionMeta.description}</p>
            ) : null}
          </div>
          <p className="text-sm text-white/42">
            {formatCount(filteredVideos.length)} video{filteredVideos.length === 1 ? "" : "s"}
          </p>
        </section>
      ) : (
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">Home</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">Recommended</h1>
          </div>
          <p className="text-sm text-white/42">
            {formatCount(filteredVideos.length)} video{filteredVideos.length === 1 ? "" : "s"}
          </p>
        </section>
      )}

      {loading ? (
        <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
            <Link className="gradient-button" to="/feed">
              Retry feed
            </Link>
          }
          description={error}
          title="Could not load the feed"
        />
      ) : filteredVideos.length ? (
        <section className="grid gap-x-4 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredVideos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </section>
      ) : (
        <EmptyState
          action={
            user ? (
              <div className="flex flex-wrap gap-3">
                <Link className="gradient-button" to="/upload">
                  Upload your first video
                </Link>
                <Link className="alt-button" to="/settings">
                  Open settings
                </Link>
              </div>
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
          description="No published videos are showing up yet. Upload something and publish it to populate the home feed."
          title="Your feed is empty"
        />
      )}
    </div>
  );
};

export default FeedExperiencePage;
