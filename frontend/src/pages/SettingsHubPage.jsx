import { useEffect, useState } from "react";
import AuthGate from "../components/AuthGate.jsx";
import Avatar from "../components/Avatar.jsx";
import { apiRequest } from "../lib/api.js";
import { useAuth } from "../state/AuthContext.jsx";

const SETTINGS_SECTIONS = [
  { id: "account", label: "Account" },
  { id: "notifications", label: "Notifications" },
  { id: "privacy", label: "Privacy" },
  { id: "appearance", label: "Appearance" },
  { id: "advanced", label: "Advanced" },
];

/* ── Toggle switch ── */
const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-start justify-between gap-4 py-4 border-b border-[rgba(255,255,255,0.08)] last:border-0">
    <div className="min-w-0">
      <p className="text-sm font-medium text-[#f1f1f1]">{label}</p>
      {description && <p className="mt-0.5 text-xs text-[#aaaaaa]">{description}</p>}
    </div>
    <button
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${checked ? "bg-[#3ea6ff]" : "bg-[#3f3f3f]"}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      type="button"
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  </div>
);

/* ── Section card ── */
const Card = ({ title, children }) => (
  <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-5">
    <h2 className="mb-4 text-base font-medium text-[#f1f1f1]">{title}</h2>
    {children}
  </div>
);

