import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import Avatar from "./Avatar.jsx";
import { apiRequest } from "../lib/api.js";
import { useAuth } from "../state/AuthContext.jsx";

const MenuIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const PlayIcon = () => (
  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="white">
    <path d="M8 5v14l11-7z" />
  </svg>
);
const SearchIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
  </svg>
);
const MicIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 16a4 4 0 0 0 4-4V7a4 4 0 1 0-8 0v5a4 4 0 0 0 4 4z" />
    <path d="M19 11a7 7 0 0 1-14 0" /><path d="M12 18v3" />
  </svg>
);
const PlusIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const BellIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 17H5.5a1.5 1.5 0 0 1-1.19-2.41l1.19-1.59V10a6.5 6.5 0 1 1 13 0v3l1.19 1.59A1.5 1.5 0 0 1 18.5 17H17" />
    <path d="M9 20a3 3 0 0 0 6 0" />
  </svg>
);
const HomeIcon = ({ filled }) => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} strokeWidth="2">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H15v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
  </svg>
);
const ShortsIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.77 10.32l-1.2-.5L18 9c1.1-.55 1.54-1.9.99-3-.55-1.1-1.9-1.54-3-.99l-7 3.5c-.97.49-1.53 1.52-1.44 2.59.09 1.07.82 1.97 1.85 2.28l1.2.5L9 14c-1.1.55-1.54 1.9-.99 3 .37.74 1.09 1.18 1.85 1.18.38 0 .77-.09 1.15-.28l7-3.5c.97-.49 1.53-1.52 1.44-2.59-.09-1.07-.82-1.97-1.68-2.49zM10 14.5v-5l5 2.5-5 2.5z" />
  </svg>
);
const SubsIcon = ({ filled }) => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} strokeWidth="2">
    <rect x="2" y="7" width="20" height="15" rx="2" />
    <path d="M16 3H8" /><path d="M10 11l5 3-5 3z" fill="currentColor" />
  </svg>
);
const UserIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const HistoryIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12a8 8 0 1 0 2.34-5.66" /><path d="M4 4v5h5" /><path d="M12 8v5l3 2" />
  </svg>
);
const PlaylistIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 6h12M8 12h12M8 18h12M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
);
const ThumbIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);
const TrendingIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 17h4l3-8 4 10 3-6h4" />
  </svg>
);
const MusicIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18V5l10-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
  </svg>
);
const GamingIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="7" width="18" height="10" rx="4" />
    <path d="M8 12h4M10 10v4M16 11h.01M18 13h.01" />
  </svg>
);
const StudioIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="14" rx="3" /><path d="M8 20h8M12 18v2" />
  </svg>
);
const SettingsIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8.57 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.25 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8.57a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.92 4.25a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8.92a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const LogoutIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" />
  </svg>
);

const ICON_MAP = {
  home: HomeIcon, shorts: ShortsIcon, subscriptions: SubsIcon,
  user: UserIcon, history: HistoryIcon, playlists: PlaylistIcon,
  thumbs: ThumbIcon, trending: TrendingIcon, music: MusicIcon,
  gaming: GamingIcon, studio: StudioIcon, plus: PlusIcon,
  settings: SettingsIcon, logout: LogoutIcon,
};

const Divider = () => <div className="my-2 border-t border-[rgba(255,255,255,0.1)]" />;
const SectionLabel = ({ label }) => (
  <p className="mb-1 mt-1 px-3 text-sm font-medium text-[#f1f1f1]">{label}</p>
);

