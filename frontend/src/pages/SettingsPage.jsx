import { useEffect, useState } from "react";
import AuthGate from "../components/AuthGate.jsx";
import Avatar from "../components/Avatar.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { apiRequest } from "../lib/api.js";
import { useAuth } from "../state/AuthContext.jsx";

const SettingsPage = () => {
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
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-900/10 border-t-[var(--coral)]" />
        <div>
          <p className="font-semibold text-slate-900">Opening settings</p>
          <p className="text-sm text-slate-500">Loading your current account information.</p>
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
      <section className="glass-panel overflow-hidden p-3">
        <div
          className="rounded-[28px] bg-cover bg-center p-8 text-white"
          style={{
            backgroundImage: user.coverImage
              ? `linear-gradient(135deg, rgba(15,23,42,0.75), rgba(207,99,48,0.6)), url(${user.coverImage})`
              : "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(207,99,48,0.82))",
          }}
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-5">
              <Avatar
                className="h-24 w-24 rounded-[28px] border-4 border-white/70"
                name={user.fullName}
                src={user.avatar}
              />
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                  Settings
                </p>
                <h1 className="font-display text-5xl">Manage your creator identity.</h1>
                <p className="max-w-2xl text-sm leading-7 text-white/80">
                  Avatar and cover image have been moved out of signup. Create the account first,
                  then style your profile here.
                </p>
              </div>
            </div>
            <div className="rounded-full bg-white/15 px-4 py-3 text-sm font-medium text-white backdrop-blur">
              @{user.username}
            </div>
          </div>
        </div>
      </section>

      {feedback.message ? (
        <div
          className={`rounded-[24px] border px-5 py-4 text-sm ${
            feedback.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="glass-panel space-y-5 p-6">
          <SectionHeader
            eyebrow="Account"
            title="Profile details"
            description="Update the name, username, and email your channel uses across the app."
          />
          <form
            className="grid gap-4"
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
            <button className="ghost-button justify-self-start" disabled={busy.account} type="submit">
              {busy.account ? "Saving..." : "Save account details"}
            </button>
          </form>
        </div>

        <div className="glass-panel space-y-5 p-6">
          <SectionHeader
            eyebrow="Security"
            title="Change password"
            description="Keep the account secure with the same protected endpoint already present in your backend."
          />
          <form
            className="grid gap-4"
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
            <button className="ghost-button justify-self-start" disabled={busy.password} type="submit">
              {busy.password ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel space-y-5 p-6">
          <SectionHeader
            eyebrow="Avatar"
            title="Update profile image"
            description="Choose the image that appears across comments, channel cards, and studio."
          />

          <div className="soft-panel flex items-center gap-4 p-4">
            <Avatar className="h-20 w-20 rounded-[24px]" name={user.fullName} src={user.avatar} />
            <div>
              <p className="font-semibold text-slate-900">Current avatar</p>
              <p className="mt-1 text-sm leading-7 text-slate-500">{selectedFiles.avatar}</p>
            </div>
          </div>

          <form
            className="grid gap-4"
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
            <label className="soft-panel grid gap-3 p-4 text-sm text-slate-600">
              <span className="font-medium text-slate-900">Avatar file</span>
              <input
                accept="image/*"
                className="block w-full text-sm"
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

        <div className="glass-panel space-y-5 p-6">
          <SectionHeader
            eyebrow="Cover image"
            title="Style your channel banner"
            description="Upload the image that appears across the top of your channel page."
          />

          <div
            className="soft-panel h-44 rounded-[26px] bg-cover bg-center p-4"
            style={{
              backgroundImage: user.coverImage
                ? `linear-gradient(135deg, rgba(27,105,119,0.58), rgba(207,99,48,0.52)), url(${user.coverImage})`
                : "linear-gradient(135deg, rgba(27,105,119,0.92), rgba(207,99,48,0.84))",
            }}
          >
            <div className="rounded-full bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700 backdrop-blur">
              Current channel cover
            </div>
          </div>

          <form
            className="grid gap-4"
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
            <label className="soft-panel grid gap-3 p-4 text-sm text-slate-600">
              <span className="font-medium text-slate-900">Cover image file</span>
              <input
                accept="image/*"
                className="block w-full text-sm"
                name="coverImage"
                onChange={(event) =>
                  setSelectedFiles((current) => ({
                    ...current,
                    coverImage: event.target.files?.[0]?.name || "Choose a cover image",
                  }))
                }
                type="file"
              />
              <span className="text-xs text-slate-500">{selectedFiles.coverImage}</span>
            </label>
            <button className="gradient-button justify-self-start" disabled={busy.coverImage} type="submit">
              {busy.coverImage ? "Uploading..." : "Upload cover image"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
