import { Link } from "react-router-dom";
import Avatar from "./Avatar.jsx";

const StudioIcon = ({ name, className = "h-[18px] w-[18px]" }) => {
  if (name === "dashboard") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1.4" />
        <rect x="14" y="3" width="7" height="7" rx="1.4" />
        <rect x="3" y="14" width="7" height="7" rx="1.4" />
        <rect x="14" y="14" width="7" height="7" rx="1.4" />
      </svg>
    );
  }

  if (name === "upload") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M17 8l-5-5-5 5" />
        <path d="M12 3v12" />
      </svg>
    );
  }

  if (name === "channel") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M21 8h-4" />
        <path d="M19 6v4" />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
};

const StudioSidebar = ({ active = "dashboard", user }) => {
  const items = [
    { id: "dashboard", label: "Dashboard", to: "/studio", icon: "dashboard" },
    { id: "upload", label: "Upload", to: "/upload", icon: "upload" },
    {
      id: "channel",
      label: "Channel",
      to: user?.username ? `/channel/${user.username}` : "/feed",
      icon: "channel",
    },
    { id: "settings", label: "Settings", to: "/settings", icon: "settings" },
  ];

  return (
    <aside className="space-y-4 rounded-[24px] border border-white/10 bg-[#111111] p-4">
      <div className="space-y-1">
        <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/30">
          Studio
        </p>
        {items.map((item) => {
          const isActive = item.id === active;

          return (
            <Link
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-white text-black"
                  : "text-white/72 hover:bg-[#1a1a1a] hover:text-white"
              }`}
              key={item.id}
              to={item.to}
            >
              <StudioIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {user ? (
        <div className="rounded-[22px] border border-white/10 bg-[#181818] p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 rounded-full" name={user.fullName} src={user.avatar} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user.fullName}</p>
              <p className="truncate text-xs text-white/42">@{user.username}</p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-[#121212] px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/30">
              Workspace
            </p>
            <p className="mt-2 text-sm leading-6 text-white/68">
              Dashboard, uploads, and channel identity stay synced from the same backend.
            </p>
          </div>
        </div>
      ) : null}
    </aside>
  );
};

export default StudioSidebar;
