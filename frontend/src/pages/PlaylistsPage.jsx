import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthGate from "../components/AuthGate.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { apiRequest } from "../lib/api.js";
import { formatCount, formatTimeAgo } from "../lib/utils.js";
import { useAuth } from "../state/AuthContext.jsx";

/* Playlist thumbnail mosaic — shows up to 4 small thumbnails */
const PlaylistThumbnail = ({ playlist }) => {
  const thumbs = (playlist.videos || [])
    .map((v) => v?.thumbnail?.url || v?.thumbnail)
    .filter(Boolean)
    .slice(0, 4);

  if (thumbs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-[#272727]">
        <svg className="h-10 w-10 text-[#aaaaaa]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 6h12M8 12h12M8 18h12M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      </div>
    );
  }

  if (thumbs.length === 1) {
    return <img alt="playlist" className="h-full w-full object-cover" src={thumbs[0]} />;
  }

  return (
    <div className="grid h-full grid-cols-2 gap-0.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="overflow-hidden bg-[#3f3f3f]" key={i}>
          {thumbs[i] ? (
            <img alt="" className="h-full w-full object-cover" src={thumbs[i]} />
          ) : (
            <div className="h-full bg-[#272727]" />
          )}
        </div>
      ))}
    </div>
  );
};

const PlaylistsPage = () => {
  const { user, loading } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [busy, setBusy] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const loadPlaylists = async () => {
    if (!user?._id) { setPlaylists([]); setBusy(false); return; }
    setBusy(true);
    setError("");
    try {
      const response = await apiRequest(`/api/v1/playlists/user/${user._id}`);
      setPlaylists(response?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { loadPlaylists(); }, [user?._id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#272727] border-t-[#f1f1f1]" />
      </div>
    );
  }

  if (!user) {
    return <AuthGate description="Sign in to manage your playlists." title="Sign in to view playlists" />;
  }

  return (
    <div className="space-y-6 text-[#f1f1f1]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#f1f1f1]">Playlists</h1>
        <button className="alt-button" onClick={() => setShowCreate((v) => !v)} type="button">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New playlist
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-5">
          <h2 className="mb-4 text-base font-medium text-[#f1f1f1]">Create playlist</h2>
          {message && <div className="mb-4 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">{message}</div>}
          {error && <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              setError(""); setMessage("");
              try {
                await apiRequest("/api/v1/playlists", { method: "POST", body: form });
                setForm({ name: "", description: "" });
                setMessage("Playlist created.");
                setShowCreate(false);
                await loadPlaylists();
              } catch (err) { setError(err.message); }
              finally { setSubmitting(false); }
            }}
          >
            <div>
              <label className="mb-1.5 block text-sm text-[#aaaaaa]">Name (required)</label>
              <input className="input-shell" onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} placeholder="Playlist name" required value={form.name} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-[#aaaaaa]">Description</label>
              <textarea className="input-shell min-h-[80px] resize-none" onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} placeholder="Description (optional)" value={form.description} />
            </div>
            <div className="flex gap-2">
              <button className="alt-button" disabled={submitting} type="submit">{submitting ? "Creating..." : "Create"}</button>
              <button className="ghost-button" onClick={() => setShowCreate(false)} type="button">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {busy ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="animate-pulse rounded-xl bg-[#272727]" key={i} style={{ height: 220 }} />
          ))}
        </div>
      ) : playlists.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {playlists.map((playlist) => (
            <Link
              className="group overflow-hidden rounded-xl bg-transparent hover:bg-[#272727] transition"
              key={playlist._id}
              to={`/playlists/${playlist._id}`}
            >
              {/* Thumbnail mosaic */}
              <div className="relative aspect-video overflow-hidden rounded-xl bg-[#272727]">
                <PlaylistThumbnail playlist={playlist} />
                {/* Video count overlay */}
                <div className="absolute inset-y-0 right-0 flex w-1/3 flex-col items-center justify-center gap-1 bg-black/70">
                  <span className="text-lg font-bold text-white">{formatCount(playlist.totalVideos)}</span>
                  <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="p-2">
                <p className="line-clamp-1 text-sm font-medium text-[#f1f1f1]">{playlist.name}</p>
                <p className="mt-0.5 text-xs text-[#aaaaaa]">Playlist · {formatTimeAgo(playlist.updatedAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          description="Create a playlist to organise videos you want to watch."
          title="No playlists yet"
          action={<button className="alt-button" onClick={() => setShowCreate(true)} type="button">Create playlist</button>}
        />
      )}
    </div>
  );
};

export default PlaylistsPage;
