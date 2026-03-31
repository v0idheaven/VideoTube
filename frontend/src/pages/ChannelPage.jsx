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
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("Home");
  const [state, setState] = useState({
    loading: true,
    error: "",
    channel: null,
    videos: [],
  });

  const loadChannel = async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));

    try {
      const channelResponse = await apiRequest(`/api/v1/users/c/${username}`);
      const channel = channelResponse?.data;
      const videosResponse = await apiRequest(
        `/api/v1/videos?userId=${channel._id}`,
        {},
        { skipRefresh: true }
      );

      setState({
        loading: false,
        error: "",
        channel,
        videos: videosResponse?.data?.docs || [],
      });
    } catch (requestError) {
      setState({
        loading: false,
        error: requestError.message,
        channel: null,
        videos: [],
      });
    }
  };

  useEffect(() => {
    loadChannel();
  }, [username]);

  useEffect(() => {
    setActiveTab("Home");
  }, [username]);

  const channel = state.channel;
  const ownChannel = user?.username === channel?.username;
  const featuredVideo = state.videos[0] || null;
  const recentVideos = state.videos.slice(0, 8);
  const popularVideos = useMemo(
    () =>
      [...state.videos]
        .sort((left, right) => (Number(right.views) || 0) - (Number(left.views) || 0))
        .slice(0, 4),
    [state.videos]
  );
  const stats = [
    { label: "Subscribers", value: formatCount(channel?.subscribersCount) },
    { label: "Following", value: formatCount(channel?.channelsSubscribedToCount) },
    { label: "Videos", value: formatCount(state.videos.length) },
  ];
  const strongestVideo = [...state.videos].sort(
    (left, right) => (Number(right.views) || 0) - (Number(left.views) || 0)
  )[0];

  if (loading) {
    return (
      <div className="glass-panel flex items-center gap-4 p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-[#ff2d2d]" />
        <div>
          <p className="font-semibold text-white">Opening channel</p>
          <p className="text-sm text-white/45">Checking your session before loading the creator profile.</p>
        </div>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-[#181818] p-8 text-sm text-white/50">
        Loading channel...
      </div>
    );
  }

  if (state.error || !state.channel) {
    return (
      <EmptyState
        description={state.error || "This channel could not be loaded."}
        title="Channel unavailable"
      />
    );
  }

  return (
    <div className="space-y-0 text-white">
      <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#141414]">
        <div
          className="h-[180px] bg-cover bg-center md:h-[230px]"
          style={{
            backgroundImage: channel.coverImage
              ? `linear-gradient(135deg, rgba(0,0,0,0.18), rgba(0,0,0,0.58)), url(${channel.coverImage})`
              : "radial-gradient(circle at 14% 18%, rgba(255,45,45,0.3), transparent 20%), radial-gradient(circle at 84% 22%, rgba(62,166,255,0.18), transparent 22%), linear-gradient(135deg, #240808 0%, #101010 45%, #08141a 100%)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(15,15,15,0.28)_45%,rgba(15,15,15,0.95)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-col gap-5 md:flex-row md:items-end">
              <Avatar
                className="h-24 w-24 rounded-full border-4 border-[#0f0f0f] shadow-[0_18px_40px_rgba(0,0,0,0.45)] md:h-32 md:w-32"
                name={channel.fullName}
                src={channel.avatar}
              />
              <div className="space-y-3">
                <div>
                  <h1 className="text-[2.1rem] font-semibold tracking-[-0.05em] text-white md:text-[3rem]">
                    {channel.fullName}
                  </h1>
                <p className="mt-2 text-sm text-white/65">
                  @{channel.username} | {formatCount(channel.subscribersCount)} subscribers |{" "}
                  {formatCount(state.videos.length)} videos
                </p>
              </div>
              <p className="max-w-3xl text-sm leading-7 text-white/58">
                {ownChannel
                    ? "This is your public channel. New uploads appear here after you publish them from Studio."
                    : `${formatCount(channel.subscribersCount)} people are following this creator right now.`}
              </p>
            </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {ownChannel ? (
                <>
                  <Link className="gradient-button" to="/studio">
                    Open studio
                  </Link>
                  <Link className="ghost-button" to="/settings">
                    Customize channel
                  </Link>
                </>
              ) : !user ? (
                <Link className="gradient-button" to="/login">
                  Sign in to subscribe
                </Link>
              ) : (
                <button
                  className={channel.isSubscribed ? "alt-button" : "gradient-button"}
                  onClick={async () => {
                    await apiRequest(`/api/v1/subscriptions/c/${channel._id}`, {
                      method: "POST",
                    });
                    await loadChannel();
                  }}
                  type="button"
                >
                  {channel.isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-1 pt-6 md:px-2">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),340px]">
          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((item) => (
              <div className="rounded-[24px] border border-white/10 bg-[#181818] p-5" key={item.label}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/34">
                  {item.label}
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-[24px] border border-white/10 bg-[#181818] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/34">Channel snapshot</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-[18px] border border-white/10 bg-[#121212] px-4 py-3">
                <p className="text-xs text-white/38">Top video</p>
                <p className="mt-2 line-clamp-2 text-sm font-medium text-white">
                  {strongestVideo?.title || "No public uploads yet"}
                </p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-[#121212] px-4 py-3">
                <p className="text-xs text-white/38">Latest upload</p>
                <p className="mt-2 text-sm font-medium text-white">
                  {featuredVideo ? formatTimeAgo(featuredVideo.createdAt) : "No uploads yet"}
                </p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-[#121212] px-4 py-3">
                <p className="text-xs text-white/38">Audience</p>
                <p className="mt-2 text-sm font-medium text-white">
                  {formatCount(channel.subscribersCount)} subscribers
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 border-b border-white/10 px-1 md:px-2">
        <div className="flex gap-2 overflow-x-auto">
          {["Home", "Videos", "About"].map((tab) => {
            const isActive = activeTab === tab;

            return (
              <button
                className={`rounded-t-2xl border-b-2 px-5 py-3 text-sm font-medium transition ${
                  isActive
                    ? "border-white bg-white/[0.03] text-white"
                    : "border-transparent text-white/50 hover:text-white"
                }`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      <section className="space-y-8 px-1 py-6 md:px-2">
        {activeTab === "Home" ? (
          featuredVideo ? (
            <div className="space-y-8">
              <article className="overflow-hidden rounded-[28px] border border-white/10 bg-[#181818]">
                <div className="grid gap-0 xl:grid-cols-[minmax(0,1.1fr),380px]">
                  <Link className="aspect-video bg-black xl:h-full" to={`/watch/${featuredVideo._id}`}>
                    {featuredVideo.thumbnail?.url || featuredVideo.thumbnail ? (
                      <img
                        alt={featuredVideo.title}
                        className="h-full w-full object-cover"
                        src={featuredVideo.thumbnail?.url || featuredVideo.thumbnail}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-white/35">
                        No thumbnail
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-col justify-between p-6 md:p-7">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/35">
                        Featured upload
                      </p>
                      <Link
                        className="mt-3 block text-[1.8rem] font-semibold tracking-[-0.05em] text-white"
                        to={`/watch/${featuredVideo._id}`}
                      >
                        {featuredVideo.title}
                      </Link>
                      <p className="mt-3 text-sm text-white/45">
                        {formatCount(featuredVideo.views)} views | {formatTimeAgo(featuredVideo.createdAt)}
                      </p>
                      <p className="mt-4 line-clamp-4 max-w-2xl text-sm leading-7 text-white/56">
                        {featuredVideo.description || "Open the watch page to read the full description."}
                      </p>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[18px] border border-white/10 bg-[#121212] px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-white/34">Audience</p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {formatCount(channel.subscribersCount)} subscribers
                        </p>
                      </div>
                      <div className="rounded-[18px] border border-white/10 bg-[#121212] px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-white/34">Library</p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {formatCount(state.videos.length)} public uploads
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr),320px]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">Recent uploads</p>
                  <div className="mt-5 grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                    {recentVideos.map((video) => (
                      <VideoCard
                        key={video._id}
                        video={{
                          ...video,
                          ownerDetails: {
                            username: channel.username,
                            fullName: channel.fullName,
                            avatar: channel.avatar,
                          },
                        }}
                      />
                    ))}
                  </div>
                </div>

                <aside className="space-y-4">
                  <div className="rounded-[24px] border border-white/10 bg-[#181818] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/34">About the creator</p>
                    <div className="mt-4 space-y-3 text-sm text-white/56">
                      <p>@{channel.username}</p>
                      <p>{formatCount(channel.subscribersCount)} subscribers</p>
                      <p>{formatCount(state.videos.length)} public uploads</p>
                      <p>{featuredVideo ? `Latest upload ${formatTimeAgo(featuredVideo.createdAt)}` : "No uploads yet"}</p>
                    </div>
                  </div>
                  {popularVideos.length ? (
                    <div className="rounded-[24px] border border-white/10 bg-[#181818] p-5">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/34">Popular on this channel</p>
                          <p className="mt-2 text-sm text-white/45">Sorted by live views.</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-4">
                        {popularVideos.map((video) => (
                          <VideoCard
                            compact
                            key={`popular-${video._id}`}
                            video={{
                              ...video,
                              ownerDetails: {
                                username: channel.username,
                                fullName: channel.fullName,
                                avatar: channel.avatar,
                              },
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </aside>
              </div>
            </div>
          ) : (
            <EmptyState
              description="This channel does not have any public videos yet."
              title="No public uploads"
            />
          )
        ) : null}

        {activeTab === "Videos" ? (
          state.videos.length ? (
            <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {state.videos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={{
                    ...video,
                    ownerDetails: {
                      username: channel.username,
                      fullName: channel.fullName,
                      avatar: channel.avatar,
                    },
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              description="This channel does not have any public videos yet."
              title="No public uploads"
            />
          )
        ) : null}

        {activeTab === "About" ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr),320px]">
            <div className="rounded-[28px] border border-white/10 bg-[#181818] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/35">About</p>
              <p className="mt-5 max-w-3xl text-sm leading-8 text-white/58">
                {ownChannel
                  ? "This page is what viewers see after you publish from Studio."
                  : "This public channel shows the creator profile, audience counts, and latest published videos."}
              </p>
              <div className="mt-6 space-y-3 text-sm text-white/52">
                <p>Latest activity: {featuredVideo ? formatTimeAgo(featuredVideo.createdAt) : "No uploads yet"}.</p>
                <p>Handle: @{channel.username}</p>
                <p>Following: {formatCount(channel.channelsSubscribedToCount)}</p>
              </div>
            </div>

            <div className="space-y-4">
              {stats.map((item) => (
                <div className="rounded-[24px] border border-white/10 bg-[#181818] p-5" key={item.label}>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/35">{item.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default ChannelPage;
