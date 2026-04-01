import { Link } from "react-router-dom";
import Avatar from "./Avatar.jsx";

const icons = {
  dashboard: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  content: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="15" rx="2" /><path d="M16 3H8" /><path d="M10 11l5 3-5 3z" fill="currentColor" />
    </svg>
  ),
  analytics: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 17h4l3-8 4 10 3-6h4" />
    </svg>
  ),
  comments: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  subtitles: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M7 15h4M7 11h10" />
    </svg>
  ),
  customization: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8.57 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.25 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8.57a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.92 4.25a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8.92a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  audio: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18V5l10-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  ),
  upload: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  ),
  settings: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8.57 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.25 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8.57a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.92 4.25a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8.92a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};

// Items that stay within /studio use ?view= param; others navigate away
const ITEMS = [
  { id: "dashboard", label: "Dashboard", to: "/studio", icon: "dashboard" },
  { id: "content", label: "Content", to: "/studio?view=content", icon: "content" },
  { id: "analytics", label: "Analytics", to: "/studio?view=analytics", icon: "analytics" },
  { id: "comments", label: "Comments", to: "/studio?view=comments", icon: "comments" },
  { id: "subtitles", label: "Subtitles", to: "/studio?view=subtitles", icon: "subtitles" },
  { id: "customization", label: "Customization", to: "/settings", icon: "customization" },
  { id: "audio", label: "Audio Library", to: "/studio?view=audio", icon: "audio" },
  { id: "upload", label: "Upload", to: "/upload", icon: "upload" },
  { id: "settings", label: "Settings", to: "/settings", icon: "settings" },
];

const StudioSidebar = ({ active = "dashboard", user }) => {
  return (
    <aside className="hidden w-56 flex-shrink-0 xl:block">
      <div className="mb-4 flex items-center gap-2 px-2">
        <div className="flex h-[18px] w-[26px] items-center justify-center rounded-sm bg-[#ff0000]">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
        </div>
        <div>
          <span className="text-sm font-bold text-[#f1f1f1]">VideoTube</span>
          <span className="ml-1 text-xs text-[#aaaaaa]">Studio</span>
        </div>
      </div>

      {user && (
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-[#272727] px-3 py-3">
          <Avatar className="h-9 w-9 rounded-full" name={user.fullName} src={user.avatar} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#f1f1f1]">{user.fullName}</p>
            <p className="truncate text-xs text-[#aaaaaa]">Your channel</p>
          </div>
        </div>
      )}

      <nav className="space-y-0.5">
        {ITEMS.map((item) => {
          const isActiveItem = item.id === active;
          return (
            <Link
              className={`flex items-center gap-4 rounded-none border-l-4 px-3 py-2.5 text-sm transition ${
                isActiveItem
                  ? "border-[#3ea6ff] bg-[#272727] font-medium text-[#3ea6ff]"
                  : "border-transparent text-[#aaaaaa] hover:bg-[#272727] hover:text-[#f1f1f1]"
              }`}
              key={item.id}
              to={item.to}
            >
              <span className={isActiveItem ? "text-[#3ea6ff]" : ""}>{icons[item.icon]}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default StudioSidebar;
