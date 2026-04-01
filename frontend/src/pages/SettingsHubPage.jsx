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

const SettingsHubPage = () => {
  const { user, loading, refreshUser } = useAuth();
  const [activeSection, setActiveSection] = useState("account");
  const [profileForm, setProfileForm] = useState({ fullName: "", username: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "" });
  const [selectedFiles, setSelectedFiles] = useState({ avatar: "", coverImage: "" });
  const [busy, setBusy] = useState({ account: false, password: false, avatar: false, coverImage: false });
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    if (!user) return;
    setProfileForm({ fullName: user.fullName || "", username: user.username || "", email: user.email || "" });
  }, [user]);

  const setBusyState = (key, value) => setBusy((c) => ({ ...c, [key]: value }));
  const showFeedback = (type, message) => setFeedback({ type, message });

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
              onClick={() => setActiveSection(section.id)}
              type="button"
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Mobile section selector */}
        <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-hide md:hidden">
          {SETTINGS_SECTIONS.map((section) => (
            <button
              className={`yt-chip flex-shrink-0 ${activeSection === section.id ? "yt-chip-active" : ""}`}
              key={section.id}
              onClick={() => setActiveSection(section.id)}
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

        {activeSection === "account" && (
          <div className="space-y-6">
            {/* Profile photo */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-5">
              <h2 className="mb-4 text-base font-medium text-[#f1f1f1]">Profile photo</h2>
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
                      setBusyState("avatar", true);
                      showFeedback("", "");
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
            </div>

            {/* Channel banner */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-5">
              <h2 className="mb-4 text-base font-medium text-[#f1f1f1]">Channel banner</h2>
              <div
                className="h-32 w-full rounded-xl bg-cover bg-center"
                style={{
                  backgroundImage: user.coverImage
                    ? `url(${user.coverImage})`
                    : "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                }}
              />
              <form
                className="mt-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const coverImage = formData.get("coverImage");
                  if (!(coverImage instanceof File) || !coverImage.size) { showFeedback("error", "Please choose an image."); return; }
                  setBusyState("coverImage", true);
                  showFeedback("", "");
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
            </div>

            {/* Account details */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-5">
              <h2 className="mb-4 text-base font-medium text-[#f1f1f1]">Account details</h2>
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusyState("account", true);
                  showFeedback("", "");
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
            </div>

            {/* Password */}
            <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-5">
              <h2 className="mb-4 text-base font-medium text-[#f1f1f1]">Change password</h2>
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusyState("password", true);
                  showFeedback("", "");
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
            </div>
          </div>
        )}

        {activeSection !== "account" && (
          <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#212121] p-8 text-center">
            <p className="text-sm text-[#aaaaaa]">This section is not available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsHubPage;
