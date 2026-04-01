import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Avatar from "../components/Avatar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { apiRequest } from "../lib/api.js";
import { formatCount, formatDate, formatTimeAgo } from "../lib/utils.js";
import { useAuth } from "../state/AuthContext.jsx";

const ThumbUpIcon = ({ filled }) => (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? "0" : "1.8"}>
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);
const ThumbDownIcon = () => (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
    <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
  </svg>
);
const ShareIcon = () => (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 12v7a1 1 0 0 0 1 1h14" /><path d="M16 6l4 4-4 4" /><path d="M20 10H9a5 5 0 0 0-5 5v0" />
  </svg>
);
const SaveIcon = () => (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);
const DotsIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
  </svg>
);
const TrashIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
  </svg>
);

const WatchPage = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const commentInputRef = useRef(null);
  const [state, setState] = useState({
    loading: true, error: "", video: null, comments: [],
    commentPage: 1, hasMoreComments: false, sameChannelVideos: [], recommendedVideos: [],
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
        loading: false, error: "", video,
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

  useEffect(() => { loadVideo(); }, [videoId]);
  useEffect(() => {
    setActiveRail("All"); setShareMessage(""); setPlayerError(false);
    setDescExpanded(false); setComment(""); setCommentFocused(false);
  }, [videoId]);

  const video = state.video;
  const currentVideoId = video?._id || videoId;
  const sameChannelVideos = useMemo(
    () => (state.sameChannelVideos || []).filter((v) => v._id !== currentVideoId),
    [currentVideoId, state.sameChannelVideos]
  );
  const recommendedVideos = useMemo(() => {
    const seen = new Set([currentVideoId, ...sameChannelVideos.map((v) => v._id)]);
    return (state.recommendedVideos || []).filter((v) => { if (seen.has(v._id)) return false; seen.add(v._id); return true; });
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
          <div className="aspect-video animate-pulse rounded-xl bg-[#272727]" />
          <div className="space-y-3">
            <div className="h-6 w-3/4 animate-pulse rounded bg-[#272727]" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-[#272727]" />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="flex gap-2" key={i}>
              <div className="h-24 w-[168px] animate-pulse rounded-xl bg-[#272727]" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 animate-pulse rounded bg-[#272727]" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-[#272727]" />
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
        action={<Link className="alt-button" to="/feed">Back to feed</Link>}
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
    } finally { setTogglingLike(false); }
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
    } finally { setTogglingSubscription(false); }
  };

  const handleShare = async () => {
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(window.location.href); setShareMessage("Link copied"); }
      else setShareMessage("Copy the URL from the address bar");
    } catch { setShareMessage("Share unavailable"); }
    setTimeout(() => setShareMessage(""), 3000);
  };

  const handleDeleteComment = async (commentId) => {
    setDeletingCommentId(commentId);
    try {
      await apiRequest(`/api/v1/comments/c/${commentId}`, { method: "DELETE" });
      setState((c) => ({ ...c, comments: c.comments.filter((cm) => cm._id !== commentId) }));
    } finally { setDeletingCommentId(""); }
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
    } finally { setTogglingCommentLikeId(""); }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),402px]">
      {/* ── Left column ── */}
      <div className="min-w-0 space-y-4">
        {/* Player */}
        <div className="overflow-hidden rounded-xl bg-black">
          <video
            className="max-h-[75vh] w-full bg-black"
            controls
            onError={() => setPlayerError(true)}
            poster={thumbnail}
            src={videoSource}
          />
        </div>

        {playerError && (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
            The video file could not be loaded.
            {isOwnVideo && (
              <div className="mt-3 flex gap-3">
                <button
                  className="rounded-full bg-[#ff0000] px-4 py-2 text-sm font-medium text-white hover:bg-[#cc0000] disabled:opacity-60"
                  disabled={deletingVideo}
                  onClick={async () => {
                    if (!window.confirm("Delete this video permanently?")) return;
                    setDeletingVideo(true);
                    try { await apiRequest(`/api/v1/videos/v/${video._id}`, { method: "DELETE" }); navigate("/studio"); }
                    finally { setDeletingVideo(false); }
                  }}
                  type="button"
                >
                  {deletingVideo ? "Deleting..." : "Delete video"}
                </button>
                <Link className="alt-button" to="/studio">Back to studio</Link>
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <h1 className="text-xl font-semibold leading-tight text-[#f1f1f1]">{video.title}</h1>

        {/* Channel info + action pills row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Channel info */}
          <div className="flex items-center gap-3">
            <Link to={`/channel/${video.owner?.username}`}>
              <Avatar className="h-10 w-10 rounded-full" name={ownerName} src={video.owner?.avatar} />
            </Link>
            <div>
              <Link className="block text-sm font-medium text-[#f1f1f1] hover:text-white" to={`/channel/${video.owner?.username}`}>
                {ownerName}
              </Link>
              <p className="text-xs text-[#aaaaaa]">{formatCount(video.owner?.subscribersCount)} subscribers</p>
            </div>
            {isOwnVideo ? (
              <Link className="alt-button ml-2" to="/studio">Manage</Link>
            ) : !user ? (
              <Link className="subscribe-btn ml-2" to="/login">Subscribe</Link>
            ) : (
              <button
                className={`ml-2 ${video.owner?.isSubscribed ? "subscribed-btn" : "subscribe-btn"}`}
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
            {/* Like/Dislike single pill with divider */}
            <div className="flex overflow-hidden rounded-full bg-[#272727]">
              <button
                className={`flex h-9 items-center gap-2 px-4 text-sm font-medium transition hover:bg-[#3f3f3f] disabled:opacity-60 ${video.isLiked ? "text-[#3ea6ff]" : "text-[#f1f1f1]"}`}
                disabled={togglingLike || !user}
                onClick={handleToggleLike}
                type="button"
              >
                <ThumbUpIcon filled={video.isLiked} />
                <span>{formatCount(video.likesCount)}</span>
              </button>
              <div className="w-px bg-[rgba(255,255,255,0.1)]" />
              <button className="flex h-9 items-center px-3 text-[#f1f1f1] hover:bg-[#3f3f3f]" type="button">
                <ThumbDownIcon />
              </button>
            </div>

            <button className="action-pill" onClick={handleShare} type="button">
              <ShareIcon />
              {shareMessage || "Share"}
            </button>

            <button className="action-pill" type="button">
              <SaveIcon />
              Save
            </button>

            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#272727] text-[#f1f1f1] hover:bg-[#3f3f3f]" type="button">
              <DotsIcon />
            </button>
          </div>
        </div>

        {/* Description box */}
        <div
          className="cursor-pointer rounded-xl bg-[#272727] p-3"
          onClick={() => setDescExpanded((v) => !v)}
        >
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[#f1f1f1]">
            <span>{formatCount(video.views)} views</span>
            <span>{formatDate(video.createdAt)}</span>
          </div>
          <p className={`mt-2 whitespace-pre-line text-sm leading-6 text-[#f1f1f1] ${descExpanded ? "" : "line-clamp-2"}`}>
            {video.description || "No description."}
          </p>
          <p className="mt-1 text-xs font-medium text-[#f1f1f1]">{descExpanded ? "Show less" : "...more"}</p>
        </div>

        {/* Comments */}
        <div className="space-y-4">
          <h2 className="text-base font-medium text-[#f1f1f1]">{formatCount(state.comments.length)} Comments</h2>

          {user ? (
            <div className="flex items-start gap-3">
              <Avatar className="h-9 w-9 rounded-full" name={user.fullName} src={user.avatar} />
              <div className="flex-1">
                <input
                  className="w-full border-b border-[rgba(255,255,255,0.2)] bg-transparent pb-2 text-sm text-[#f1f1f1] outline-none placeholder:text-[#aaaaaa] focus:border-[#f1f1f1]"
                  onFocus={() => setCommentFocused(true)}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  ref={commentInputRef}
                  value={comment}
                />
                {commentFocused && (
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      className="rounded-full px-4 py-2 text-sm font-medium text-[#f1f1f1] hover:bg-[#272727]"
                      onClick={() => { setComment(""); setCommentFocused(false); }}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      className="rounded-full bg-[#3ea6ff] px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
                      disabled={submittingComment || !comment.trim()}
                      onClick={async () => {
                        if (!comment.trim()) return;
                        setSubmittingComment(true);
                        try {
                          const response = await apiRequest(`/api/v1/comments/${video._id}`, { method: "POST", body: { content: comment } });
                          const created = response?.data;
                          setComment(""); setCommentFocused(false);
                          if (created) {
                            setState((c) => ({
                              ...c,
                              comments: [{ ...created, likesCount: 0, isLiked: false, owner: { fullName: user.fullName, username: user.username, avatar: user.avatar } }, ...c.comments],
                            }));
                          }
                        } finally { setSubmittingComment(false); }
                      }}
                      type="button"
                    >
                      {submittingComment ? "Posting..." : "Comment"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] px-4 py-3 text-sm text-[#aaaaaa]">
              <Link className="text-[#3ea6ff]" to="/login">Sign in</Link> to like, subscribe, and comment.
            </div>
          )}

          <div className="space-y-6">
            {state.comments.length ? (
              state.comments.map((item) => {
                const isOwn = user?._id && item.owner?._id && (user._id === item.owner._id || user._id === item.owner);
                return (
                  <article className="flex items-start gap-3" key={item._id}>
                    <Avatar className="h-9 w-9 flex-shrink-0 rounded-full" name={item.owner?.fullName || item.owner?.username} src={item.owner?.avatar} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-[#f1f1f1]">{item.owner?.fullName || item.owner?.username}</span>
                        <span className="text-xs text-[#aaaaaa]">{formatTimeAgo(item.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-[#f1f1f1]">{item.content}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          className={`flex items-center gap-1.5 text-xs transition ${item.isLiked ? "text-[#3ea6ff]" : "text-[#aaaaaa] hover:text-[#f1f1f1]"} disabled:opacity-50`}
                          disabled={!user || togglingCommentLikeId === item._id}
                          onClick={() => handleToggleCommentLike(item._id)}
                          type="button"
                        >
                          <ThumbUpIcon filled={item.isLiked} />
                          {item.likesCount > 0 ? formatCount(item.likesCount) : ""}
                        </button>
                        <button className="text-xs text-[#aaaaaa] hover:text-[#f1f1f1]" type="button">Reply</button>
                        {isOwn && (
                          <button
                            className="flex items-center gap-1 text-xs text-[#aaaaaa] hover:text-red-400 disabled:opacity-50"
                            disabled={deletingCommentId === item._id}
                            onClick={() => handleDeleteComment(item._id)}
                            type="button"
                          >
                            <TrashIcon />
                            {deletingCommentId === item._id ? "Deleting..." : "Delete"}
                          </button>
                        )}
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

      {/* ── Right sidebar ── */}
      <aside className="space-y-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {["All", "From this channel", "Popular"].map((item) => (
            <button
              className={`yt-chip ${activeRail === item ? "yt-chip-active" : ""}`}
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
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] px-4 py-5 text-sm text-[#aaaaaa]">
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
