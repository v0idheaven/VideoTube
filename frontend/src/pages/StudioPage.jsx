import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthGate from "../components/AuthGate.jsx";
import Avatar from "../components/Avatar.jsx";
import EmptyState from "../components/EmptyState.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { apiRequest } from "../lib/api.js";
import { formatCount } from "../lib/utils.js";
import { useAuth } from "../state/AuthContext.jsx";

const StudioPage = () => {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadStudio = async () => {
    setBusy(true);
    setError("");

    try {
      const [statsResponse, videosResponse, historyResponse] = await Promise.all([
        apiRequest("/api/v1/dashboard/stats"),
        apiRequest("/api/v1/dashboard/videos"),
        apiRequest("/api/v1/users/watch-history"),
      ]);

      setStats(statsResponse?.data || null);
      setVideos(videosResponse?.data || []);
      setHistory(historyResponse?.data || []);
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
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-900/10 border-t-[var(--coral)]" />
        <div>
          <p className="font-semibold text-slate-900">Opening studio</p>
          <p className="text-sm text-slate-500">Verifying your session and loading stats.</p>
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
    <div className="space-y-6">
      <section className="glass-panel grid gap-8 overflow-hidden p-8 lg:grid-cols-[1.2fr,0.9fr]">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            Creator studio
          </p>
          <h1 className="font-display text-5xl leading-[0.95] text-slate-900 md:text-7xl">
            Shape the channel behind your backend.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-slate-600">
            Upload videos, track channel performance, and keep an eye on views,
            subscribers, likes, and your own watch history from one place.
          </p>
          <div className="flex items-center gap-4 rounded-[28px] border border-black/10 bg-white/70 p-4">
            <Avatar className="h-16 w-16 rounded-[22px]" name={user.fullName} src={user.avatar} />
            <div>
              <p className="text-lg font-semibold text-slate-900">{user.fullName}</p>
              <p className="text-sm text-slate-500">
                @{user.username} • {user.email}
              </p>
            </div>
          </div>
          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            { label: "Subscribers", value: stats?.totalSubscribers },
            { label: "Total likes", value: stats?.totalLikes },
            { label: "Total views", value: stats?.totalViews },
            { label: "Videos", value: stats?.totalVideos },
          ].map((item) => (
            <div className="soft-panel p-5" key={item.label}>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                {item.label}
              </p>
              <strong className="mt-3 block text-4xl text-slate-900">
                {busy ? "--" : formatCount(item.value)}
              </strong>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="glass-panel space-y-5 p-6" id="upload">
          <SectionHeader
            eyebrow="Upload"
            title="Publish a new video"
            description="This form hits the real multipart upload route with video and thumbnail fields."
          />
          <form
            className="grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);

              try {
                setMessage("");
                await apiRequest("/api/v1/videos", {
                  method: "POST",
                  body: formData,
                });
                event.currentTarget.reset();
                setMessage("Video uploaded successfully.");
                await loadStudio();
              } catch (requestError) {
                setError(requestError.message);
              }
            }}
          >
            <input className="input-shell" name="title" placeholder="Video title" required />
            <textarea
              className="input-shell min-h-28"
              name="description"
              placeholder="Tell viewers what this video is about"
              required
            />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="soft-panel space-y-2 p-4 text-sm text-slate-600">
                <span className="block font-medium text-slate-900">Video file</span>
                <input accept="video/*" className="block w-full" name="videoFile" required type="file" />
              </label>
              <label className="soft-panel space-y-2 p-4 text-sm text-slate-600">
                <span className="block font-medium text-slate-900">Thumbnail</span>
                <input accept="image/*" className="block w-full" name="thumbnail" required type="file" />
              </label>
            </div>
            <button className="gradient-button justify-self-start" type="submit">
              Upload Video
            </button>
          </form>
        </div>

        <div className="grid gap-6">
          <div className="glass-panel space-y-5 p-6">
            <SectionHeader
              eyebrow="Settings"
              title="Identity controls moved out"
              description="Avatar, cover image, account details, and password now live on the dedicated settings page."
            />
            <div className="soft-panel space-y-4 p-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 rounded-[18px]" name={user.fullName} src={user.avatar} />
                <div>
                  <p className="font-semibold text-slate-900">{user.fullName}</p>
                  <p className="text-sm text-slate-500">
                    Use settings to style your profile without cluttering the upload flow.
                  </p>
                </div>
              </div>
              <div className="grid gap-2 text-sm leading-7 text-slate-600">
                <p>Set avatar and cover image after account creation.</p>
                <p>Keep account edits and password changes in one focused place.</p>
                <p>Come back here when you want to upload and review channel performance.</p>
              </div>
              <Link className="gradient-button inline-flex w-fit" to="/settings">
                Open Settings
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="glass-panel space-y-5 p-6">
          <SectionHeader
            eyebrow="Your channel"
            title="Uploaded videos"
            description="Dashboard cards pulled from `/api/v1/dashboard/videos`."
          />
          {busy ? (
            <div className="soft-panel p-6 text-sm text-slate-500">Loading your videos...</div>
          ) : videos.length ? (
            <div className="grid gap-5 md:grid-cols-2">
              {videos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={{
                    ...video,
                    owner: {
                      username: user.username,
                      fullName: user.fullName,
                      avatar: user.avatar,
                    },
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              description="Your studio feed is empty. Upload the first clip to bring it to life."
              title="No uploads yet"
            />
          )}
        </div>

        <div className="glass-panel space-y-5 p-6">
          <SectionHeader
            eyebrow="Watch history"
            title="Recently watched"
            description="This section proves the user history endpoint is connected too."
          />
          {busy ? (
            <div className="soft-panel p-6 text-sm text-slate-500">Loading watch history...</div>
          ) : history.length ? (
            <div className="space-y-4">
              {history.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          ) : (
            <EmptyState
              description="Watch a couple of videos and they will appear here."
              title="No watch history yet"
              action={
                <Link className="gradient-button" to="/">
                  Discover videos
                </Link>
              }
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default StudioPage;
