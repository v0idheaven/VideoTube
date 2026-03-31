import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuthGate from "../components/AuthGate.jsx";
import Avatar from "../components/Avatar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { apiRequest } from "../lib/api.js";
import { formatCount, formatTimeAgo } from "../lib/utils.js";
import { useAuth } from "../state/AuthContext.jsx";

const SubscriptionsPage = () => {
  const { user, loading } = useAuth();
  const [channels, setChannels] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?._id) {
      setChannels([]);
      setBusy(false);
      return;
    }

    let cancelled = false;

    const loadSubscriptions = async () => {
      setBusy(true);
      setError("");

      try {
        const response = await apiRequest(`/api/v1/subscriptions/u/${user._id}`);

        if (!cancelled) {
          setChannels((response?.data || []).map((item) => item.subscribedChannel).filter(Boolean));
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message);
        }
      } finally {
        if (!cancelled) {
          setBusy(false);
        }
      }
    };

    loadSubscriptions();

    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  const featuredChannel = channels[0] || null;
  const channelsWithUploads = useMemo(
    () => channels.filter((channel) => channel.latestVideo),
    [channels]
  );

  if (loading) {
    return (
      <div className="glass-panel flex items-center gap-4 p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-red-500" />
        <div>
          <p className="font-semibold text-white">Loading subscriptions</p>
          <p className="text-sm text-white/45">Pulling subscribed channels and their latest uploads.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthGate
        description="Subscriptions depend on your signed-in account, so this page opens after login."
        title="Sign in to open subscriptions"
      />
    );
  }

  if (busy) {
    return (
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr),360px]">
        <div className="aspect-[2/1] animate-pulse rounded-[28px] bg-[#1b1b1b]" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="h-28 animate-pulse rounded-[24px] bg-[#1b1b1b]" key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        action={
          <button className="gradient-button" onClick={() => window.location.reload()} type="button">
            Retry
          </button>
        }
        description={error}
        title="Could not load subscriptions"
      />
    );
  }

  if (!channels.length) {
    return (
      <EmptyState
        action={
          <Link className="gradient-button" to="/feed">
            Explore videos
          </Link>
        }
        description="Subscribe to a few channels and their latest uploads will start showing up here."
        title="No subscriptions yet"
      />
    );
  }

  return (
    <div className="space-y-8 text-white">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr),360px]">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#181818]">
          <div
            className="min-h-[360px] bg-cover bg-center"
            style={{
              backgroundImage: featuredChannel?.latestVideo?.thumbnail?.url || featuredChannel?.latestVideo?.thumbnail
                ? `linear-gradient(135deg, rgba(0,0,0,0.38), rgba(0,0,0,0.8)), url(${featuredChannel.latestVideo.thumbnail.url || featuredChannel.latestVideo.thumbnail})`
                : "linear-gradient(135deg, #171717 0%, #251515 100%)",
            }}
          >
            <div className="flex min-h-[360px] flex-col justify-end p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">Subscriptions</p>
              <h1 className="mt-3 max-w-3xl text-[2.1rem] font-semibold tracking-[-0.05em] text-white md:text-[2.8rem]">
                Latest from the channels you follow
              </h1>
              {featuredChannel ? (
                <div className="mt-5 flex flex-col gap-5 rounded-[24px] border border-white/10 bg-black/20 p-5 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar
                      className="h-14 w-14 rounded-full"
                      name={featuredChannel.fullName || featuredChannel.username}
                      src={featuredChannel.avatar}
                    />
                    <div>
                      <p className="text-lg font-semibold text-white">{featuredChannel.fullName || featuredChannel.username}</p>
                      <p className="text-sm text-white/55">@{featuredChannel.username}</p>
                    </div>
                  </div>
                  <div className="space-y-2 md:text-right">
                    <p className="text-sm font-medium text-white">
                      {featuredChannel.latestVideo?.title || "No recent public upload"}
                    </p>
                    <p className="text-xs text-white/45">
                      {featuredChannel.latestVideo
                        ? formatTimeAgo(featuredChannel.latestVideo.createdAt)
                        : "Waiting for the next upload"}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <aside className="rounded-[28px] border border-white/10 bg-[#181818] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">Channels</p>
          <div className="mt-5 space-y-3">
            {channels.map((channel) => (
              <Link
                className="flex items-center gap-4 rounded-[20px] border border-white/10 bg-[#121212] px-4 py-4 transition hover:border-white/20 hover:bg-[#181818]"
                key={channel._id}
                to={`/channel/${channel.username}`}
              >
                <Avatar className="h-12 w-12 rounded-full" name={channel.fullName || channel.username} src={channel.avatar} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{channel.fullName || channel.username}</p>
                  <p className="truncate text-xs text-white/42">
                    {channel.latestVideo?.title || "No public upload yet"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">Latest uploads</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">Fresh from subscriptions</h2>
          </div>
          <p className="text-sm text-white/40">{formatCount(channels.length)} channels</p>
        </div>

        <div className="grid gap-4">
          {channelsWithUploads.map((channel) => {
            const latestVideo = channel.latestVideo;
            const thumbnail = latestVideo?.thumbnail?.url || latestVideo?.thumbnail;

            return (
              <article
                className="grid gap-4 rounded-[24px] border border-white/10 bg-[#181818] p-4 lg:grid-cols-[260px,minmax(0,1fr),160px]"
                key={channel._id}
              >
                <Link className="block overflow-hidden rounded-[18px] bg-black" to={`/watch/${latestVideo._id}`}>
                  <div className="aspect-video">
                    {thumbnail ? (
                      <img alt={latestVideo.title} className="h-full w-full object-cover" src={thumbnail} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-white/35">No thumbnail</div>
                    )}
                  </div>
                </Link>

                <div className="min-w-0">
                  <Link className="line-clamp-2 text-xl font-semibold tracking-[-0.03em] text-white" to={`/watch/${latestVideo._id}`}>
                    {latestVideo.title}
                  </Link>
                  <div className="mt-3 flex items-center gap-3">
                    <Avatar className="h-10 w-10 rounded-full" name={channel.fullName || channel.username} src={channel.avatar} />
                    <div className="min-w-0">
                      <Link className="block truncate text-sm font-medium text-white/85" to={`/channel/${channel.username}`}>
                        {channel.fullName || channel.username}
                      </Link>
                      <p className="text-xs text-white/42">@{channel.username}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-3 lg:items-end">
                  <p className="text-sm text-white/45">{formatTimeAgo(latestVideo.createdAt)}</p>
                  <div className="flex gap-2 lg:flex-col lg:items-stretch">
                    <Link className="gradient-button justify-center !px-4 !py-2 text-sm" to={`/watch/${latestVideo._id}`}>
                      Watch
                    </Link>
                    <Link className="alt-button justify-center !px-4 !py-2 text-sm" to={`/channel/${channel.username}`}>
                      Channel
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default SubscriptionsPage;
