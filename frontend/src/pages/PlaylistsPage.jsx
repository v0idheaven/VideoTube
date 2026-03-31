import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthGate from "../components/AuthGate.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { apiRequest } from "../lib/api.js";
import { formatCount, formatTimeAgo } from "../lib/utils.js";
import { useAuth } from "../state/AuthContext.jsx";

const PlaylistsPage = () => {
  const { user, loading } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [busy, setBusy] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const loadPlaylists = async () => {
    if (!user?._id) {
      setPlaylists([]);
      setBusy(false);
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await apiRequest(`/api/v1/playlists/user/${user._id}`);
      setPlaylists(response?.data || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, [user?._id]);

  if (loading) {
    return (
      <div className="glass-panel flex items-center gap-4 p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-red-500" />
        <div>
          <p className="font-semibold text-white">Loading playlists</p>
          <p className="text-sm text-white/45">Opening your saved video collections.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthGate
        description="Playlists are part of your personal library, so this page opens after sign-in."
        title="Sign in to manage playlists"
      />
    );
  }

  return (
    <div className="space-y-6 text-white">
      <section className="grid gap-6 xl:grid-cols-[360px,minmax(0,1fr)]">
        <div className="rounded-[28px] border border-white/10 bg-[#181818] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">Create playlist</p>
          <h1 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-white">Build a video collection</h1>
          <p className="mt-3 text-sm leading-7 text-white/48">
            Create themed playlists the same way a YouTube-style library does, then fill them from watch pages and your studio uploads.
          </p>

          {message ? (
            <div className="mt-5 rounded-[20px] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {message}
            </div>
          ) : null}

          <form
            className="mt-6 grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setSubmitting(true);
              setError("");
              setMessage("");

              try {
                await apiRequest("/api/v1/playlists", {
                  method: "POST",
                  body: form,
                });
                setForm({ name: "", description: "" });
                setMessage("Playlist created successfully.");
                await loadPlaylists();
              } catch (requestError) {
                setError(requestError.message);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <input
              className="input-shell"
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Playlist name"
              value={form.name}
            />
            <textarea
              className="input-shell min-h-28 resize-none py-4"
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Describe what belongs in this playlist"
              value={form.description}
            />
            <button className="gradient-button justify-center" disabled={submitting} type="submit">
              {submitting ? "Creating..." : "Create playlist"}
            </button>
          </form>

          {error ? (
            <div className="mt-5 rounded-[20px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          ) : null}
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#181818] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">Overview</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">Your playlists</h2>
          <p className="mt-3 text-sm leading-7 text-white/48">
            Distinct playlist cards with their own detail pages, instead of reusing the same feed surface everywhere.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { label: "Playlists", value: playlists.length },
              { label: "Saved videos", value: playlists.reduce((total, playlist) => total + (playlist.totalVideos || 0), 0) },
              { label: "Total views", value: playlists.reduce((total, playlist) => total + (playlist.totalViews || 0), 0) },
            ].map((item) => (
              <div className="rounded-[22px] border border-white/10 bg-[#121212] p-4" key={item.label}>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{formatCount(item.value)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {busy ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="h-64 animate-pulse rounded-[24px] bg-[#1b1b1b]" key={index} />
          ))}
        </div>
      ) : playlists.length ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {playlists.map((playlist) => (
            <Link
              className="group overflow-hidden rounded-[26px] border border-white/10 bg-[#181818] transition hover:border-white/20 hover:bg-[#1c1c1c]"
              key={playlist._id}
              to={`/playlists/${playlist._id}`}
            >
              <div className="aspect-[16/10] bg-[linear-gradient(135deg,#1d1d1d_0%,#281414_100%)] p-5">
                <div className="flex h-full flex-col justify-between">
                  <div className="inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
                    Playlist
                  </div>
                  <div>
                    <p className="text-sm text-white/45">{formatCount(playlist.totalVideos)} videos</p>
                    <h3 className="mt-3 line-clamp-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                      {playlist.name}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <p className="line-clamp-3 text-sm leading-7 text-white/50">{playlist.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-white/38">
                  <span>{formatCount(playlist.totalViews)} views</span>
                  <span>Updated {formatTimeAgo(playlist.updatedAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <EmptyState
          description="Create the first playlist to start building a more complete library experience."
          title="No playlists yet"
        />
      )}
    </div>
  );
};

export default PlaylistsPage;
