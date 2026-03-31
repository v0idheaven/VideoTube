import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Avatar from "../components/Avatar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { apiRequest } from "../lib/api.js";
import { formatCount, formatDate, formatTimeAgo } from "../lib/utils.js";
import { useAuth } from "../state/AuthContext.jsx";

const ActionPill = ({ children, type = "button", ...props }) => (
  <button
    className="inline-flex h-9 items-center gap-2 rounded-full bg-[#272727] px-4 text-sm font-medium text-white transition hover:bg-[#323232] disabled:cursor-not-allowed disabled:opacity-60"
    type={type}
    {...props}
  >
    {children}
  </button>
);

const WatchPage = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [state, setState] = useState({
    loading: true,
    error: "",
    video: null,
    comments: [],
    sameChannelVideos: [],
    recommendedVideos: [],
  });
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [togglingLike, setTogglingLike] = useState(false);
  const [togglingSubscription, setTogglingSubscription] = useState(false);
  const [activeRail, setActiveRail] = useState("All");
  const [shareMessage, setShareMessage] = useState("");
  const [playerError, setPlayerError] = useState(false);
  const [deletingVideo, setDeletingVideo] = useState(false);

  const loadVideo = async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));

    try {
      const videoResponse = await apiRequest(`/api/v1/videos/v/${videoId}`);
      const video = videoResponse?.data;
      const [commentsResult, sameChannelResult, recommendedResult] = await Promise.allSettled([
        apiRequest(`/api/v1/comments/${videoId}`),
        video.owner?._id
          ? apiRequest(`/api/v1/videos?userId=${video.owner._id}&limit=8`, {}, { skipRefresh: true })
          : Promise.resolve({ data: { docs: [] } }),
        apiRequest("/api/v1/videos?sortBy=views&sortType=desc&limit=12", {}, { skipRefresh: true }),
      ]);

      setState({
        loading: false,
        error: "",
        video,
        comments:
          commentsResult.status === "fulfilled" ? commentsResult.value?.data?.docs || [] : [],
        sameChannelVideos:
          sameChannelResult.status === "fulfilled" ? sameChannelResult.value?.data?.docs || [] : [],
        recommendedVideos:
          recommendedResult.status === "fulfilled" ? recommendedResult.value?.data?.docs || [] : [],
      });
    } catch (requestError) {
      setState({
        loading: false,
        error: requestError.message,
        video: null,
        comments: [],
        sameChannelVideos: [],
        recommendedVideos: [],
      });
    }
  };

  useEffect(() => {
    loadVideo();
  }, [videoId]);

  useEffect(() => {
    setActiveRail("All");
    setShareMessage("");
    setPlayerError(false);
  }, [videoId]);

  const video = state.video;
  const currentVideoId = video?._id || videoId;
  const sameChannelVideos = useMemo(
    () => (state.sameChannelVideos || []).filter((candidate) => candidate._id !== currentVideoId),
    [currentVideoId, state.sameChannelVideos]
  );
  const recommendedVideos = useMemo(() => {
    const seen = new Set([currentVideoId, ...sameChannelVideos.map((candidate) => candidate._id)]);

    return (state.recommendedVideos || []).filter((candidate) => {
      if (seen.has(candidate._id)) {
        return false;
      }

      seen.add(candidate._id);
      return true;
    });
  }, [currentVideoId, sameChannelVideos, state.recommendedVideos]);
  const railVideos = useMemo(() => {
    if (activeRail === "From this channel") {
      return sameChannelVideos;
    }

    if (activeRail === "Popular") {
      return recommendedVideos;
    }

    return [...sameChannelVideos, ...recommendedVideos];
  }, [activeRail, recommendedVideos, sameChannelVideos]);

  if (loading) {
    return (
      <div className="glass-panel flex items-center gap-4 p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-[#ff2d2d]" />
        <div>
          <p className="font-semibold text-white">Preparing watch view</p>
          <p className="text-sm text-white/45">Checking your session and loading the video.</p>
        </div>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="glass-panel flex items-center gap-4 p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-[#ff2d2d]" />
        <div>
          <p className="font-semibold text-white">Loading the player</p>
          <p className="text-sm text-white/45">Pulling video details, comments, and recommendations.</p>
        </div>
      </div>
    );
  }

  if (state.error || !state.video) {
    return (
      <EmptyState
        description={state.error || "This video could not be loaded."}
        title="Watch view unavailable"
        action={
          <Link className="gradient-button" to="/feed">
            Back to feed
          </Link>
        }
      />
    );
  }

  const thumbnail = video.thumbnail?.url || video.thumbnail;
  const videoSource = video.videoFile?.url || video.videoFile;
  const ownerName = video.owner?.fullName || video.owner?.username || "VideoTube creator";
  const isOwnVideo = user?._id && video.owner?._id && user._id === video.owner._id;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),402px]">
      <div className="space-y-5">
        <div className="overflow-hidden rounded-[20px] bg-black shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
          <video
            className="max-h-[72vh] w-full bg-black"
            controls
            onError={() => setPlayerError(true)}
            poster={thumbnail}
            src={videoSource}
          />
        </div>

        {playerError ? (
          <div className="rounded-[20px] border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-200">
            Video file load nahi ho rahi. Agar original upload source unavailable ho gayi hai, record tab bhi app me rahega jab tak tum ise delete nahi karte.
            {isOwnVideo ? (
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  className="rounded-full bg-[#ff2d2d] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={deletingVideo}
                  onClick={async () => {
                    if (!window.confirm("Delete this video permanently?")) {
                      return;
                    }

                    setDeletingVideo(true);

                    try {
                      await apiRequest(`/api/v1/videos/v/${video._id}`, {
                        method: "DELETE",
                      });
                      navigate("/studio");
                    } finally {
                      setDeletingVideo(false);
                    }
                  }}
                  type="button"
                >
                  {deletingVideo ? "Deleting..." : "Delete video"}
                </button>
                <Link className="alt-button !px-4 !py-2 text-sm" to="/studio">
                  Back to studio
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}

        <section className="space-y-5">
          <div>
            <h1 className="text-[1.75rem] font-semibold leading-tight text-white md:text-[2rem]">
              {video.title}
            </h1>
          </div>

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="text-sm text-white/45">
              {formatCount(video.views)} views | {formatDate(video.createdAt)}
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionPill
                disabled={togglingLike || !user}
                onClick={async () => {
                  if (!user) {
                    return;
                  }

                  setTogglingLike(true);

                  try {
                    const response = await apiRequest(`/api/v1/likes/toggle/v/${video._id}`, {
                      method: "POST",
                    });
                    const nextLiked = Boolean(response?.data?.isLiked);

                    setState((current) => {
                      if (!current.video) {
                        return current;
                      }

                      const wasLiked = Boolean(current.video.isLiked);
                      const likesCount = Number(current.video.likesCount) || 0;

                      return {
                        ...current,
                        video: {
                          ...current.video,
                          isLiked: nextLiked,
                          likesCount: likesCount + (nextLiked === wasLiked ? 0 : nextLiked ? 1 : -1),
                        },
                      };
                    });
                  } finally {
                    setTogglingLike(false);
                  }
                }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.12 4.37a3 3 0 0 1 4.08 3.02l-.39 3.16h2.3a1.9 1.9 0 0 1 1.89 2.08l-.75 7.5A2.1 2.1 0 0 1 19.16 22H8a2 2 0 0 1-2-2v-7.31a2 2 0 0 1 .59-1.42l4.93-4.92a2 2 0 0 0 .6-1.43V4.4a1 1 0 0 1 1-1 .99.99 0 0 1 1 .97z" />
                  <path d="M2 12h3v10H2z" />
                </svg>
                {togglingLike
                  ? "Updating..."
                  : !user
                    ? `Sign in · ${formatCount(video.likesCount)}`
                    : `${formatCount(video.likesCount)} ${video.isLiked ? "Liked" : "Like"}`}
              </ActionPill>
              <ActionPill
                onClick={async () => {
                  const shareUrl = window.location.href;

                  try {
                    if (navigator.clipboard?.writeText) {
                      await navigator.clipboard.writeText(shareUrl);
                      setShareMessage("Link copied");
                    } else {
                      window.open(shareUrl, "_blank", "noopener,noreferrer");
                      setShareMessage("Opened link");
                    }
                  } catch {
                    setShareMessage("Share unavailable");
                  }
                }}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 12v7a1 1 0 0 0 1 1h14" />
                  <path d="M16 6l4 4-4 4" />
                  <path d="M20 10H9a5 5 0 0 0-5 5v0" />
                </svg>
                {shareMessage || "Share"}
              </ActionPill>
              <Link
                className="inline-flex h-9 items-center gap-2 rounded-full bg-[#272727] px-4 text-sm font-medium text-white transition hover:bg-[#323232]"
                to={`/channel/${video.owner?.username}`}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 20a7 7 0 0 1 14 0" />
                </svg>
                Channel
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-b border-white/10 pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <Link to={`/channel/${video.owner?.username}`}>
                <Avatar className="h-12 w-12 rounded-full" name={ownerName} src={video.owner?.avatar} />
              </Link>
              <div>
                <Link className="text-base font-semibold text-white transition hover:text-white/85" to={`/channel/${video.owner?.username}`}>
                  {ownerName}
                </Link>
                <p className="mt-1 text-sm text-white/45">
                  @{video.owner?.username} | {formatCount(video.owner?.subscribersCount)} subscribers
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {isOwnVideo ? (
                <Link className="alt-button !px-4 !py-2 text-sm" to="/studio">
                  Manage video
                </Link>
              ) : !user ? (
                <Link className="gradient-button !px-4 !py-2 text-sm" to="/login">
                  Sign in to subscribe
                </Link>
              ) : (
                <button
                  className={`${video.owner?.isSubscribed ? "alt-button" : "gradient-button"} !px-4 !py-2 text-sm`}
                  disabled={togglingSubscription}
                  onClick={async () => {
                    if (!video.owner?._id) {
                      return;
                    }

                    setTogglingSubscription(true);

                    try {
                      const response = await apiRequest(`/api/v1/subscriptions/c/${video.owner._id}`, {
                        method: "POST",
                      });
                      const subscribed = Boolean(response?.data?.subscribed);

                      setState((current) => {
                        if (!current.video?.owner) {
                          return current;
                        }

                        const currentCount = Number(current.video.owner.subscribersCount) || 0;
                        const wasSubscribed = Boolean(current.video.owner.isSubscribed);

                        return {
                          ...current,
                          video: {
                            ...current.video,
                            owner: {
                              ...current.video.owner,
                              isSubscribed: subscribed,
                              subscribersCount:
                                currentCount + (subscribed === wasSubscribed ? 0 : subscribed ? 1 : -1),
                            },
                          },
                        };
                      });
                    } finally {
                      setTogglingSubscription(false);
                    }
                  }}
                  type="button"
                >
                  {togglingSubscription
                    ? "Updating..."
                    : video.owner?.isSubscribed
                      ? "Subscribed"
                      : "Subscribe"}
                </button>
              )}
            </div>
          </div>

          <div className="rounded-[18px] bg-[#272727]/70 p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-white/70">
              <span>{formatCount(video.views)} views</span>
              <span>|</span>
              <span>{formatDate(video.createdAt)}</span>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/65">
              {video.description || "No description added for this video yet."}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
                Comments
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                {state.comments.length} comment{state.comments.length === 1 ? "" : "s"}
              </h2>
            </div>
          </div>

          {user ? (
            <form
              className="border-b border-white/10 pb-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setSubmittingComment(true);

                try {
                  const response = await apiRequest(`/api/v1/comments/${video._id}`, {
                    method: "POST",
                    body: { content: comment },
                  });
                  const createdComment = response?.data;
                  setComment("");

                  if (createdComment) {
                    setState((current) => ({
                      ...current,
                      comments: [
                        {
                          ...createdComment,
                          likesCount: 0,
                          isLiked: false,
                          owner: {
                            fullName: user.fullName,
                            username: user.username,
                            avatar: user.avatar,
                          },
                        },
                        ...current.comments,
                      ],
                    }));
                  }
                } finally {
                  setSubmittingComment(false);
                }
              }}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 rounded-full" name={user.fullName} src={user.avatar} />
                <textarea
                  className="min-h-20 w-full border-b border-white/10 bg-transparent px-0 py-3 text-white outline-none placeholder:text-white/35 focus:border-white/25"
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Add a comment"
                  required
                  value={comment}
                />
              </div>
              <div className="mt-3 flex justify-end">
                <button className="gradient-button !px-4 !py-2 text-sm" disabled={submittingComment} type="submit">
                  {submittingComment ? "Posting..." : "Comment"}
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-[18px] border border-white/10 bg-[#181818] px-5 py-4 text-sm text-white/55">
              Sign in to like this video, subscribe to the channel, and join the comments.
              <div className="mt-3">
                <Link className="gradient-button !px-4 !py-2 text-sm" to="/login">
                  Sign in
                </Link>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {state.comments.length ? (
              state.comments.map((item) => (
                <article className="py-1" key={item._id}>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 rounded-full" name={item.owner?.fullName || item.owner?.username} src={item.owner?.avatar} />
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <p className="font-semibold text-white">{item.owner?.fullName || item.owner?.username}</p>
                        <p className="text-xs text-white/40">@{item.owner?.username}</p>
                        <p className="text-xs text-white/35">{formatTimeAgo(item.createdAt)}</p>
                      </div>
                      <p className="text-sm leading-7 text-white/65">{item.content}</p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                description="Start the first conversation on this video."
                title="No comments yet"
              />
            )}
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["All", "From this channel", "Popular"].map((item) => {
            const active = activeRail === item;

            return (
              <button
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active ? "bg-white text-black" : "bg-[#272727] text-white hover:bg-[#323232]"
                }`}
                key={item}
                onClick={() => setActiveRail(item)}
                type="button"
              >
                {item}
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          {railVideos.length ? (
            railVideos.map((candidate) => (
              <VideoCard compact key={candidate._id} video={candidate} />
            ))
          ) : (
            <EmptyState
              description={
                activeRail === "From this channel"
                  ? "More uploads from this creator will appear here after they publish again."
                  : "More recommendations will show up as the library grows."
              }
              title={activeRail === "From this channel" ? "No more channel videos yet" : "No recommendations yet"}
            />
          )}
        </div>
      </aside>
    </div>
  );
};

export default WatchPage;