const AppShell = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const params = new URLSearchParams(search);
  const query = params.get("q") || "";
  const section = params.get("section") || "";
  const [searchValue, setSearchValue] = useState(query);
  const [subscriptionChannels, setSubscriptionChannels] = useState([]);
  const [subscriptionsBusy, setSubscriptionsBusy] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isStudioArea = pathname.startsWith("/studio") || pathname.startsWith("/upload");
  const isWatchPage = pathname.startsWith("/watch");
  const showSearch = !isStudioArea;
  const showSidebar = !isStudioArea && !isWatchPage;

  useEffect(() => { setSearchValue(query); }, [query]);

  useEffect(() => {
    if (!user?._id) { setSubscriptionChannels([]); setSubscriptionsBusy(false); return; }
    let cancelled = false;
    setSubscriptionsBusy(true);
    apiRequest(`/api/v1/subscriptions/u/${user._id}`)
      .then((r) => { if (!cancelled) setSubscriptionChannels((r?.data || []).map((i) => i.subscribedChannel).filter(Boolean)); })
      .catch(() => { if (!cancelled) setSubscriptionChannels([]); })
      .finally(() => { if (!cancelled) setSubscriptionsBusy(false); });
    return () => { cancelled = true; };
  }, [user?._id]);

  const primaryLinks = useMemo(() => [
    { id: "home", label: "Home", to: "/feed", icon: "home", feedRoot: true },
    { id: "shorts", label: "Shorts", to: "/feed?section=shorts", icon: "shorts", section: "shorts" },
    { id: "subscriptions", label: "Subscriptions", to: "/subscriptions", icon: "subscriptions", matches: ["/subscriptions"] },
  ], []);

  const libraryLinks = useMemo(() => user ? [
    { id: "channel", label: "Your channel", to: `/channel/${user.username}`, icon: "user", matches: ["/channel"] },
    { id: "history", label: "History", to: "/history", icon: "history", matches: ["/history"] },
    { id: "playlists", label: "Playlists", to: "/playlists", icon: "playlists", matches: ["/playlists"] },
    { id: "liked", label: "Liked videos", to: "/liked", icon: "thumbs", matches: ["/liked"] },
  ] : [], [user]);

  const exploreLinks = useMemo(() => [
    { id: "trending", label: "Trending", to: "/feed?section=trending", icon: "trending", section: "trending" },
    { id: "music", label: "Music", to: "/feed?section=music", icon: "music", section: "music" },
    { id: "gaming", label: "Gaming", to: "/feed?section=gaming", icon: "gaming", section: "gaming" },
  ], []);

  const creatorLinks = useMemo(() => [
    { id: "studio", label: "Studio", to: "/studio", icon: "studio", matches: ["/studio"] },
    { id: "upload", label: "Upload", to: "/upload", icon: "plus", matches: ["/upload"] },
    { id: "settings", label: "Settings", to: "/settings", icon: "settings", matches: ["/settings"] },
  ], []);

  const visibleSubscriptions = useMemo(() => subscriptionChannels.slice(0, 8), [subscriptionChannels]);

  const isActive = (item) => {
    if (item.feedRoot) return pathname === "/feed" && !section;
    if (item.section) return pathname === "/feed" && section === item.section;
    if (item.matches) return item.matches.some((m) => pathname.startsWith(m));
    return pathname === item.to;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const t = searchValue.trim();
    navigate(t ? `/feed?q=${encodeURIComponent(t)}` : "/feed");
  };

  const handleLogout = async () => { await logout(); navigate("/"); };

  const renderNavItem = (item, collapsed = false) => {
    const active = isActive(item);
    const IconComp = ICON_MAP[item.icon] || HomeIcon;

    if (collapsed) {
      return (
        <NavLink
          className={`flex h-14 w-full flex-col items-center justify-center gap-1 rounded-xl text-[10px] transition ${active ? "bg-[#272727] font-medium" : "hover:bg-[#272727]"}`}
          key={item.id}
          title={item.label}
          to={item.to}
        >
          <IconComp filled={active} />
          <span className="leading-none">{item.label.split(" ")[0]}</span>
        </NavLink>
      );
    }

    return (
      <NavLink
        className={`flex items-center gap-6 rounded-xl px-3 py-2 text-sm transition ${active ? "bg-[#272727] font-medium" : "hover:bg-[#272727]"}`}
        key={item.id}
        to={item.to}
      >
        <IconComp filled={active} />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f1f1f1]">
      {/* ── Header ── */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-2 bg-[#0f0f0f] px-4">
        <div className={`flex flex-shrink-0 items-center gap-1 ${showSidebar ? (sidebarOpen ? "w-60" : "w-[72px]") : ""}`}>
          <button className="yt-icon-button" onClick={() => setSidebarOpen((v) => !v)} type="button">
            <MenuIcon />
          </button>
          <Link className="flex items-center gap-1 text-[#f1f1f1]" to={user ? "/feed" : "/"}>
            <div className="flex h-[18px] w-[26px] items-center justify-center rounded-sm bg-[#ff0000]">
              <PlayIcon />
            </div>
            <span className="text-xl font-bold tracking-tight">VideoTube</span>
          </Link>
        </div>

        {showSearch && (
          <form className="mx-auto hidden max-w-[640px] flex-1 items-center gap-2 md:flex" onSubmit={handleSearch}>
            <div className="flex flex-1 overflow-hidden rounded-full border border-[#303030] bg-[#121212] focus-within:border-[#1c62b9]">
              <input
                className="w-full bg-transparent px-4 py-2 text-sm text-[#f1f1f1] outline-none placeholder:text-[#aaaaaa]"
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search"
                value={searchValue}
              />
              <button
                className="flex h-10 w-16 flex-shrink-0 items-center justify-center border-l border-[#303030] bg-[#222222] text-[#aaaaaa] hover:bg-[#2a2a2a] hover:text-[#f1f1f1]"
                type="submit"
              >
                <SearchIcon />
              </button>
            </div>
            <button className="yt-icon-button" type="button"><MicIcon /></button>
          </form>
        )}

        <div className="ml-auto flex items-center gap-1">
          {user ? (
            <>
              <Link
                className="hidden items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.2)] px-3 py-1.5 text-sm font-medium text-[#f1f1f1] hover:bg-[#272727] md:flex"
                to="/upload"
              >
                <PlusIcon />
                Create
              </Link>
              <button className="yt-icon-button" type="button"><BellIcon /></button>
              <Link className="ml-1 rounded-full" to="/settings">
                <Avatar className="h-8 w-8 rounded-full" name={user.fullName} src={user.avatar} />
              </Link>
            </>
          ) : (
            <Link
              className="flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.2)] px-3 py-1.5 text-sm font-medium text-[#3ea6ff] hover:bg-[#263850]"
              to="/login"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              Sign in
            </Link>
          )}
        </div>
      </header>

      {/* Mobile search */}
      {showSearch && (
        <div className="fixed inset-x-0 top-14 z-30 border-b border-[rgba(255,255,255,0.1)] bg-[#0f0f0f] px-3 pb-2 md:hidden">
          <form className="flex items-center gap-2" onSubmit={handleSearch}>
            <div className="flex flex-1 overflow-hidden rounded-full border border-[#303030] bg-[#121212]">
              <input
                className="w-full bg-transparent px-4 py-2 text-sm text-[#f1f1f1] outline-none placeholder:text-[#aaaaaa]"
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search"
                value={searchValue}
              />
              <button className="flex h-9 w-12 items-center justify-center border-l border-[#303030] bg-[#222222] text-[#aaaaaa]" type="submit">
                <SearchIcon />
              </button>
            </div>
            <button className="yt-icon-button h-9 w-9" type="button"><MicIcon /></button>
          </form>
        </div>
      )}

      <div className={showSearch ? "pt-[90px] md:pt-14" : "pt-14"}>
        {/* ── Sidebar ── */}
        {showSidebar && (
          <aside className={`fixed bottom-0 left-0 top-14 hidden overflow-y-auto bg-[#0f0f0f] py-3 transition-all duration-200 md:block ${sidebarOpen ? "w-60" : "w-[72px]"}`}>
            {sidebarOpen ? (
              <nav className="px-3">
                <div className="space-y-0.5">
                  {primaryLinks.map((item) => renderNavItem(item))}
                </div>
                <Divider />
                {user && (
                  <>
                    <SectionLabel label="You" />
                    <div className="space-y-0.5">
                      {libraryLinks.map((item) => renderNavItem(item))}
                    </div>
                    <Divider />
                    <SectionLabel label="Explore" />
                    <div className="space-y-0.5">
                      {exploreLinks.map((item) => renderNavItem(item))}
                    </div>
                    <Divider />
                    <SectionLabel label="Studio" />
                    <div className="space-y-0.5">
                      {creatorLinks.map((item) => renderNavItem(item))}
                    </div>
                    <Divider />
                    <SectionLabel label="Subscriptions" />
                    {subscriptionsBusy ? (
                      <div className="space-y-1 px-3 py-1">
                        {[1, 2, 3].map((i) => <div className="h-8 animate-pulse rounded-xl bg-[#272727]" key={i} />)}
                      </div>
                    ) : visibleSubscriptions.length ? (
                      <div className="space-y-0.5">
                        {visibleSubscriptions.map((ch) => (
                          <Link
                            className="flex items-center gap-6 rounded-xl px-3 py-2 text-sm hover:bg-[#272727]"
                            key={ch._id}
                            to={`/channel/${ch.username}`}
                          >
                            <Avatar className="h-6 w-6 rounded-full" name={ch.fullName || ch.username} src={ch.avatar} />
                            <span className="truncate">{ch.fullName || ch.username}</span>
                          </Link>
                        ))}
                        <Link className="flex items-center gap-6 rounded-xl px-3 py-2 text-sm text-[#aaaaaa] hover:bg-[#272727]" to="/subscriptions">
                          <span className="flex h-6 w-6 items-center justify-center text-base">›</span>
                          <span>See all</span>
                        </Link>
                      </div>
                    ) : (
                      <p className="px-3 py-2 text-xs text-[#aaaaaa]">No subscriptions yet</p>
                    )}
                    <Divider />
                    <button
                      className="flex w-full items-center gap-6 rounded-xl px-3 py-2 text-sm hover:bg-[#272727]"
                      onClick={handleLogout}
                      type="button"
                    >
                      <LogoutIcon />
                      <span>Sign out</span>
                    </button>
                  </>
                )}
              </nav>
            ) : (
              <nav className="flex flex-col items-center gap-1 px-1">
                {[...primaryLinks, ...(user ? libraryLinks : [])].map((item) => renderNavItem(item, true))}
              </nav>
            )}
          </aside>
        )}

        {/* Mobile nav */}
        {showSidebar && (
          <div className="border-b border-[rgba(255,255,255,0.1)] bg-[#0f0f0f] px-3 py-2 md:hidden">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {[...primaryLinks, ...libraryLinks.slice(0, 2)].map((item) => {
                const active = isActive(item);
                return (
                  <Link
                    className={`flex flex-shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm ${active ? "bg-[#272727] font-medium" : "hover:bg-[#272727]"}`}
                    key={item.id}
                    to={item.to}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Main ── */}
        <main className={showSidebar ? (sidebarOpen ? "md:ml-60" : "md:ml-[72px]") : ""}>
          <div className={
            isWatchPage ? "mx-auto max-w-[1760px] px-4 py-4 md:px-6"
            : pathname.startsWith("/channel") ? "mx-auto max-w-[1540px] px-4 py-4 md:px-6"
            : "mx-auto max-w-[1880px] px-4 py-4 md:px-6"
          }>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
