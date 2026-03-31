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
  const publishedVideos = useMemo(
    () => videos.filter((video) => video.isPublished),
    [videos]
  );
  const draftVideos = useMemo(
    () => videos.filter((video) => !video.isPublished),
    [videos]
  );
  const mostViewedVideo = useMemo(
    () =>
      [...videos].sort(
        (left, right) => (Number(right.views) || 0) - (Number(left.views) || 0)
      )[0] || null,
    [videos]
  );
  const latestUpload = videos[0] || null;
  const latestPublishedVideo = publishedVideos[0] || null;
  const recentUploads = useMemo(() => videos.slice(0, 4), [videos]);

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
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadStudio();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="glass-panel flex items-center gap-4 p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-[#ff2d2d]" />
        <div>
          <p className="font-semibold text-white">Opening studio</p>
          <p className="text-sm text-white/45">Verifying your session and loading stats.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthGate
        description="Your studio, uploads, and dashboard stats are all protected routes."
        title="Sign in to enter the studio"
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[220px,minmax(0,1fr)]">
      <StudioSidebar active="dashboard" user={user} />

      <section className="space-y-6">
        <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,#181818_0%,#181818_56%,#281512_100%)] p-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-300/80">Creator studio</p>
            <h1 className="mt-3 text-[2rem] font-semibold tracking-[-0.04em] text-white md:text-[2.7rem]">
              Channel dashboard
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/52">
              Review channel performance, manage video status, and jump into upload or settings from the same production-style workspace.
            </p>
          </div>
          <Link className="gradient-button w-fit" to="/upload">
            Upload video
          </Link>
        </div>

        {message ? (
          <div className="rounded-[22px] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[22px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Subscribers", value: stats?.totalSubscribers, accent: "Growing audience" },
            { label: "Total likes", value: stats?.totalLikes, accent: "Engagement signal" },
            { label: "Total views", value: stats?.totalViews, accent: "Reach signal" },
            { label: "Videos", value: stats?.totalVideos, accent: "library size" },
          ].map((item) => (
            <div className="rounded-[24px] border border-white/10 bg-[#181818] p-5" key={item.label}>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">{item.label}</p>
              <strong className="mt-3 block text-4xl font-semibold text-white">
                {busy ? "--" : formatCount(item.value)}
              </strong>
              <p className="mt-2 text-xs text-white/38">{item.accent}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),340px]">
          <div className="rounded-[28px] border border-white/10 bg-[#181818] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">Channel snapshot</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
              What needs your attention
            </h2>
            <p className="mt-2 text-sm leading-7 text-white/48">
              Published videos, private drafts, and top-performing uploads are all pulled from the same live dashboard data.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[22px] border border-white/10 bg-[#121212] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/34">Latest upload</p>
                <p className="mt-3 line-clamp-2 text-sm font-semibold text-white">
                  {latestUpload?.title || "No uploads yet"}
                </p>
                <p className="mt-2 text-xs text-white/42">
                  {latestUpload
                    ? `${formatTimeAgo(latestUpload.createdAt)} | ${latestUpload.isPublished ? "Published" : "Draft"}`
                    : "Upload a video to start building the channel."}
                </p>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-[#121212] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/34">Top video</p>
                <p className="mt-3 line-clamp-2 text-sm font-semibold text-white">
                  {mostViewedVideo?.title || "No views yet"}
                </p>
                <p className="mt-2 text-xs text-white/42">
                  {mostViewedVideo
                    ? `${formatCount(mostViewedVideo.views)} views`
                    : "Views will appear once people start watching."}
                </p>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-[#121212] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/34">Drafts</p>
                <p className="mt-3 text-sm font-semibold text-white">
                  {draftVideos.length ? `${draftVideos.length} draft${draftVideos.length === 1 ? "" : "s"}` : "No drafts waiting"}
                </p>
                <p className="mt-2 text-xs text-white/42">
                  {draftVideos[0]
                    ? `Latest draft: ${draftVideos[0].title}`
                    : "Everything in the library is already public."}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-[#121212] p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/34">Recent uploads</p>
                  <p className="mt-2 text-sm text-white/45">Your latest videos in the same order viewers see after publishing.</p>
                </div>
                <Link className="text-sm font-medium text-white/78 transition hover:text-white" to={`/channel/${user.username}`}>
                  View channel
                </Link>
              </div>

              {recentUploads.length ? (
                <div className="mt-5 space-y-3">
                  {recentUploads.map((video) => (
                    <Link
                      className="flex items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-[#181818] px-4 py-3 transition hover:border-white/20 hover:bg-[#1d1d1d]"
                      key={video._id}
                      to={`/watch/${video._id}`}
                    >
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-medium text-white">{video.title}</p>
                        <p className="mt-1 text-xs text-white/40">{formatTimeAgo(video.createdAt)}</p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
                          video.isPublished
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-amber-500/15 text-amber-300"
                        }`}
                      >
                        {video.isPublished ? "Published" : "Draft"}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-sm text-white/42">Uploads will appear here as soon as you publish or save a draft.</p>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#181818] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">Channel profile</p>
            <div className="mt-5 flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-full" name={user.fullName} src={user.avatar} />
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-white">{user.fullName}</p>
                <p className="truncate text-sm text-white/42">@{user.username}</p>
                <p className="truncate text-sm text-white/42">{user.email}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[18px] border border-white/10 bg-[#121212] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/34">Published</p>
                  <p className="mt-2 text-lg font-semibold text-white">{formatCount(publishedVideos.length)}</p>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-[#121212] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/34">Latest public</p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {latestPublishedVideo ? formatTimeAgo(latestPublishedVideo.createdAt) : "Nothing public yet"}
                  </p>
                </div>
              </div>
              <Link className="alt-button justify-center" to={`/channel/${user.username}`}>
                View channel
              </Link>
              <Link className="ghost-button justify-center" to="/settings">
                Open settings
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#181818] p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">Content</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                Uploaded videos
              </h2>
              <p className="mt-2 text-sm leading-7 text-white/48">
                Review titles, publish state, and quick video performance from the same creator dashboard.
              </p>
            </div>
            <Link className="alt-button w-fit" to="/upload">
              New upload
            </Link>
          </div>

          {busy ? (
            <div className="mt-6 rounded-[24px] border border-white/10 bg-[#121212] p-6 text-sm text-white/45">
              Loading your videos...
            </div>
          ) : videos.length ? (
            <div className="mt-6 overflow-hidden rounded-[24px] border border-white/10">
              <div className="hidden grid-cols-[minmax(0,2fr),120px,120px,120px,120px] gap-4 border-b border-white/10 bg-[#111111] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/30 md:grid">
                <span>Video</span>
                <span>Status</span>
                <span>Views</span>
                <span>Likes</span>
                <span>Actions</span>
              </div>

              <div className="divide-y divide-white/10">
                {videos.map((video) => {
                  const thumbnail = video.thumbnail?.url || video.thumbnail;

                  return (
                    <article
                      className="grid gap-4 bg-[#181818] px-5 py-4 md:grid-cols-[minmax(0,2fr),120px,120px,120px,120px] md:items-center"
                      key={video._id}
                    >
                      <div className="flex items-center gap-4">
                        <Link className="block w-[128px] flex-shrink-0 overflow-hidden rounded-xl bg-black" to={`/watch/${video._id}`}>
                          <div className="aspect-video">
                            {thumbnail ? (
                              <img alt={video.title} className="h-full w-full object-cover" src={thumbnail} />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-white/35">No thumbnail</div>
                            )}
                          </div>
                        </Link>
                        <div className="min-w-0">
                          <Link className="line-clamp-2 text-sm font-medium text-white" to={`/watch/${video._id}`}>
                            {video.title}
                          </Link>
                          <p className="mt-1 text-xs text-white/38">{formatTimeAgo(video.createdAt)}</p>
                        </div>
                      </div>

                      <div>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            video.isPublished
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-amber-500/15 text-amber-300"
                          }`}
                        >
                          {video.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>

                      <div className="text-sm text-white/58">{formatCount(video.views)}</div>
                      <div className="text-sm text-white/58">{formatCount(video.likesCount)}</div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-white/78 transition hover:bg-white/5"
                          disabled={togglingVideoId === video._id}
                          onClick={async () => {
                            setTogglingVideoId(video._id);
                            setError("");
                            setMessage("");

                            try {
                              const response = await apiRequest(`/api/v1/videos/toggle/publish/${video._id}`, {
                                method: "PATCH",
                              });
                              setMessage(
                                response?.data?.isPublished
                                  ? "Video published successfully."
                                  : "Video moved back to draft."
                              );
                              await loadStudio();
                            } catch (requestError) {
                              setError(requestError.message);
                            } finally {
                              setTogglingVideoId("");
                            }
                          }}
                          type="button"
                        >
                          {togglingVideoId === video._id
                            ? "Updating..."
                            : video.isPublished
                              ? "Unpublish"
                              : "Publish"}
                        </button>
                        <Link className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-white/78 transition hover:bg-white/5" to={`/watch/${video._id}`}>
                          Open
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyState
              description="Your studio is ready. Upload the first clip to bring this dashboard to life."
              title="No uploads yet"
              action={
                <Link className="gradient-button" to="/upload">
                  Upload your first video
                </Link>
              }
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default StudioHubPage;
