import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Avatar from "../components/Avatar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { apiRequest } from "../lib/api.js";
import { formatCount, formatTimeAgo } from "../lib/utils.js";
import { useAuth } from "../state/AuthContext.jsx";

const ChannelPage = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Home");
  const [state, setState] = useState({ loading: true, error: "", channel: null, videos: [] });

  const loadChannel = async () => {
    setState((c) => ({ ...c, loading: true, error: "" }));
    try {
      const channelResponse = await apiRequest(`/api/v1/users/c/${username}`);
      const channel = channelResponse?.data;
      const videosResponse = await apiRequest(`/api/v1/videos?userId=${channel._id}`, {}, { skipRefresh: true });
      setState({ loading: false, error: "", channel, videos: videosResponse?.data?.docs || [] });
    } catch (err) {
      setState({ loading: false, error: err.message, channel: null, videos: [] });
    }
  };

  useEffect(() => { loadChannel(); }, [username]);
  useEffect(() => { setActiveTab("Home"); }, [username]);

  const channel = state.channel;
  const ownChannel = user?.username === channel?.username;
  const featuredVideo = state.videos[0] || null;
  const popularVideos = useMemo(
    () => [...state.videos].sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0)).slice(0, 12),
    [state.videos]
  );

  if (state.loading) {
    return (
      <div className="space-y-4">
        <div className="h-[180px] animate-pulse rounded-xl bg-[#272727]" />
        <div className="flex items-center gap-4 px-4">
          <div className="h-20 w-20 animate-pulse rounded-full bg-[#272727]" />
          <div className="space-y-2">
            <div className="h-6 w-48 animate-pulse rounded bg-[#272727]" />
            <div className="h-4 w-32 animate-pulse rounded bg-[#272727]" />
          </div>
        </div>
      </div>
    );
  }

  if (state.error || !state.channel) {
    return <EmptyState description={state.error || "Channel not found."} title="Channel unavailable" />;
  }

  const TABS = ["Home", "Videos", "About"];

  return (
    <div className="text-[#f1f1f1]">
      {/* Banner — full width, no overlay */}
      <div
        className="h-[180px] w-full overflow-hidden rounded-xl bg-cover bg-center md:h-[220px]"
        style={{
          backgroundImage: channel.coverImage
            ? `url(${channel.coverImage})`
            : "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      />

      {/* Channel info row */}
      <div className="mt-4 flex flex-col gap-4 px-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-end gap-4">
          {/* Avatar overlaps banner */}
          <Avatar
            className="-mt-8 h-20 w-20 rounded-full border-4 border-[#0f0f0f] sm:h-24 sm:w-24"
            name={channel.fullName}
            src={channel.avatar}
          />
          <div>
            <h1 className="text-2xl font-bold text-[#f1f1f1]">{channel.fullName}</h1>
            <p className="mt-1 text-sm text-[#aaaaaa]">
              @{channel.username} · {formatCount(channel.subscribersCount)} subscribers · {formatCount(state.videos.length)} videos
            </p>
          </div>
        </div>

        {/* Subscribe / manage buttons */}
        <div className="flex gap-2">
          {ownChannel ? (
            <>
              <Link className="alt-button" to="/studio">Manage videos</Link>
              <Link className="alt-button" to="/settings">Customize channel</Link>
            </>
          ) : !user ? (
            <Link className="subscribe-btn" to="/login">Subscribe</Link>
          ) : (
            <button
              className={channel.isSubscribed ? "subscribed-btn" : "subscribe-btn"}
              onClick={async () => {
                const response = await apiRequest(`/api/v1/subscriptions/c/${channel._id}`, { method: "POST" });
                const subscribed = Boolean(response?.data?.subscribed);
                setState((c) => ({
                  ...c,
                  channel: {
                    ...c.channel,
                    isSubscribed: subscribed,
                    subscribersCount: (Number(c.channel.subscribersCount) || 0) + (subscribed ? 1 : -1),
                  },
                }));
              }}
              type="button"
            >
              {channel.isSubscribed ? "Subscribed" : "Subscribe"}
            </button>
          )}
        </div>
      </div>

      {/* Tab bar — underline style */}
      <div className="mt-4 border-b border-[rgba(255,255,255,0.1)]">
        <div className="flex overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              className={`flex-shrink-0 border-b-2 px-6 py-3 text-sm font-medium transition ${
                activeTab === tab
                  ? "border-[#f1f1f1] text-[#f1f1f1]"
                  : "border-transparent text-[#aaaaaa] hover:text-[#f1f1f1]"
              }`}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {/* Home tab */}
        {activeTab === "Home" && (
          featuredVideo ? (
            <div className="space-y-8">
              {/* Featured video */}
              <div className="grid gap-4 lg:grid-cols-[minmax(0,480px),1fr]">
                <Link className="block overflow-hidden rounded-xl bg-black" to={`/watch/${featuredVideo._id}`}>
                  <div className="aspect-video">
                    {featuredVideo.thumbnail?.url || featuredVideo.thumbnail ? (
                      <img
                        alt={featuredVideo.title}
                        className="h-full w-full object-cover"
                        src={featuredVideo.thumbnail?.url || featuredVideo.thumbnail}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[#aaaaaa]">No thumbnail</div>
                    )}
                  </div>
                </Link>
                <div className="space-y-2 py-2">
                  <Link className="line-clamp-2 text-xl font-semibold text-[#f1f1f1] hover:text-white" to={`/watch/${featuredVideo._id}`}>
                    {featuredVideo.title}
                  </Link>
                  <p className="text-sm text-[#aaaaaa]">{formatCount(featuredVideo.views)} views · {formatTimeAgo(featuredVideo.createdAt)}</p>
                  <p className="line-clamp-3 text-sm text-[#aaaaaa]">{featuredVideo.description}</p>
                </div>
              </div>

              {/* Videos section */}
              <div>
                <h2 className="mb-4 text-base font-medium text-[#f1f1f1]">Videos</h2>
                <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {state.videos.map((video) => (
                    <VideoCard
                      key={video._id}
                      video={{ ...video, ownerDetails: { username: channel.username, fullName: channel.fullName, avatar: channel.avatar } }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <EmptyState description="This channel has no public videos yet." title="No uploads" />
          )
        )}

        {/* Videos tab */}
        {activeTab === "Videos" && (
          state.videos.length ? (
            <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {popularVideos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={{ ...video, ownerDetails: { username: channel.username, fullName: channel.fullName, avatar: channel.avatar } }}
                />
              ))}
            </div>
          ) : (
            <EmptyState description="No public videos yet." title="No videos" />
          )
        )}

        {/* About tab */}
        {activeTab === "About" && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="mb-3 text-base font-medium text-[#f1f1f1]">Stats</h2>
              <div className="space-y-2 text-sm text-[#aaaaaa]">
                <p>{formatCount(channel.subscribersCount)} subscribers</p>
                <p>{formatCount(state.videos.length)} videos</p>
                <p>{formatCount(channel.channelsSubscribedToCount)} subscriptions</p>
                {featuredVideo && <p>Last upload {formatTimeAgo(featuredVideo.createdAt)}</p>}
              </div>
            </div>
            <div>
              <h2 className="mb-3 text-base font-medium text-[#f1f1f1]">Channel handle</h2>
              <p className="text-sm text-[#aaaaaa]">@{channel.username}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelPage;
