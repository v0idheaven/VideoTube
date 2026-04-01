import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthGate from "../components/AuthGate.jsx";
import Avatar from "../components/Avatar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StudioSidebar from "../components/StudioSidebar.jsx";
import { apiRequest } from "../lib/api.js";
import { formatCount, formatTimeAgo } from "../lib/utils.js";
import { useAuth } from "../state/AuthContext.jsx";

/* ── Analytics bar chart ── */
const BarChart = ({ data, label }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-[#aaaaaa]">{label}</p>
      <div className="flex items-end gap-1 h-24">
        {data.map((d, i) => (
          <div className="flex flex-1 flex-col items-center gap-1" key={i}>
            <div
              className="w-full rounded-t bg-[#3ea6ff] transition-all"
              style={{ height: `${Math.max((d.value / max) * 80, 2)}px` }}
              title={`${d.label}: ${formatCount(d.value)}`}
            />
            <span className="text-[9px] text-[#aaaaaa] truncate w-full text-center">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Dashboard view ── */
const DashboardView = ({ stats, videos, busy, user, loadStudio }) => {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [togglingVideoId, setTogglingVideoId] = useState("");
  const [deletingVideoId, setDeletingVideoId] = useState("");
  const publishedVideos = useMemo(() => videos.filter((v) => v.isPublished), [videos]);
  const draftVideos = useMemo(() => videos.filter((v) => !v.isPublished), [videos]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#f1f1f1]">Channel dashboard</h1>
          <p className="mt-1 text-sm text-[#aaaaaa]">{user.fullName} · {formatCount(stats?.totalSubscribers)} subscribers</p>
        </div>
        <Link className="gradient-button" to="/upload">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
          Upload
        </Link>
      </div>

      {message && <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">{message}</div>}
      {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

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

      {/* Latest video + channel card */}
      <div className="grid gap-4 lg:grid-cols-[1fr,320px]">
        <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-5">
          <h2 className="mb-4 text-sm font-medium text-[#f1f1f1]">Latest video performance</h2>
          {videos[0] ? (
            <div className="flex gap-4">
              <Link className="block w-[200px] flex-shrink-0 overflow-hidden rounded-xl bg-[#272727]" to={`/watch/${videos[0]._id}`}>
                <div className="aspect-video">
                  {videos[0].thumbnail?.url
                    ? <img alt={videos[0].title} className="h-full w-full object-cover" src={videos[0].thumbnail.url} />
                    : <div className="flex h-full items-center justify-center text-xs text-[#aaaaaa]">No thumbnail</div>}
                </div>
              </Link>
              <div className="min-w-0 flex-1">
                <Link className="line-clamp-2 text-sm font-medium text-[#f1f1f1] hover:text-white" to={`/watch/${videos[0]._id}`}>{videos[0].title}</Link>
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
          <div className="mt-4 space-y-1">
            <Link className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-[#aaaaaa] hover:bg-[#272727] hover:text-[#f1f1f1]" to={`/channel/${user.username}`}><span>View channel</span><span>›</span></Link>
            <Link className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-[#aaaaaa] hover:bg-[#272727] hover:text-[#f1f1f1]" to="/settings"><span>Edit profile</span><span>›</span></Link>
            <Link className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-[#aaaaaa] hover:bg-[#272727] hover:text-[#f1f1f1]" to="/upload"><span>Upload video</span><span>›</span></Link>
          </div>
        </div>
      </div>

      {/* Recent uploads */}
      <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121]">
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.1)] px-5 py-4">
          <h2 className="text-sm font-medium text-[#f1f1f1]">Recent uploads</h2>
          <Link className="alt-button text-xs" to="/upload">Upload</Link>
        </div>
        {busy ? (
          <div className="space-y-3 p-5">
            {[1,2,3].map((i) => <div className="flex gap-4" key={i}><div className="h-16 w-28 animate-pulse rounded-lg bg-[#272727]" /><div className="flex-1 space-y-2 py-1"><div className="h-4 animate-pulse rounded bg-[#272727]" /><div className="h-3 w-1/3 animate-pulse rounded bg-[#272727]" /></div></div>)}
          </div>
        ) : videos.slice(0, 5).length ? (
          <div className="divide-y divide-[rgba(255,255,255,0.1)]">
            {videos.slice(0, 5).map((video) => {
              const thumb = video.thumbnail?.url || video.thumbnail;
              return (
                <div className="flex items-center gap-4 px-5 py-3" key={video._id}>
                  <Link className="block w-24 flex-shrink-0 overflow-hidden rounded-lg bg-[#272727]" to={`/watch/${video._id}`}>
                    <div className="aspect-video">{thumb ? <img alt={video.title} className="h-full w-full object-cover" src={thumb} /> : <div className="flex h-full items-center justify-center text-xs text-[#aaaaaa]">—</div>}</div>
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link className="line-clamp-1 text-sm font-medium text-[#f1f1f1] hover:text-white" to={`/watch/${video._id}`}>{video.title}</Link>
                    <p className="mt-0.5 text-xs text-[#aaaaaa]">{formatTimeAgo(video.createdAt)} · {formatCount(video.views)} views</p>
                  </div>
                  <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${video.isPublished ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                    {video.isPublished ? "Public" : "Private"}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8"><EmptyState description="Upload your first video to start building your channel." title="No videos yet" action={<Link className="gradient-button" to="/upload">Upload video</Link>} /></div>
        )}
      </div>
    </div>
  );
};

/* ── Content view ── */
const ContentView = ({ videos, busy, loadStudio }) => {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [togglingVideoId, setTogglingVideoId] = useState("");
  const [deletingVideoId, setDeletingVideoId] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "published") return videos.filter((v) => v.isPublished);
    if (filter === "private") return videos.filter((v) => !v.isPublished);
    return videos;
  }, [videos, filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#f1f1f1]">Content</h1>
        <Link className="gradient-button" to="/upload">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
          Upload
        </Link>
      </div>

      {message && <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">{message}</div>}
      {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-[rgba(255,255,255,0.1)] pb-0">
        {[["all","All"],["published","Published"],["private","Private"]].map(([id, label]) => (
          <button
            className={`border-b-2 px-4 py-3 text-sm font-medium transition ${filter === id ? "border-[#f1f1f1] text-[#f1f1f1]" : "border-transparent text-[#aaaaaa] hover:text-[#f1f1f1]"}`}
            key={id}
            onClick={() => setFilter(id)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121]">
        {busy ? (
          <div className="space-y-3 p-5">
            {[1,2,3,4].map((i) => <div className="flex gap-4" key={i}><div className="h-16 w-28 animate-pulse rounded-lg bg-[#272727]" /><div className="flex-1 space-y-2 py-1"><div className="h-4 animate-pulse rounded bg-[#272727]" /><div className="h-3 w-1/3 animate-pulse rounded bg-[#272727]" /></div></div>)}
          </div>
        ) : filtered.length ? (
          <>
            <div className="hidden grid-cols-[minmax(0,2fr),100px,80px,80px,80px,160px] gap-4 border-b border-[rgba(255,255,255,0.1)] px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#aaaaaa] md:grid">
              <span>Video</span><span>Visibility</span><span>Date</span><span>Views</span><span>Likes</span><span>Actions</span>
            </div>
            <div className="divide-y divide-[rgba(255,255,255,0.1)]">
              {filtered.map((video) => {
                const thumb = video.thumbnail?.url || video.thumbnail;
                return (
                  <div className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,2fr),100px,80px,80px,80px,160px] md:items-center" key={video._id}>
                    <div className="flex items-center gap-3">
                      <Link className="block w-28 flex-shrink-0 overflow-hidden rounded-lg bg-[#272727]" to={`/watch/${video._id}`}>
                        <div className="aspect-video">{thumb ? <img alt={video.title} className="h-full w-full object-cover" src={thumb} /> : <div className="flex h-full items-center justify-center text-xs text-[#aaaaaa]">—</div>}</div>
                      </Link>
                      <div className="min-w-0">
                        <Link className="line-clamp-2 text-sm font-medium text-[#f1f1f1] hover:text-white" to={`/watch/${video._id}`}>{video.title}</Link>
                        <p className="mt-0.5 text-xs text-[#aaaaaa]">{formatTimeAgo(video.createdAt)}</p>
                      </div>
                    </div>
                    <div><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${video.isPublished ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>{video.isPublished ? "Public" : "Private"}</span></div>
                    <div className="text-xs text-[#aaaaaa]">{new Date(video.createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</div>
                    <div className="text-sm text-[#aaaaaa]">{formatCount(video.views)}</div>
                    <div className="text-sm text-[#aaaaaa]">{formatCount(video.likesCount)}</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="rounded-full border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-xs text-[#f1f1f1] hover:bg-[#272727] disabled:opacity-50"
                        disabled={togglingVideoId === video._id || deletingVideoId === video._id}
                        onClick={async () => {
                          setTogglingVideoId(video._id); setError(""); setMessage("");
                          try {
                            const r = await apiRequest(`/api/v1/videos/toggle/publish/${video._id}`, { method: "PATCH" });
                            setMessage(r?.data?.isPublished ? "Video published." : "Video set to private.");
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
                          setDeletingVideoId(video._id); setError(""); setMessage("");
                          try {
                            await apiRequest(`/api/v1/videos/v/${video._id}`, { method: "DELETE" });
                            setMessage("Video deleted.");
                            await loadStudio();
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
          <div className="p-8"><EmptyState description="No videos match this filter." title="No videos" action={<Link className="gradient-button" to="/upload">Upload video</Link>} /></div>
        )}
      </div>
    </div>
  );
};

/* ── Analytics view ── */
const AnalyticsView = ({ stats, videos, busy }) => {
  const topVideos = useMemo(
    () => [...videos].sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0)).slice(0, 5),
    [videos]
  );
  const topByLikes = useMemo(
    () => [...videos].sort((a, b) => (Number(b.likesCount) || 0) - (Number(a.likesCount) || 0)).slice(0, 5),
    [videos]
  );

  const viewsChartData = topVideos.map((v) => ({
    label: v.title.slice(0, 8) + (v.title.length > 8 ? "…" : ""),
    value: Number(v.views) || 0,
  }));

  const likesChartData = topByLikes.map((v) => ({
    label: v.title.slice(0, 8) + (v.title.length > 8 ? "…" : ""),
    value: Number(v.likesCount) || 0,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#f1f1f1]">Analytics</h1>

      {/* Overview stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Subscribers", value: stats?.totalSubscribers, change: "+0 last 28 days" },
          { label: "Views", value: stats?.totalViews, change: "Lifetime total" },
          { label: "Likes", value: stats?.totalLikes, change: "Across all videos" },
          { label: "Videos", value: stats?.totalVideos, change: "Total uploads" },
        ].map((item) => (
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-4" key={item.label}>
            <p className="text-sm text-[#aaaaaa]">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-[#f1f1f1]">{busy ? "—" : formatCount(item.value)}</p>
            <p className="mt-1 text-xs text-[#aaaaaa]">{item.change}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {videos.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-5">
            <h2 className="mb-4 text-sm font-medium text-[#f1f1f1]">Views by video</h2>
            {viewsChartData.length ? <BarChart data={viewsChartData} label="Top 5 videos by views" /> : <p className="text-sm text-[#aaaaaa]">No data yet.</p>}
          </div>
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-5">
            <h2 className="mb-4 text-sm font-medium text-[#f1f1f1]">Likes by video</h2>
            {likesChartData.length ? <BarChart data={likesChartData} label="Top 5 videos by likes" /> : <p className="text-sm text-[#aaaaaa]">No data yet.</p>}
          </div>
        </div>
      )}

      {/* Top videos table */}
      <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121]">
        <div className="border-b border-[rgba(255,255,255,0.1)] px-5 py-4">
          <h2 className="text-sm font-medium text-[#f1f1f1]">Top videos</h2>
        </div>
        {busy ? (
          <div className="space-y-3 p-5">{[1,2,3].map((i) => <div className="h-10 animate-pulse rounded bg-[#272727]" key={i} />)}</div>
        ) : topVideos.length ? (
          <>
            <div className="hidden grid-cols-[minmax(0,2fr),100px,100px,100px] gap-4 border-b border-[rgba(255,255,255,0.1)] px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#aaaaaa] md:grid">
              <span>Video</span><span>Views</span><span>Likes</span><span>Status</span>
            </div>
            <div className="divide-y divide-[rgba(255,255,255,0.1)]">
              {topVideos.map((video, i) => {
                const thumb = video.thumbnail?.url || video.thumbnail;
                return (
                  <div className="grid gap-4 px-5 py-3 md:grid-cols-[minmax(0,2fr),100px,100px,100px] md:items-center" key={video._id}>
                    <div className="flex items-center gap-3">
                      <span className="w-5 flex-shrink-0 text-center text-sm font-medium text-[#aaaaaa]">{i + 1}</span>
                      <Link className="block w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[#272727]" to={`/watch/${video._id}`}>
                        <div className="aspect-video">{thumb ? <img alt={video.title} className="h-full w-full object-cover" src={thumb} /> : null}</div>
                      </Link>
                      <Link className="line-clamp-2 text-sm text-[#f1f1f1] hover:text-white" to={`/watch/${video._id}`}>{video.title}</Link>
                    </div>
                    <div className="text-sm text-[#f1f1f1]">{formatCount(video.views)}</div>
                    <div className="text-sm text-[#f1f1f1]">{formatCount(video.likesCount)}</div>
                    <div><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${video.isPublished ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"}`}>{video.isPublished ? "Public" : "Private"}</span></div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="p-8"><EmptyState description="Upload videos to see analytics." title="No data yet" /></div>
        )}
      </div>
    </div>
  );
};

/* ── Comments view ── */
const CommentsView = ({ videos, busy }) => {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    if (!videos.length) return;
    const firstId = videos[0]?._id;
    if (firstId) { setSelectedVideoId(firstId); loadComments(firstId); }
  }, [videos]);

  const loadComments = async (videoId) => {
    setLoadingComments(true);
    try {
      const r = await apiRequest(`/api/v1/comments/${videoId}?limit=50`);
      setComments(r?.data?.docs || []);
    } catch { setComments([]); }
    finally { setLoadingComments(false); }
  };

  const handleVideoSelect = (videoId) => {
    setSelectedVideoId(videoId);
    loadComments(videoId);
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    setDeletingId(commentId);
    try {
      await apiRequest(`/api/v1/comments/c/${commentId}`, { method: "DELETE" });
      setComments((c) => c.filter((cm) => cm._id !== commentId));
    } finally { setDeletingId(""); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#f1f1f1]">Comments</h1>

      <div className="grid gap-4 lg:grid-cols-[280px,minmax(0,1fr)]">
        {/* Video selector */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[#aaaaaa]">Select video</p>
          {busy ? (
            <div className="space-y-2">{[1,2,3].map((i) => <div className="h-10 animate-pulse rounded-lg bg-[#272727]" key={i} />)}</div>
          ) : videos.length ? (
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {videos.map((video) => {
                const thumb = video.thumbnail?.url || video.thumbnail;
                return (
                  <button
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${selectedVideoId === video._id ? "bg-[#272727]" : "hover:bg-[#272727]"}`}
                    key={video._id}
                    onClick={() => handleVideoSelect(video._id)}
                    type="button"
                  >
                    <div className="h-9 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[#3f3f3f]">
                      {thumb ? <img alt={video.title} className="h-full w-full object-cover" src={thumb} /> : null}
                    </div>
                    <p className="line-clamp-2 text-xs text-[#f1f1f1]">{video.title}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[#aaaaaa]">No videos yet.</p>
          )}
        </div>

        {/* Comments list */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121]">
          <div className="border-b border-[rgba(255,255,255,0.1)] px-5 py-4">
            <h2 className="text-sm font-medium text-[#f1f1f1]">
              {comments.length} comment{comments.length !== 1 ? "s" : ""}
            </h2>
          </div>
          {loadingComments ? (
            <div className="space-y-4 p-5">
              {[1,2,3].map((i) => (
                <div className="flex gap-3" key={i}>
                  <div className="h-9 w-9 animate-pulse rounded-full bg-[#272727]" />
                  <div className="flex-1 space-y-2"><div className="h-4 animate-pulse rounded bg-[#272727]" /><div className="h-3 w-2/3 animate-pulse rounded bg-[#272727]" /></div>
                </div>
              ))}
            </div>
          ) : comments.length ? (
            <div className="divide-y divide-[rgba(255,255,255,0.1)]">
              {comments.map((cm) => (
                <div className="flex items-start gap-3 px-5 py-4" key={cm._id}>
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#3f3f3f] text-xs font-medium text-[#f1f1f1]">
                    {(cm.owner?.fullName || cm.owner?.username || "?")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-[#f1f1f1]">{cm.owner?.fullName || cm.owner?.username}</span>
                      <span className="text-xs text-[#aaaaaa]">{formatTimeAgo(cm.createdAt)}</span>
                      <span className="text-xs text-[#aaaaaa]">· {formatCount(cm.likesCount)} likes</span>
                    </div>
                    <p className="mt-1 text-sm text-[#f1f1f1]">{cm.content}</p>
                  </div>
                  <button
                    className="flex-shrink-0 rounded-full p-1.5 text-[#aaaaaa] hover:bg-[#272727] hover:text-red-400 disabled:opacity-50"
                    disabled={deletingId === cm._id}
                    onClick={() => handleDelete(cm._id)}
                    title="Delete comment"
                    type="button"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8"><EmptyState description="No comments on this video yet." title="No comments" /></div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Subtitles view ── */
const SubtitlesView = ({ videos, busy }) => {
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  useEffect(() => {
    if (videos.length && !selectedVideoId) setSelectedVideoId(videos[0]?._id || null);
  }, [videos]);

  const selectedVideo = videos.find((v) => v._id === selectedVideoId) || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#f1f1f1]">Subtitles</h1>
        <p className="mt-1 text-sm text-[#aaaaaa]">Add or manage subtitles and closed captions for your videos.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px,minmax(0,1fr)]">
        {/* Video selector */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[#aaaaaa]">Select video</p>
          {busy ? (
            <div className="space-y-2">{[1,2,3].map((i) => <div className="h-10 animate-pulse rounded-lg bg-[#272727]" key={i} />)}</div>
          ) : videos.length ? (
            <div className="max-h-[400px] space-y-1 overflow-y-auto">
              {videos.map((video) => {
                const thumb = video.thumbnail?.url || video.thumbnail;
                return (
                  <button
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${selectedVideoId === video._id ? "bg-[#272727]" : "hover:bg-[#272727]"}`}
                    key={video._id}
                    onClick={() => setSelectedVideoId(video._id)}
                    type="button"
                  >
                    <div className="h-9 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[#3f3f3f]">
                      {thumb ? <img alt={video.title} className="h-full w-full object-cover" src={thumb} /> : null}
                    </div>
                    <p className="line-clamp-2 text-xs text-[#f1f1f1]">{video.title}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[#aaaaaa]">No videos yet.</p>
          )}
        </div>

        {/* Subtitles panel */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-5">
          {selectedVideo ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-[#272727]">
                  {selectedVideo.thumbnail?.url ? (
                    <img alt={selectedVideo.title} className="h-full w-full object-cover" src={selectedVideo.thumbnail.url} />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#f1f1f1]">{selectedVideo.title}</p>
                  <p className="mt-0.5 text-xs text-[#aaaaaa]">{formatTimeAgo(selectedVideo.createdAt)}</p>
                </div>
              </div>

              <div className="border-t border-[rgba(255,255,255,0.1)] pt-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-[#f1f1f1]">Subtitles / CC</h2>
                  <button
                    className="flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.2)] px-3 py-1.5 text-xs text-[#f1f1f1] hover:bg-[#272727]"
                    type="button"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add language
                  </button>
                </div>

                <div className="mt-4 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#272727]">
                  <div className="grid grid-cols-[1fr,120px,120px] gap-4 border-b border-[rgba(255,255,255,0.1)] px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#aaaaaa]">
                    <span>Language</span>
                    <span>Title</span>
                    <span>Status</span>
                  </div>
                  <div className="px-4 py-8 text-center">
                    <svg className="mx-auto h-10 w-10 text-[#3f3f3f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M7 15h4M7 11h10" />
                    </svg>
                    <p className="mt-3 text-sm text-[#aaaaaa]">No subtitles added yet.</p>
                    <p className="mt-1 text-xs text-[#aaaaaa]">Add subtitles to make your video accessible to more viewers.</p>
                    <button
                      className="mt-4 rounded-full bg-[#3ea6ff] px-4 py-2 text-sm font-medium text-black hover:bg-[#5bb8ff]"
                      type="button"
                    >
                      Add subtitles
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-[#aaaaaa]">Select a video to manage its subtitles.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Audio Library view ── */
const AUDIO_TRACKS = [
  { id: 1, title: "Acoustic Breeze", artist: "Benjamin Tissot", genre: "Acoustic", duration: "2:23", mood: "Happy" },
  { id: 2, title: "Better Days", artist: "Bensound", genre: "Cinematic", duration: "2:33", mood: "Inspirational" },
  { id: 3, title: "Creative Minds", artist: "Benjamin Tissot", genre: "Jazz", duration: "2:12", mood: "Calm" },
  { id: 4, title: "Cute", artist: "Bensound", genre: "Acoustic", duration: "2:42", mood: "Happy" },
  { id: 5, title: "Dreams", artist: "Bensound", genre: "Cinematic", duration: "3:14", mood: "Inspirational" },
  { id: 6, title: "Enigmatic", artist: "Benjamin Tissot", genre: "Electronic", duration: "2:18", mood: "Dark" },
  { id: 7, title: "Funny Song", artist: "Bensound", genre: "Acoustic", duration: "1:42", mood: "Funny" },
  { id: 8, title: "Happiness", artist: "Benjamin Tissot", genre: "Acoustic", duration: "2:05", mood: "Happy" },
  { id: 9, title: "Hey!", artist: "Bensound", genre: "Pop", duration: "2:38", mood: "Energetic" },
  { id: 10, title: "Jazzy Frenchy", artist: "Benjamin Tissot", genre: "Jazz", duration: "1:58", mood: "Calm" },
  { id: 11, title: "Little Idea", artist: "Bensound", genre: "Acoustic", duration: "1:32", mood: "Happy" },
  { id: 12, title: "Memories", artist: "Benjamin Tissot", genre: "Cinematic", duration: "3:02", mood: "Sad" },
];

const AudioLibraryView = () => {
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");
  const [playing, setPlaying] = useState(null);

  const genres = ["All", "Acoustic", "Cinematic", "Jazz", "Electronic", "Pop"];

  const filtered = AUDIO_TRACKS.filter((t) => {
    const matchesGenre = activeGenre === "All" || t.genre === activeGenre;
    const matchesSearch = !search.trim() || t.title.toLowerCase().includes(search.toLowerCase()) || t.artist.toLowerCase().includes(search.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#f1f1f1]">Audio Library</h1>
        <p className="mt-1 text-sm text-[#aaaaaa]">Free music and sound effects for your videos.</p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 overflow-hidden rounded-full border border-[rgba(255,255,255,0.1)] bg-[#212121]">
          <div className="flex items-center pl-4 text-[#aaaaaa]">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
            </svg>
          </div>
          <input
            className="w-full bg-transparent px-3 py-2.5 text-sm text-[#f1f1f1] outline-none placeholder:text-[#aaaaaa]"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or artist"
            value={search}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {genres.map((g) => (
            <button
              className={`yt-chip flex-shrink-0 ${activeGenre === g ? "yt-chip-active" : ""}`}
              key={g}
              onClick={() => setActiveGenre(g)}
              type="button"
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Track list */}
      <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121]">
        <div className="hidden grid-cols-[40px,minmax(0,1fr),140px,100px,80px,80px] gap-4 border-b border-[rgba(255,255,255,0.1)] px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#aaaaaa] sm:grid">
          <span />
          <span>Track</span>
          <span>Artist</span>
          <span>Genre</span>
          <span>Duration</span>
          <span>Mood</span>
        </div>

        {filtered.length ? (
          <div className="divide-y divide-[rgba(255,255,255,0.1)]">
            {filtered.map((track) => {
              const isPlaying = playing === track.id;
              return (
                <div
                  className="grid grid-cols-[40px,minmax(0,1fr)] gap-4 px-4 py-3 hover:bg-[#272727] sm:grid-cols-[40px,minmax(0,1fr),140px,100px,80px,80px] sm:items-center"
                  key={track.id}
                >
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3f3f3f] text-[#f1f1f1] hover:bg-[#3ea6ff] hover:text-black transition"
                    onClick={() => setPlaying(isPlaying ? null : track.id)}
                    type="button"
                  >
                    {isPlaying ? (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-medium ${isPlaying ? "text-[#3ea6ff]" : "text-[#f1f1f1]"}`}>{track.title}</p>
                    <p className="truncate text-xs text-[#aaaaaa] sm:hidden">{track.artist} · {track.genre} · {track.duration}</p>
                  </div>
                  <p className="hidden truncate text-sm text-[#aaaaaa] sm:block">{track.artist}</p>
                  <p className="hidden text-sm text-[#aaaaaa] sm:block">{track.genre}</p>
                  <p className="hidden text-sm text-[#aaaaaa] sm:block">{track.duration}</p>
                  <p className="hidden text-sm text-[#aaaaaa] sm:block">{track.mood}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-[#aaaaaa]">No tracks match your search.</p>
          </div>
        )}
      </div>

      <p className="text-xs text-[#aaaaaa]">
        All tracks are royalty-free and can be used in your VideoTube videos without copyright claims.
      </p>
    </div>
  );
};

/* ── Main StudioHubPage ── */
const StudioHubPage = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") || "dashboard";

  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [busy, setBusy] = useState(true);

  const loadStudio = async () => {
    setBusy(true);
    try {
      const [statsResponse, videosResponse] = await Promise.all([
        apiRequest("/api/v1/dashboard/stats"),
        apiRequest("/api/v1/dashboard/videos"),
      ]);
      setStats(statsResponse?.data || null);
      setVideos(videosResponse?.data || []);
    } catch { /* handled per-view */ }
    finally { setBusy(false); }
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

  const activeMap = { dashboard: "dashboard", content: "content", analytics: "analytics", comments: "comments", subtitles: "subtitles", audio: "audio" };
  const active = activeMap[view] || "dashboard";

  return (
    <div className="flex gap-6">
      <StudioSidebar active={active} user={user} />
      <div className="min-w-0 flex-1">
        {view === "dashboard" && <DashboardView stats={stats} videos={videos} busy={busy} user={user} loadStudio={loadStudio} />}
        {view === "content" && <ContentView videos={videos} busy={busy} loadStudio={loadStudio} />}
        {view === "analytics" && <AnalyticsView stats={stats} videos={videos} busy={busy} />}
        {view === "comments" && <CommentsView videos={videos} busy={busy} />}
        {view === "subtitles" && <SubtitlesView videos={videos} busy={busy} />}
        {view === "audio" && <AudioLibraryView />}
      </div>
    </div>
  );
};

export default StudioHubPage;
