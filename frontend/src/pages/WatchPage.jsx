import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Avatar from "../components/Avatar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { apiRequest } from "../lib/api.js";
import { formatCount, formatDate, formatTimeAgo } from "../lib/utils.js";
import { useAuth } from "../state/AuthContext.jsx";

const ThumbUpIcon = ({ filled }) => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? "0" : "1.8"}>
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

const ShareIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 12v7a1 1 0 0 0 1 1h14" />
    <path d="M16 6l4 4-4 4" />
    <path d="M20 10H9a5 5 0 0 0-5 5v0" />
  </svg>
);

const DotsIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.75" />
    <circle cx="12" cy="12" r="1.75" />
    <circle cx="12" cy="19" r="1.75" />
  </svg>
);

const TrashIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
  </svg>
);

const WatchPage = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const commentInputRef = useRef(null);
  const [state, setState] = useState({
    loading: true,
    error: "",
    video: null,
    comments: [],
    commentPage: 1,
    hasMoreComments: false,
    sameChannelVideos: [],
    recommendedVideos: [],
  });
  const [comment, setComment] = useState("");
  const [commentFocused, setCommentFocused] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [togglingLike, setTogglingLike] = useState(false);
  const [togglingSubscription, setTogglingSubscription] = useState(false);
  const [activeRail, setActiveRail] = useState("All");
  const [shareMessage, setShareMessage] = useState("");
  const [playerError, setPlayerError] = useState(false);
  const [deletingVideo, setDeletingVideo] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState("");
  const [togglingCommentLikeId, setTogglingCommentLikeId] = useState("");

  const loadVideo = async () => {
    setState((c) => ({ ...c, loading: true, error: "" }));

    try {
      const videoResponse = await apiRequest(`/api/v1/videos/v/${videoId}`);
      const video = videoResponse?.data;

      const [commentsResult, sameChannelResult, recommendedResult] = await Promise.allSettled([
        apiRequest(`/api/v1/comments/${videoId}?limit=20`),
        video.owner?._id
          ? apiRequest(`/api/v1/videos?userId=${video.owner._id}&limit=8`, {}, { skipRefresh: true })
          : Promise.resolve({ data: { docs: [] } }),
        apiRequest("/api/v1/videos?sortBy=views&sortType=desc&limit=15", {}, { skipRefresh: true }),
      ]);

      const commentsData = commentsResult.status === "fulfilled" ? commentsResult.value?.data : null;

      setState({
        loading: false,
        error: "",
        video,
        comments: commentsData?.docs || [],
        commentPage: 1,
        hasMoreComments: (commentsData?.totalPages || 1) > 1,
        sameChannelVideos: sameChannelResult.status === "fulfilled" ? sameChannelResult.value?.data?.docs || [] : [],
        recommendedVideos: recommendedResult.status === "fulfilled" ? recommendedResult.value?.data?.docs || [] : [],
      });
    } catch (err) {
      setState({ loading: false, error: err.message, video: null, comments: [], commentPage: 1, hasMoreComments: false, sameChannelVideos: [], recommendedVideos: [] });
    }
  };

  useEffect(() => {
    loadVideo();
  }, [videoId]);

  useEffect(() => {
    setActiveRail("All");
    setShareMessage("");
    setPlayerError(false);
    setDescExpanded(false);
    setComment("");
    setCommentFocused(false);
  }, [videoId]);

  const video = state.video;
  const currentVideoId = video?._id || videoId;

  const sameChannelVideos = useMemo(
    () => (state.sameChannelVideos || []).filter((v) => v._id !== currentVideoId),
    [currentVideoId, state.sameChannelVideos]
  );

  const recommendedVideos = useMemo(() => {
    const seen = new Set([currentVideoId, ...sameChannelVideos.map((v) => v._id)]);
    return (state.recommendedVideos || []).filter((v) => {
      if (seen.has(v._id)) return false;
      seen.add(v._id);
      return true;
    });
  }, [currentVideoId, sameChannelVideos, state.recommendedVideos]);

  const railVideos = useMemo(() => {
    if (activeRail === "From this channel") return sameChannelVideos;
    if (activeRail === "Popular") return recommendedVideos;
    return [...sameChannelVideos, ...recommendedVideos];
  }, [activeRail, recommendedVideos, sameChannelVideos]);

  if (authLoading || state.loading) {
    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),402px]">
        <div className="space-y-4">
          <div className="aspect-video animate-pulse rounded-2xl bg-[#202020]" />
          <div className="space-y-3">
            <div className="h-7 w-3/4 animate-pulse rounded bg-[#202020]" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-[#202020]" />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div className="grid grid-cols-[168px,1fr] gap-3" key={i}>
              <div className="aspect-video animate-pulse rounded-xl bg-[#202020]" />
              <div className="space-y-2">
                <div className="h-4 animate-pulse rounded bg-[#202020]" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-[#202020]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (state.error || !state.video) {
    return (
      <EmptyState
        description={state.error || "This video could not be loaded."}
        title="Video unavailable"
        action={<Link className="gradient-button" to="/feed">Back to feed</Link>}
      />
    );
  }

  const thumbnail = video.thumbnail?.url || video.thumbnail;
  const videoSource = video.videoFile?.url || video.videoFile;
  const ownerName = video.owner?.fullName || video.owner?.username || "VideoTube creator";
  const isOwnVideo = user?._id && video.owner?._id && user._id === video.owner._id;

  const handleToggleLike = async () => {
    if (!user) return;
    setTogglingLike(true);
    try {
      const response = await apiRequest(`/api/v1/likes/toggle/v/${video._id}`, { method: "POST" });
      const nextLiked = Boolean(response?.data?.isLiked);
      setState((c) => {
        if (!c.video) return c;
        const wasLiked = Boolean(c.video.isLiked);
        const count = Number(c.video.likesCount) || 0;
        return { ...c, video: { ...c.video, isLiked: nextLiked, likesCount: count + (nextLiked === wasLiked ? 0 : nextLiked ? 1 : -1) } };
      });
    } finally {
      setTogglingLike(false);
    }
  };

  const handleToggleSubscription = async () => {
    if (!video.owner?._id) return;
    setTogglingSubscription(true);
    try {
      const response = await apiRequest(`/api/v1/subscriptions/c/${video.owner._id}`, { method: "POST" });
      const subscribed = Boolean(response?.data?.subscribed);
      setState((c) => {
        if (!c.video?.owner) return c;
        const count = Number(c.video.owner.subscribersCount) || 0;
        const was = Boolean(c.video.owner.isSubscribed);
        return { ...c, video: { ...c.video, owner: { ...c.video.owner, isSubscribed: subscribed, subscribersCount: count + (subscribed === was ? 0 : subscribed ? 1 : -1) } } };
      });
    } finally {
      setTogglingSubscription(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        setShareMessage("Link copied");
      } else {
        setShareMessage("Copy the URL from the address bar");
      }
    } catch {
      setShareMessage("Share unavailable");
    }
    setTimeout(() => setShareMessage(""), 3000);
  };

  const handleDeleteComment = async (commentId) => {
    setDeletingCommentId(commentId);
    try {
      await apiRequest(`/api/v1/comments/c/${commentId}`, { method: "DELETE" });
      setState((c) => ({ ...c, comments: c.comments.filter((cm) => cm._id !== commentId) }));
    } finally {
      setDeletingCommentId("");
    }
  };

  const handleToggleCommentLike = async (commentId) => {
    if (!user) return;
    setTogglingCommentLikeId(commentId);
    try {
      const response = await apiRequest(`/api/v1/likes/toggle/c/${commentId}`, { method: "POST" });
      const isLiked = Boolean(response?.data?.isLiked);
      setState((c) => ({
        ...c,
        comments: c.comments.map((cm) => {
          if (cm._id !== commentId) return cm;
          const was = Boolean(cm.isLiked);
          const count = Number(cm.likesCount) || 0;
          return { ...cm, isLiked, likesCount: count + (isLiked === was ? 0 : isLiked ? 1 : -1) };
        }),
      }));
    } finally {
      setTogglingCommentLikeId("");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),402px]">
      {/* Left column */}
      <div className="space-y-4">
        {/* Video player */}
        <div className="overflow-hidden rounded-2xl bg-black">
          <video
            className="max-h-[72vh] w-full bg-black"
            controls
            onError={() => setPlayerError(true)}
            poster={thumbnail}
            src={videoSource}
          />
        </div>

        {playerError ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-200">
            The video file could not be loaded.
            {isOwnVideo ? (
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  className="rounded-full bg-[#ff2d2d] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                  disabled={deletingVideo}
                  onClick={async () => {
                    if (!window.confirm("Delete this video permanently?")) return;
                    setDeletingVideo(true);
                    try {
                      await apiRequest(`/api/v1/videos/v/${video._id}`, { method: "DELETE" });
                      navigate("/studio");
                    } finally {
                      setDeletingVideo(false);
                    }
                  }}
                  type="button"
                >
                  {deletingVideo ? "Deleting..." : "Delete video"}
                </button>
                <Link className="alt-button !px-4 !py-2 text-sm" to="/studio">Back to studio</Link>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Title + actions */}
        <div className="space-y-3">
          <h1 className="text-xl font-semibold leading-tight text-white">{video.title}</h1>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Channel info */}
            <div className="flex items-center gap-3">
              <Link to={`/channel/${video.owner?.username}`}>
                <Avatar className="h-10 w-10 rounded-full" name={ownerName} src={video.owner?.avatar} />
              </Link>
              <div>
                <Link className="block text-sm font-semibold text-white hover:text-white/85" to={`/channel/${video.owner?.username}`}>
                  {ownerName}
                </Link>
                <p className="text-xs text-white/50">
                  {formatCount(video.owner?.subscribersCount)} subscribers
                </p>
              </div>

              {isOwnVideo ? (
                <Link className="alt-button !px-3 !py-1.5 text-xs" to="/studio">Manage</Link>
              ) : !user ? (
                <Link className="gradient-button !px-4 !py-2 text-sm" to="/login">Subscribe</Link>
              ) : (
                <button
                  className={`${video.owner?.isSubscribed ? "alt-button" : "gradient-button"} !px-4 !py-2 text-sm`}
                  disabled={togglingSubscription}
                  onClick={handleToggleSubscription}
                  type="button"
                >
                  {togglingSubscription ? "..." : video.owner?.isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              )}
            </div>

            {/* Action pills */}
            <div className="flex flex-wrap gap-2">
              <button
                className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition ${video.isLiked ? "bg-white text-black" : "bg-[#272727] text-white hover:bg-[#323232]"} disabled:opacity-60`}
                disabled={togglingLike || !user}
                onClick={handleToggleLike}
                type="button"
              >
                <ThumbUpIcon filled={video.isLiked} />
                {formatCount(video.likesCount)}
              </button>

              <button
                className="inline-flex h-9 items-center gap-2 rounded-full bg-[#272727] px-4 text-sm font-medium text-white transition hover:bg-[#323232]"
                onClick={handleShare}
                type="button"
              >
                <ShareIcon />
                {shareMessage || "Share"}
              </button>

              <Link
                className="inline-flex h-9 items-center gap-2 rounded-full bg-[#272727] px-4 text-sm font-medium text-white transition hover:bg-[#323232]"
                to={`/channel/${video.owner?.username}`}
              >
                Channel
              </Link>
            </div>
          </div>
        </div>

        {/* Description */}
        <div
          className="cursor-pointer rounded-xl bg-[#272727]/70 p-4"
          onClick={() => setDescExpanded((v) => !v)}
        >
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-white">
            <span>{formatCount(video.views)} views</span>
            <span>{formatDate(video.createdAt)}</span>
          </div>
          <p className={`mt-2 whitespace-pre-line text-sm leading-6 text-white/70 ${descExpanded ? "" : "line-clamp-2"}`}>
            {video.description || "No description."}
          </p>
          <p className="mt-1 text-xs font-semibold text-white/60">
            {descExpanded ? "Show less" : "...more"}
          </p>
        </div>

        {/* Comments */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">
            {state.comments.length} Comment{state.comments.length !== 1 ? "s" : ""}
          </h2>

          {user ? (
            <div className="flex items-start gap-3">
              <Avatar className="h-9 w-9 rounded-full" name={user.fullName} src={user.avatar} />
              <div className="flex-1">
                <input
                  className="w-full border-b border-white/15 bg-transparent pb-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/40"
                  onFocus={() => setCommentFocused(true)}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  ref={commentInputRef}
                  value={comment}
                />
                {commentFocused ? (
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5"
                      onClick={() => { setComment(""); setCommentFocused(false); }}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      className="gradient-button !px-4 !py-2 text-sm disabled:opacity-60"
                      disabled={submittingComment || !comment.trim()}
                      onClick={async () => {
                        if (!comment.trim()) return;
                        setSubmittingComment(true);
                        try {
                          const response = await apiRequest(`/api/v1/comments/${video._id}`, {
                            method: "POST",
                            body: { content: comment },
                          });
                          const created = response?.data;
                          setComment("");
                          setCommentFocused(false);
                          if (created) {
                            setState((c) => ({
                              ...c,
                              comments: [{ ...created, likesCount: 0, isLiked: false, owner: { fullName: user.fullName, username: user.username, avatar: user.avatar } }, ...c.comments],
                            }));
                          }
                        } finally {
                          setSubmittingComment(false);
                        }
                      }}
                      type="button"
                    >
                      {submittingComment ? "Posting..." : "Comment"}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#181818] px-4 py-3 text-sm text-white/55">
              <Link className="text-white underline" to="/login">Sign in</Link> to like, subscribe, and comment.
            </div>
          )}

          <div className="space-y-5">
            {state.comments.length ? (
              state.comments.map((item) => {
                const isOwn = user?._id && item.owner?._id && (user._id === item.owner._id || user._id === item.owner);
                return (
                  <article className="flex items-start gap-3" key={item._id}>
                    <Avatar className="h-9 w-9 flex-shrink-0 rounded-full" name={item.owner?.fullName || item.owner?.username} src={item.owner?.avatar} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-semibold text-white">{item.owner?.fullName || item.owner?.username}</span>
                        <span className="text-xs text-white/40">{formatTimeAgo(item.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-white/75">{item.content}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          className={`inline-flex items-center gap-1.5 text-xs transition ${item.isLiked ? "text-white" : "text-white/50 hover:text-white"} disabled:opacity-50`}
                          disabled={!user || togglingCommentLikeId === item._id}
                          onClick={() => handleToggleCommentLike(item._id)}
                          type="button"
                        >
                          <ThumbUpIcon filled={item.isLiked} />
                          {item.likesCount > 0 ? formatCount(item.likesCount) : ""}
                        </button>
                        {isOwn ? (
                          <button
                            className="inline-flex items-center gap-1 text-xs text-white/40 transition hover:text-rose-400 disabled:opacity-50"
                            disabled={deletingCommentId === item._id}
                            onClick={() => handleDeleteComment(item._id)}
                            type="button"
                          >
                            <TrashIcon />
                            {deletingCommentId === item._id ? "Deleting..." : "Delete"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <EmptyState description="Be the first to comment." title="No comments yet" />
            )}
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <aside className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["All", "From this channel", "Popular"].map((item) => (
            <button
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${activeRail === item ? "bg-white text-black" : "bg-[#272727] text-white hover:bg-[#323232]"}`}
              key={item}
              onClick={() => setActiveRail(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {railVideos.length ? (
            railVideos.map((v) => <VideoCard compact key={v._id} video={v} />)
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#181818] px-4 py-5 text-sm text-white/50">
              {activeRail === "From this channel"
                ? "More from this creator will appear here."
                : "More recommendations will show up as the library grows."}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default WatchPage;
