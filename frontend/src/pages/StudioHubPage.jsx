import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuthGate from "../components/AuthGate.jsx";
import Avatar from "../components/Avatar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StudioSidebar from "../components/StudioSidebar.jsx";
import { apiRequest } from "../lib/api.js";
import { formatCount, formatTimeAgo } from "../lib/utils.js";
import { useAuth } from "../state/AuthContext.jsx";

const StudioHubPage = () => {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [togglingVideoId, setTogglingVideoId] = useState("");
  const [deletingVideoId, setDeletingVideoId] = useState("");

  const publishedVideos = useMemo(() => videos.filter((v) => v.isPublished), [videos]);
  const draftVideos = useMemo(() => videos.filter((v) => !v.isPublished), [videos]);

  const loadStudio = async () => {
    setBusy(true);
    setError("");
    try {
      const [statsResponse, videosResponse] = await Promise.all([
        apiRequest("/api/v1/dashboard/stats"),
        apiRequest("/api/v1/dashboard/videos"),
      ]);
      setStats(statsResponse?.data || null);
      setVideos(videosResponse?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { if (user) loadStudio(); }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#272727] border-t-[#f1f1f1]" />
      </div>
    );
  }

  if (!user) {
    return <AuthGate description="Sign in to access YouTube Studio." title="Sign in to use Studio" />;
  }

  return (
    <div className="flex gap-6">
      <StudioSidebar active="dashboard" user={user} />

      <div className="min-w-0 flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#f1f1f1]">Channel dashboard</h1>
            <p className="mt-1 text-sm text-[#aaaaaa]">
              {user.fullName} · {formatCount(stats?.totalSubscribers)} subscribers
            </p>
          </div>
          <Link className="gradient-button" to="/upload">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            Upload
          </Link>
        </div>

        {message && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">{message}</div>
        )}
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Subscribers", value: stats?.totalSubscribers, sub: "Current subscribers" },
            { label: "Total views", value: stats?.totalViews, sub: "Lifetime views" },
            { label: "Total likes", value: stats?.totalLikes, sub: "Across all videos" },
            { label: "Videos", value: stats?.totalVideos, sub: `${publishedVideos.length} published · ${draftVideos.length} drafts` },
          ].map((item) => (
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-4" key={item.label}>
              <p className="text-sm text-[#aaaaaa]">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-[#f1f1f1]">{busy ? "—" : formatCount(item.value)}</p>
              <p className="mt-1 text-xs text-[#aaaaaa]">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Channel profile card */}
        <div className="grid gap-4 lg:grid-cols-[1fr,320px]">
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-5">
            <h2 className="mb-4 text-sm font-medium text-[#f1f1f1]">Latest video performance</h2>
            {videos[0] ? (
              <div className="flex gap-4">
                <Link className="block w-[200px] flex-shrink-0 overflow-hidden rounded-xl bg-[#272727]" to={`/watch/${videos[0]._id}`}>
                  <div className="aspect-video">
                    {videos[0].thumbnail?.url ? (
                      <img alt={videos[0].title} className="h-full w-full object-cover" src={videos[0].thumbnail.url} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-[#aaaaaa]">No thumbnail</div>
                    )}
                  </div>
                </Link>
                <div className="min-w-0 flex-1">
                  <Link className="line-clamp-2 text-sm font-medium text-[#f1f1f1] hover:text-white" to={`/watch/${videos[0]._id}`}>
                    {videos[0].title}
                  </Link>
                  <p className="mt-1 text-xs text-[#aaaaaa]">{formatTimeAgo(videos[0].createdAt)}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-[#272727] p-3">
                      <p className="text-xs text-[#aaaaaa]">Views</p>
                      <p className="mt-1 text-lg font-semibold text-[#f1f1f1]">{formatCount(videos[0].views)}</p>
                    </div>
                    <div className="rounded-lg bg-[#272727] p-3">
                      <p className="text-xs text-[#aaaaaa]">Likes</p>
                      <p className="mt-1 text-lg font-semibold text-[#f1f1f1]">{formatCount(videos[0].likesCount)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#aaaaaa]">No videos yet. Upload your first video to see performance data.</p>
            )}
          </div>

          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-5">
            <h2 className="mb-4 text-sm font-medium text-[#f1f1f1]">Your channel</h2>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 rounded-full" name={user.fullName} src={user.avatar} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#f1f1f1]">{user.fullName}</p>
                <p className="truncate text-xs text-[#aaaaaa]">@{user.username}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Link className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-[#aaaaaa] hover:bg-[#272727] hover:text-[#f1f1f1]" to={`/channel/${user.username}`}>
                <span>View channel</span>
                <span>›</span>
              </Link>
              <Link className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-[#aaaaaa] hover:bg-[#272727] hover:text-[#f1f1f1]" to="/settings">
                <span>Edit profile</span>
                <span>›</span>
              </Link>
              <Link className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-[#aaaaaa] hover:bg-[#272727] hover:text-[#f1f1f1]" to="/upload">
                <span>Upload video</span>
                <span>›</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Videos table */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121]">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.1)] px-5 py-4">
            <h2 className="text-sm font-medium text-[#f1f1f1]">Content</h2>
            <Link className="alt-button text-xs" to="/upload">Upload</Link>
          </div>

          {busy ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((i) => (
                <div className="flex gap-4" key={i}>
                  <div className="h-16 w-28 animate-pulse rounded-lg bg-[#272727]" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 animate-pulse rounded bg-[#272727]" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-[#272727]" />
                  </div>
                </div>
              ))}
            </div>
          ) : videos.length ? (
            <>
              {/* Table header */}
              <div className="hidden grid-cols-[minmax(0,2fr),100px,80px,80px,160px] gap-4 border-b border-[rgba(255,255,255,0.1)] px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#aaaaaa] md:grid">
                <span>Video</span>
                <span>Visibility</span>
                <span>Views</span>
                <span>Likes</span>
                <span>Actions</span>
              </div>
              <div className="divide-y divide-[rgba(255,255,255,0.1)]">
                {videos.map((video) => {
                  const thumb = video.thumbnail?.url || video.thumbnail;
                  return (
                    <div className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,2fr),100px,80px,80px,160px] md:items-center" key={video._id}>
                      <div className="flex items-center gap-3">
                        <Link className="block w-28 flex-shrink-0 overflow-hidden rounded-lg bg-[#272727]" to={`/watch/${video._id}`}>
                          <div className="aspect-video">
                            {thumb ? <img alt={video.title} className="h-full w-full object-cover" src={thumb} /> : <div className="flex h-full items-center justify-center text-xs text-[#aaaaaa]">No thumb</div>}
                          </div>
                        </Link>
                        <div className="min-w-0">
                          <Link className="line-clamp-2 text-sm font-medium text-[#f1f1f1] hover:text-white" to={`/watch/${video._id}`}>{video.title}</Link>
                          <p className="mt-0.5 text-xs text-[#aaaaaa]">{formatTimeAgo(video.createdAt)}</p>
                        </div>
                      </div>
                      <div>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${video.isPublished ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                          {video.isPublished ? "Public" : "Private"}
                        </span>
                      </div>
                      <div className="text-sm text-[#aaaaaa]">{formatCount(video.views)}</div>
                      <div className="text-sm text-[#aaaaaa]">{formatCount(video.likesCount)}</div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-full border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-xs text-[#f1f1f1] hover:bg-[#272727] disabled:opacity-50"
                          disabled={togglingVideoId === video._id || deletingVideoId === video._id}
                          onClick={async () => {
                            setTogglingVideoId(video._id);
                            setError(""); setMessage("");
                            try {
                              const response = await apiRequest(`/api/v1/videos/toggle/publish/${video._id}`, { method: "PATCH" });
                              setMessage(response?.data?.isPublished ? "Video published." : "Video set to private.");
                              await loadStudio();
                            } catch (err) { setError(err.message); }
                            finally { setTogglingVideoId(""); }
                          }}
                          type="button"
                        >
                          {togglingVideoId === video._id ? "..." : video.isPublished ? "Make private" : "Publish"}
                        </button>
                        <button
                          className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                          disabled={deletingVideoId === video._id || togglingVideoId === video._id}
                          onClick={async () => {
                            if (!window.confirm("Delete this video permanently?")) return;
                            setDeletingVideoId(video._id);
                            setError(""); setMessage("");
                            try {
                              await apiRequest(`/api/v1/videos/v/${video._id}`, { method: "DELETE" });
                              setVideos((c) => c.filter((v) => v._id !== video._id));
                              setMessage("Video deleted.");
                            } catch (err) { setError(err.message); }
                            finally { setDeletingVideoId(""); }
                          }}
                          type="button"
                        >
                          {deletingVideoId === video._id ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-8">
              <EmptyState
                description="Upload your first video to start building your channel."
                title="No videos yet"
                action={<Link className="gradient-button" to="/upload">Upload video</Link>}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudioHubPage;
