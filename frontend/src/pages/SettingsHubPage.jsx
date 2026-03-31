import { useEffect, useState } from "react";
import AuthGate from "../components/AuthGate.jsx";
import Avatar from "../components/Avatar.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { apiRequest } from "../lib/api.js";
import { useAuth } from "../state/AuthContext.jsx";

const SettingsHubPage = () => {
  const { user, loading, refreshUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    username: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [selectedFiles, setSelectedFiles] = useState({
    avatar: "Choose a new avatar",
    coverImage: "Choose a cover image",
  });
  const [busy, setBusy] = useState({
    account: false,
    password: false,
    avatar: false,
    coverImage: false,
  });
  const [feedback, setFeedback] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setProfileForm({
      fullName: user.fullName || "",
      username: user.username || "",
      email: user.email || "",
    });
  }, [user]);

  const setBusyState = (key, value) => {
    setBusy((current) => ({ ...current, [key]: value }));
  };

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
  };

  if (loading) {
    return (
      <div className="glass-panel flex items-center gap-4 p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-[#ff2d2d]" />
        <div>
          <p className="font-semibold text-white">Opening settings</p>
          <p className="text-sm text-white/45">Loading your current account information.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthGate
        description="Settings are protected because they update your account details, password, avatar, and cover image."
        title="Sign in to manage settings"
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#181818] p-3">
        <div
          className="rounded-[24px] bg-cover bg-center p-6 text-white md:p-8"
          style={{
            backgroundImage: user.coverImage
              ? `linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.65)), url(${user.coverImage})`
              : "linear-gradient(135deg, rgba(24,24,24,0.98), rgba(71,18,18,0.9))",
          }}
        >
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex items-center gap-5">
              <Avatar className="h-24 w-24 rounded-full border-4 border-white/20" name={user.fullName} src={user.avatar} />
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                  Settings
                </p>
                <h1 className="font-display text-4xl md:text-5xl">Manage your creator identity.</h1>
                <p className="max-w-2xl text-sm leading-7 text-white/80">
                  Keep account details, visuals, and password management inside one dedicated control room.
                </p>
              </div>
            </div>
            <div className="rounded-full border border-white/15 bg-black/20 px-4 py-3 text-sm font-medium text-white/80">
              @{user.username}
            </div>
          </div>
        </div>
      </section>

      {feedback.message ? (
        <div
          className={`rounded-[24px] border px-5 py-4 text-sm ${
            feedback.type === "error"
              ? "border-rose-500/20 bg-rose-500/10 text-rose-300"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr),minmax(0,0.95fr)]">
        <div className="rounded-[28px] border border-white/10 bg-[#181818] p-6">
          <SectionHeader
            eyebrow="Account"
            title="Profile details"
            description="Update the name, username, and email your channel uses across the app."
          />
          <form
            className="mt-6 grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusyState("account", true);
              showFeedback("", "");

              try {
                await apiRequest("/api/v1/users/update-account", {
                  method: "PATCH",
                  body: profileForm,
                });
                await refreshUser();
                showFeedback("success", "Account details updated successfully.");
              } catch (requestError) {
                showFeedback("error", requestError.message);
              } finally {
                setBusyState("account", false);
              }
            }}
          >
            <input
              className="input-shell"
              onChange={(event) =>
                setProfileForm((current) => ({ ...current, fullName: event.target.value }))
              }
              placeholder="Full name"
              value={profileForm.fullName}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="input-shell"
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, username: event.target.value }))
                }
                placeholder="Username"
                value={profileForm.username}
              />
              <input
                className="input-shell"
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="Email"
                type="email"
                value={profileForm.email}
              />
            </div>
            <button className="gradient-button justify-self-start" disabled={busy.account} type="submit">
              {busy.account ? "Saving..." : "Save account details"}
            </button>
          </form>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#181818] p-6">
          <SectionHeader
            eyebrow="Security"
            title="Change password"
            description="Keep your account secure through the protected password endpoint already wired into the backend."
          />
          <form
            className="mt-6 grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusyState("password", true);
              showFeedback("", "");

              try {
                await apiRequest("/api/v1/users/change-password", {
                  method: "POST",
                  body: passwordForm,
                });
                setPasswordForm({ oldPassword: "", newPassword: "" });
                showFeedback("success", "Password changed successfully.");
              } catch (requestError) {
                showFeedback("error", requestError.message);
              } finally {
                setBusyState("password", false);
              }
            }}
          >
            <input
              className="input-shell"
              onChange={(event) =>
                setPasswordForm((current) => ({ ...current, oldPassword: event.target.value }))
              }
              placeholder="Current password"
              type="password"
              value={passwordForm.oldPassword}
            />
            <input
              className="input-shell"
              onChange={(event) =>
                setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
              }
              placeholder="New password"
              type="password"
              value={passwordForm.newPassword}
            />
            <button className="alt-button justify-self-start" disabled={busy.password} type="submit">
              {busy.password ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-[#181818] p-6">
          <SectionHeader
            eyebrow="Avatar"
            title="Update profile image"
            description="Choose the image that appears across comments, channel cards, and your signed-in shell."
          />

          <div className="mt-6 flex items-center gap-4 rounded-[24px] border border-white/10 bg-[#121212] p-4">
            <Avatar className="h-20 w-20 rounded-full" name={user.fullName} src={user.avatar} />
            <div>
              <p className="font-semibold text-white">Current avatar</p>
              <p className="mt-1 text-sm leading-7 text-white/45">{selectedFiles.avatar}</p>
            </div>
          </div>

          <form
            className="mt-6 grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const avatar = formData.get("avatar");

              if (!(avatar instanceof File) || !avatar.size) {
                showFeedback("error", "Please choose an avatar image first.");
                return;
              }

              setBusyState("avatar", true);
              showFeedback("", "");

              try {
                await apiRequest("/api/v1/users/avatar", {
                  method: "PATCH",
                  body: formData,
                });
                await refreshUser();
                event.currentTarget.reset();
                setSelectedFiles((current) => ({ ...current, avatar: "Choose a new avatar" }));
                showFeedback("success", "Avatar updated successfully.");
              } catch (requestError) {
                showFeedback("error", requestError.message);
              } finally {
                setBusyState("avatar", false);
              }
            }}
          >
            <label className="rounded-[22px] border border-white/10 bg-[#121212] p-4 text-sm text-white/55">
              <span className="font-medium text-white">Avatar file</span>
              <input
                accept="image/*"
                className="mt-3 block w-full text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-[#272727] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                name="avatar"
                onChange={(event) =>
                  setSelectedFiles((current) => ({
                    ...current,
                    avatar: event.target.files?.[0]?.name || "Choose a new avatar",
                  }))
                }
                type="file"
              />
            </label>
            <button className="gradient-button justify-self-start" disabled={busy.avatar} type="submit">
              {busy.avatar ? "Uploading..." : "Upload avatar"}
            </button>
          </form>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#181818] p-6">
          <SectionHeader
            eyebrow="Cover image"
            title="Style your channel banner"
            description="Upload the image that appears across the top of your channel page."
          />

          <div
            className="mt-6 h-48 rounded-[24px] border border-white/10 bg-cover bg-center p-4"
            style={{
              backgroundImage: user.coverImage
                ? `linear-gradient(135deg, rgba(0,0,0,0.35), rgba(0,0,0,0.5)), url(${user.coverImage})`
                : "linear-gradient(135deg, rgba(24,24,24,0.98), rgba(71,18,18,0.9))",
            }}
          >
            <div className="inline-flex rounded-full border border-white/10 bg-black/25 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
              Current channel cover
            </div>
          </div>

          <form
            className="mt-6 grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const coverImage = formData.get("coverImage");

              if (!(coverImage instanceof File) || !coverImage.size) {
                showFeedback("error", "Please choose a cover image first.");
                return;
              }

              setBusyState("coverImage", true);
              showFeedback("", "");

              try {
                await apiRequest("/api/v1/users/cover-image", {
                  method: "PATCH",
                  body: formData,
                });
                await refreshUser();
                event.currentTarget.reset();
                setSelectedFiles((current) => ({
                  ...current,
                  coverImage: "Choose a cover image",
                }));
                showFeedback("success", "Cover image updated successfully.");
              } catch (requestError) {
                showFeedback("error", requestError.message);
              } finally {
                setBusyState("coverImage", false);
              }
            }}
          >
            <label className="rounded-[22px] border border-white/10 bg-[#121212] p-4 text-sm text-white/55">
              <span className="font-medium text-white">Cover image file</span>
              <input
                accept="image/*"
                className="mt-3 block w-full text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-[#272727] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                name="coverImage"
                onChange={(event) =>
                  setSelectedFiles((current) => ({
                    ...current,
                    coverImage: event.target.files?.[0]?.name || "Choose a cover image",
                  }))
                }
                type="file"
              />
              <span className="mt-3 block text-xs text-white/40">{selectedFiles.coverImage}</span>
            </label>
            <button className="alt-button justify-self-start" disabled={busy.coverImage} type="submit">
              {busy.coverImage ? "Uploading..." : "Upload cover image"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default SettingsHubPage;