const SettingsHubPage = () => {
  const { user, loading, refreshUser } = useAuth();
  const [activeSection, setActiveSection] = useState("account");
  const [profileForm, setProfileForm] = useState({ fullName: "", username: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "" });
  const [selectedFiles, setSelectedFiles] = useState({ avatar: "", coverImage: "" });
  const [busy, setBusy] = useState({ account: false, password: false, avatar: false, coverImage: false });
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Notifications state
  const [notifs, setNotifs] = useState({
    emailSubscriptions: true,
    emailComments: true,
    emailLikes: false,
    pushAll: true,
    pushSubscriptions: true,
    pushComments: true,
    pushMentions: true,
  });

  // Privacy state
  const [privacy, setPrivacy] = useState({
    keepHistoryPaused: false,
    keepSearchPaused: false,
    showLikedVideos: false,
    showSubscriptions: false,
    showSavedPlaylists: false,
  });

  // Appearance state
  const [appearance, setAppearance] = useState({
    theme: "dark",
    density: "default",
    restrictedMode: false,
    autoplay: true,
    annotations: true,
  });

  useEffect(() => {
    if (!user) return;
    setProfileForm({ fullName: user.fullName || "", username: user.username || "", email: user.email || "" });
  }, [user]);

  const setBusyState = (key, value) => setBusy((c) => ({ ...c, [key]: value }));
  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    if (type === "success") setTimeout(() => setFeedback({ type: "", message: "" }), 4000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#272727] border-t-[#f1f1f1]" />
      </div>
    );
  }

  if (!user) {
    return <AuthGate description="Sign in to manage your account settings." title="Sign in to access settings" />;
  }

  return (
    <div className="flex gap-0 text-[#f1f1f1]">
      {/* Left sidebar */}
      <aside className="hidden w-64 flex-shrink-0 pr-6 md:block">
        <h1 className="mb-4 text-2xl font-semibold text-[#f1f1f1]">Settings</h1>
        <nav className="space-y-0.5">
          {SETTINGS_SECTIONS.map((section) => (
            <button
              className={`flex w-full items-center rounded-xl px-4 py-2.5 text-sm transition ${
                activeSection === section.id
                  ? "bg-[#272727] font-medium text-[#f1f1f1]"
                  : "text-[#aaaaaa] hover:bg-[#272727] hover:text-[#f1f1f1]"
              }`}
              key={section.id}
              onClick={() => { setActiveSection(section.id); showFeedback("", ""); }}
              type="button"
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1">
        {/* Mobile chips */}
        <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-hide md:hidden">
          {SETTINGS_SECTIONS.map((section) => (
            <button
              className={`yt-chip flex-shrink-0 ${activeSection === section.id ? "yt-chip-active" : ""}`}
              key={section.id}
              onClick={() => { setActiveSection(section.id); showFeedback("", ""); }}
              type="button"
            >
              {section.label}
            </button>
          ))}
        </div>

        {feedback.message && (
          <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${feedback.type === "error" ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-green-500/20 bg-green-500/10 text-green-300"}`}>
            {feedback.message}
          </div>
        )}

        {/* ── ACCOUNT ── */}
        {activeSection === "account" && (
          <div className="space-y-6">
            <Card title="Profile photo">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 rounded-full" name={user.fullName} src={user.avatar} />
                <div>
                  <p className="text-sm font-medium text-[#f1f1f1]">{user.fullName}</p>
                  <p className="text-xs text-[#aaaaaa]">@{user.username}</p>
                  <form
                    className="mt-3"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const avatar = formData.get("avatar");
                      if (!(avatar instanceof File) || !avatar.size) { showFeedback("error", "Please choose an image."); return; }
                      setBusyState("avatar", true); showFeedback("", "");
                      try {
                        await apiRequest("/api/v1/users/avatar", { method: "PATCH", body: formData });
                        await refreshUser();
                        e.currentTarget.reset();
                        setSelectedFiles((c) => ({ ...c, avatar: "" }));
                        showFeedback("success", "Profile photo updated.");
                      } catch (err) { showFeedback("error", err.message); }
                      finally { setBusyState("avatar", false); }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer rounded-full border border-[rgba(255,255,255,0.2)] px-3 py-1.5 text-xs text-[#f1f1f1] hover:bg-[#272727]">
                        {selectedFiles.avatar || "Choose photo"}
                        <input accept="image/*" className="hidden" name="avatar" onChange={(e) => setSelectedFiles((c) => ({ ...c, avatar: e.target.files?.[0]?.name || "" }))} type="file" />
                      </label>
                      {selectedFiles.avatar && (
                        <button className="rounded-full bg-[#3ea6ff] px-3 py-1.5 text-xs font-medium text-black disabled:opacity-60" disabled={busy.avatar} type="submit">
                          {busy.avatar ? "Saving..." : "Save"}
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </Card>

            <Card title="Channel banner">
              <div className="h-32 w-full overflow-hidden rounded-xl bg-cover bg-center" style={{ backgroundImage: user.coverImage ? `url(${user.coverImage})` : "linear-gradient(135deg,#1a1a2e,#16213e)" }} />
              <form
                className="mt-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const coverImage = formData.get("coverImage");
                  if (!(coverImage instanceof File) || !coverImage.size) { showFeedback("error", "Please choose an image."); return; }
                  setBusyState("coverImage", true); showFeedback("", "");
                  try {
                    await apiRequest("/api/v1/users/cover-image", { method: "PATCH", body: formData });
                    await refreshUser();
                    e.currentTarget.reset();
                    setSelectedFiles((c) => ({ ...c, coverImage: "" }));
                    showFeedback("success", "Channel banner updated.");
                  } catch (err) { showFeedback("error", err.message); }
                  finally { setBusyState("coverImage", false); }
                }}
              >
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer rounded-full border border-[rgba(255,255,255,0.2)] px-3 py-1.5 text-xs text-[#f1f1f1] hover:bg-[#272727]">
                    {selectedFiles.coverImage || "Upload banner"}
                    <input accept="image/*" className="hidden" name="coverImage" onChange={(e) => setSelectedFiles((c) => ({ ...c, coverImage: e.target.files?.[0]?.name || "" }))} type="file" />
                  </label>
                  {selectedFiles.coverImage && (
                    <button className="rounded-full bg-[#3ea6ff] px-3 py-1.5 text-xs font-medium text-black disabled:opacity-60" disabled={busy.coverImage} type="submit">
                      {busy.coverImage ? "Saving..." : "Save"}
                    </button>
                  )}
                </div>
              </form>
            </Card>

            <Card title="Account details">
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusyState("account", true); showFeedback("", "");
                  try {
                    await apiRequest("/api/v1/users/update-account", { method: "PATCH", body: profileForm });
                    await refreshUser();
                    showFeedback("success", "Account details updated.");
                  } catch (err) { showFeedback("error", err.message); }
                  finally { setBusyState("account", false); }
                }}
              >
                <div>
                  <label className="mb-1.5 block text-sm text-[#aaaaaa]">Full name</label>
                  <input className="input-shell" onChange={(e) => setProfileForm((c) => ({ ...c, fullName: e.target.value }))} placeholder="Full name" value={profileForm.fullName} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm text-[#aaaaaa]">Username</label>
                    <input className="input-shell" onChange={(e) => setProfileForm((c) => ({ ...c, username: e.target.value }))} placeholder="Username" value={profileForm.username} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-[#aaaaaa]">Email</label>
                    <input className="input-shell" onChange={(e) => setProfileForm((c) => ({ ...c, email: e.target.value }))} placeholder="Email" type="email" value={profileForm.email} />
                  </div>
                </div>
                <button className="alt-button" disabled={busy.account} type="submit">
                  {busy.account ? "Saving..." : "Save changes"}
                </button>
              </form>
            </Card>

            <Card title="Change password">
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusyState("password", true); showFeedback("", "");
                  try {
                    await apiRequest("/api/v1/users/change-password", { method: "POST", body: passwordForm });
                    setPasswordForm({ oldPassword: "", newPassword: "" });
                    showFeedback("success", "Password changed.");
                  } catch (err) { showFeedback("error", err.message); }
                  finally { setBusyState("password", false); }
                }}
              >
                <div>
                  <label className="mb-1.5 block text-sm text-[#aaaaaa]">Current password</label>
                  <input className="input-shell" onChange={(e) => setPasswordForm((c) => ({ ...c, oldPassword: e.target.value }))} placeholder="Current password" type="password" value={passwordForm.oldPassword} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-[#aaaaaa]">New password</label>
                  <input className="input-shell" onChange={(e) => setPasswordForm((c) => ({ ...c, newPassword: e.target.value }))} placeholder="New password (min 8 characters)" type="password" value={passwordForm.newPassword} />
                </div>
                <button className="alt-button" disabled={busy.password} type="submit">
                  {busy.password ? "Updating..." : "Update password"}
                </button>
              </form>
            </Card>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {activeSection === "notifications" && (
          <div className="space-y-6">
            <Card title="Email notifications">
              <Toggle
                checked={notifs.emailSubscriptions}
                onChange={(v) => setNotifs((c) => ({ ...c, emailSubscriptions: v }))}
                label="Subscriptions"
                description="Get notified when channels you subscribe to upload new videos"
              />
              <Toggle
                checked={notifs.emailComments}
                onChange={(v) => setNotifs((c) => ({ ...c, emailComments: v }))}
                label="Comments on my videos"
                description="Get notified when someone comments on your videos"
              />
              <Toggle
                checked={notifs.emailLikes}
                onChange={(v) => setNotifs((c) => ({ ...c, emailLikes: v }))}
                label="Likes and reactions"
                description="Get notified when someone likes your videos or comments"
              />
            </Card>

            <Card title="Push notifications">
              <Toggle
                checked={notifs.pushAll}
                onChange={(v) => setNotifs((c) => ({ ...c, pushAll: v }))}
                label="All notifications"
                description="Turn off to disable all push notifications"
              />
              <Toggle
                checked={notifs.pushSubscriptions}
                onChange={(v) => setNotifs((c) => ({ ...c, pushSubscriptions: v }))}
                label="Subscriptions"
                description="New uploads from channels you subscribe to"
              />
              <Toggle
                checked={notifs.pushComments}
                onChange={(v) => setNotifs((c) => ({ ...c, pushComments: v }))}
                label="Comments"
                description="Replies and new comments on your videos"
              />
              <Toggle
                checked={notifs.pushMentions}
                onChange={(v) => setNotifs((c) => ({ ...c, pushMentions: v }))}
                label="Mentions"
                description="When someone mentions you in a comment"
              />
            </Card>

            <Card title="Notification frequency">
              <div className="space-y-3">
                {["All new activity", "Highlights only", "None"].map((opt) => (
                  <label className="flex cursor-pointer items-center gap-3" key={opt}>
                    <input
                      checked={opt === "All new activity"}
                      className="accent-[#3ea6ff]"
                      name="freq"
                      readOnly
                      type="radio"
                    />
                    <span className="text-sm text-[#f1f1f1]">{opt}</span>
                  </label>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ── PRIVACY ── */}
        {activeSection === "privacy" && (
          <div className="space-y-6">
            <Card title="History & privacy">
              <Toggle
                checked={privacy.keepHistoryPaused}
                onChange={(v) => setPrivacy((c) => ({ ...c, keepHistoryPaused: v }))}
                label="Pause watch history"
                description="Videos you watch won't be added to your watch history"
              />
              <Toggle
                checked={privacy.keepSearchPaused}
                onChange={(v) => setPrivacy((c) => ({ ...c, keepSearchPaused: v }))}
                label="Pause search history"
                description="Searches won't be saved to your search history"
              />
            </Card>

            <Card title="Channel visibility">
              <Toggle
                checked={privacy.showLikedVideos}
                onChange={(v) => setPrivacy((c) => ({ ...c, showLikedVideos: v }))}
                label="Keep liked videos private"
                description="Other people won't be able to see videos you've liked"
              />
              <Toggle
                checked={privacy.showSubscriptions}
                onChange={(v) => setPrivacy((c) => ({ ...c, showSubscriptions: v }))}
                label="Keep subscriptions private"
                description="Other people won't be able to see channels you subscribe to"
              />
              <Toggle
                checked={privacy.showSavedPlaylists}
                onChange={(v) => setPrivacy((c) => ({ ...c, showSavedPlaylists: v }))}
                label="Keep saved playlists private"
                description="Other people won't be able to see your saved playlists"
              />
            </Card>

            <Card title="Data & personalisation">
              <div className="space-y-3 text-sm text-[#aaaaaa]">
                <p>Your data is used to personalise your VideoTube experience, including recommendations and ads.</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button className="alt-button text-xs" type="button">Download your data</button>
                  <button className="alt-button text-xs" type="button">Manage activity</button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ── APPEARANCE ── */}
        {activeSection === "appearance" && (
          <div className="space-y-6">
            <Card title="Theme">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { id: "dark", label: "Dark theme", icon: "🌙" },
                  { id: "light", label: "Light theme", icon: "☀️" },
                  { id: "system", label: "Use device theme", icon: "💻" },
                ].map((opt) => (
                  <button
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition ${
                      appearance.theme === opt.id
                        ? "border-[#3ea6ff] bg-[#263850] text-[#3ea6ff]"
                        : "border-[rgba(255,255,255,0.1)] text-[#aaaaaa] hover:border-[rgba(255,255,255,0.2)] hover:text-[#f1f1f1]"
                    }`}
                    key={opt.id}
                    onClick={() => setAppearance((c) => ({ ...c, theme: opt.id }))}
                    type="button"
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card title="Density">
              <div className="space-y-2">
                {[
                  { id: "default", label: "Default", desc: "Standard spacing between elements" },
                  { id: "comfortable", label: "Comfortable", desc: "More space between elements" },
                  { id: "compact", label: "Compact", desc: "Less space, more content visible" },
                ].map((opt) => (
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      appearance.density === opt.id
                        ? "border-[#3ea6ff] bg-[#263850]"
                        : "border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
                    }`}
                    key={opt.id}
                  >
                    <input
                      checked={appearance.density === opt.id}
                      className="mt-0.5 accent-[#3ea6ff]"
                      onChange={() => setAppearance((c) => ({ ...c, density: opt.id }))}
                      type="radio"
                    />
                    <div>
                      <p className="text-sm font-medium text-[#f1f1f1]">{opt.label}</p>
                      <p className="text-xs text-[#aaaaaa]">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </Card>

            <Card title="Playback">
              <Toggle
                checked={appearance.autoplay}
                onChange={(v) => setAppearance((c) => ({ ...c, autoplay: v }))}
                label="Autoplay next video"
                description="Automatically play the next video when the current one ends"
              />
              <Toggle
                checked={appearance.annotations}
                onChange={(v) => setAppearance((c) => ({ ...c, annotations: v }))}
                label="Show annotations"
                description="Show interactive cards and end screens on videos"
              />
              <Toggle
                checked={appearance.restrictedMode}
                onChange={(v) => setAppearance((c) => ({ ...c, restrictedMode: v }))}
                label="Restricted mode"
                description="Filter out potentially mature content"
              />
            </Card>
          </div>
        )}

        {/* ── ADVANCED ── */}
        {activeSection === "advanced" && (
          <div className="space-y-6">
            <Card title="Account information">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.08)]">
                  <span className="text-[#aaaaaa]">Full name</span>
                  <span className="text-[#f1f1f1]">{user.fullName}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.08)]">
                  <span className="text-[#aaaaaa]">Username</span>
                  <span className="text-[#f1f1f1]">@{user.username}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.08)]">
                  <span className="text-[#aaaaaa]">Email</span>
                  <span className="text-[#f1f1f1]">{user.email}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[#aaaaaa]">Account ID</span>
                  <span className="font-mono text-xs text-[#aaaaaa]">{user._id}</span>
                </div>
              </div>
            </Card>

            <Card title="Connected apps">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#272727] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3f3f3f]">
                      <svg className="h-5 w-5 text-[#aaaaaa]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#f1f1f1]">VideoTube API</p>
                      <p className="text-xs text-[#aaaaaa]">Connected · Full access</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-500/15 px-2.5 py-1 text-xs font-medium text-green-400">Active</span>
                </div>
                <p className="text-xs text-[#aaaaaa]">Apps you've authorised to access your VideoTube account will appear here.</p>
              </div>
            </Card>

            <Card title="Danger zone">
              <div className="space-y-4">
                <div className="rounded-xl border border-[rgba(255,255,255,0.1)] p-4">
                  <p className="text-sm font-medium text-[#f1f1f1]">Clear watch history</p>
                  <p className="mt-1 text-xs text-[#aaaaaa]">Remove all videos from your watch history. This cannot be undone.</p>
                  <button className="mt-3 rounded-full border border-[rgba(255,255,255,0.2)] px-4 py-2 text-xs text-[#f1f1f1] hover:bg-[#272727]" type="button">
                    Clear watch history
                  </button>
                </div>
                <div className="rounded-xl border border-red-500/20 p-4">
                  <p className="text-sm font-medium text-red-400">Delete account</p>
                  <p className="mt-1 text-xs text-[#aaaaaa]">Permanently delete your VideoTube account and all associated data. This action cannot be reversed.</p>
                  <button className="mt-3 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-400 hover:bg-red-500/20" type="button">
                    Delete account
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsHubPage;
