import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import Avatar from "./Avatar.jsx";
import { apiRequest } from "../lib/api.js";
import { useAuth } from "../state/AuthContext.jsx";

const Icon = ({ name, className = "h-5 w-5" }) => {
  if (name === "menu") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </svg>
    );
  }

  if (name === "play") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    );
  }

  if (name === "home") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3l9 7h-3v10h-5v-6H11v6H6V10H3l9-7z" />
      </svg>
    );
  }

  if (name === "shorts") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 6.5 10 3v5L5 5.5v13L12 21v-5l7 2.5z" />
      </svg>
    );
  }

  if (name === "subscriptions") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 5h14v14H5z" />
        <path d="m10 9 5 3-5 3z" />
      </svg>
    );
  }

  if (name === "user") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm0 2c-4.14 0-7.5 2.46-7.5 5.5 0 .83.67 1.5 1.5 1.5h12c.83 0 1.5-.67 1.5-1.5 0-3.04-3.36-5.5-7.5-5.5z" />
      </svg>
    );
  }

  if (name === "history") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 12a8 8 0 1 0 2.34-5.66" />
        <path d="M4 4v5h5" />
        <path d="M12 8v5l3 2" />
      </svg>
    );
  }

  if (name === "playlists") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 6h12" />
        <path d="M8 12h12" />
        <path d="M8 18h12" />
        <path d="M3 6h.01" />
        <path d="M3 12h.01" />
        <path d="M3 18h.01" />
      </svg>
    );
  }

  if (name === "thumbs") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 1.97-1.67l1.38-9A2 2 0 0 0 19.66 9z" />
        <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
      </svg>
    );
  }

  if (name === "trending") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 17h4l3-8 4 10 3-6h4" />
      </svg>
    );
  }

  if (name === "music") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 18V5l10-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    );
  }

  if (name === "gaming") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="7" width="18" height="10" rx="4" />
        <path d="M8 12h4" />
        <path d="M10 10v4" />
        <path d="M16 11h.01" />
        <path d="M18 13h.01" />
      </svg>
    );
  }

  if (name === "studio") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="14" rx="3" />
        <path d="M8 20h8" />
        <path d="M12 18v2" />
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

  if (name === "plus") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
    );
  }

  if (name === "mic") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 16a4 4 0 0 0 4-4V7a4 4 0 1 0-8 0v5a4 4 0 0 0 4 4z" />
        <path d="M19 11a7 7 0 0 1-14 0" />
        <path d="M12 18v3" />
      </svg>
    );
  }

  if (name === "bell") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M15 17H5.5a1.5 1.5 0 0 1-1.19-2.41l1.19-1.59V10a6.5 6.5 0 1 1 13 0v3l1.19 1.59A1.5 1.5 0 0 1 18.5 17H17" />
        <path d="M9 20a3 3 0 0 0 6 0" />
      </svg>
    );
  }

  if (name === "logout") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H4" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
};

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

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  useEffect(() => {
    if (!user?._id) {
      setSubscriptionChannels([]);
      setSubscriptionsBusy(false);
      return;
    }

    let cancelled = false;

    const loadSubscriptions = async () => {
      setSubscriptionsBusy(true);

      try {
        const response = await apiRequest(`/api/v1/subscriptions/u/${user._id}`);
        const channels = (response?.data || [])
          .map((item) => item.subscribedChannel)
          .filter(Boolean);

        if (!cancelled) {
          setSubscriptionChannels(channels);
        }
      } catch {
        if (!cancelled) {
          setSubscriptionChannels([]);
        }
      } finally {
        if (!cancelled) {
          setSubscriptionsBusy(false);
        }
      }
    };

    loadSubscriptions();

    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  const primaryLinks = useMemo(
    () => [
      { id: "home", label: "Home", to: "/feed", icon: "home", feedRoot: true },
      { id: "shorts", label: "Shorts", to: "/feed?section=shorts", icon: "shorts", section: "shorts" },
      {
        id: "subscriptions",
        label: "Subscriptions",
        to: "/subscriptions",
        icon: "subscriptions",
        matches: ["/subscriptions"],
      },
    ],
    []
  );

  const libraryLinks = useMemo(
    () =>
      user
        ? [
            {
              id: "channel",
              label: "Your channel",
              to: `/channel/${user.username}`,
              icon: "user",
              matches: ["/channel"],
            },
            { id: "history", label: "History", to: "/history", icon: "history", matches: ["/history"] },
            {
              id: "playlists",
              label: "Playlists",
              to: "/playlists",
              icon: "playlists",
              matches: ["/playlists"],
            },
            { id: "liked", label: "Liked videos", to: "/liked", icon: "thumbs", matches: ["/liked"] },
          ]
        : [],
    [user]
  );

  const exploreLinks = useMemo(
    () => [
      { id: "trending", label: "Trending", to: "/feed?section=trending", icon: "trending", section: "trending" },
      { id: "music", label: "Music", to: "/feed?section=music", icon: "music", section: "music" },
      { id: "gaming", label: "Gaming", to: "/feed?section=gaming", icon: "gaming", section: "gaming" },
    ],
    []
  );

  const creatorLinks = useMemo(
    () => [
      { id: "studio", label: "Studio", to: "/studio", icon: "studio", matches: ["/studio"] },
      { id: "upload", label: "Upload", to: "/upload", icon: "plus", matches: ["/upload"] },
      { id: "settings", label: "Settings", to: "/settings", icon: "settings", matches: ["/settings"] },
    ],
    []
  );

  const visibleSubscriptions = useMemo(
    () => subscriptionChannels.slice(0, 7),
    [subscriptionChannels]
  );

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmed = searchValue.trim();
    navigate(trimmed ? `/feed?q=${encodeURIComponent(trimmed)}` : "/feed");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const renderNavigationItem = (item, mobile = false, collapsed = false) => {
    const isActive = item.feedRoot
      ? pathname === "/feed" && !section
      : item.section
        ? pathname === "/feed" && section === item.section
        : item.matches
          ? item.matches.some((match) => pathname.startsWith(match))
          : pathname === item.to;

    if (collapsed) {
      return (
        <NavLink
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${isActive ? "bg-[#272727] text-white" : "text-white/70 hover:bg-[#272727] hover:text-white"}`}
          key={item.id}
          title={item.label}
          to={item.to}
        >
          <Icon className="h-[18px] w-[18px]" name={item.icon} />
        </NavLink>
      );
    }

    return (
      <NavLink
        className={`${
          isActive
            ? "yt-nav-item yt-nav-item-active"
            : mobile
              ? "yt-nav-item bg-[#181818]"
              : "yt-nav-item"
        }`}
        key={item.id}
        to={item.to}
      >
        <Icon className="h-[18px] w-[18px]" name={item.icon} />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#0f0f0f]/95 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-3 md:px-4">
          <div className={`flex min-w-0 items-center gap-2 ${showSidebar ? (sidebarOpen ? "md:w-[224px]" : "md:w-[72px]") : ""}`}>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/72 transition hover:bg-white/5 hover:text-white"
              onClick={() => setSidebarOpen((v) => !v)}
              type="button"
            >
              <Icon className="h-5 w-5" name="menu" />
            </button>
            <Link className="flex items-center gap-3 text-white" to={user ? "/feed" : "/"}>
              <div className="grid h-8 w-9 place-items-center rounded-[9px] bg-[#ff2d2d] shadow-[0_10px_24px_rgba(255,45,45,0.22)]">
                <Icon className="h-[16px] w-[16px] translate-x-[1px] text-white" name="play" />
              </div>
              <span className="text-xl font-semibold tracking-[-0.05em]">
                Video<span className="text-[#ff2d2d]">Tube</span>
              </span>
            </Link>
          </div>

          {showSearch ? (
            <form className="hidden flex-1 justify-center md:flex" onSubmit={handleSearch}>
              <div className="flex w-full max-w-[720px] items-center gap-3">
                <div className="flex flex-1 items-center overflow-hidden rounded-full border border-[#303030] bg-[#121212]">
                  <input
                    className="w-full bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/45"
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search"
                    value={searchValue}
                  />
                  <button
                    className="grid h-[42px] w-[66px] place-items-center border-l border-[#303030] bg-[#222222] text-white/80 transition hover:bg-[#2a2a2a] hover:text-white"
                    type="submit"
                  >
                    <Icon className="h-[18px] w-[18px]" name="search" />
                  </button>
                </div>
                <button className="yt-icon-button" type="button">
                  <Icon className="h-[18px] w-[18px]" name="mic" />
                </button>
              </div>
            </form>
          ) : (
            <div className="hidden flex-1 md:block" />
          )}

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            {user ? (
              <>
                <Link className="hidden items-center gap-2 rounded-full bg-[#272727] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#323232] md:inline-flex" to="/upload">
                  <Icon className="h-4 w-4" name="plus" />
                  Create
                </Link>
                <button className="hidden yt-icon-button md:inline-flex" type="button">
                  <Icon className="h-[18px] w-[18px]" name="bell" />
                </button>
                <Link className="rounded-full p-1 transition hover:bg-white/5" to="/settings">
                  <Avatar className="h-9 w-9 rounded-full" name={user.fullName} src={user.avatar} />
                </Link>
              </>
            ) : (
              <>
                <Link className="ghost-button !px-4 !py-2 text-sm" to="/login">
                  Sign in
                </Link>
                <Link className="gradient-button !px-4 !py-2 text-sm" to="/register">
                  Join
                </Link>
              </>
            )}
          </div>
        </div>

        {showSearch ? (
          <div className="border-t border-white/5 px-3 pb-3 md:hidden">
            <form className="flex items-center gap-2" onSubmit={handleSearch}>
              <div className="flex flex-1 items-center overflow-hidden rounded-full border border-[#303030] bg-[#121212]">
                <div className="pl-4 text-white/35">
                  <Icon className="h-[18px] w-[18px]" name="search" />
                </div>
                <input
                  className="w-full bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/40"
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search"
                  value={searchValue}
                />
                <button
                  className="grid h-[42px] w-[54px] place-items-center border-l border-[#303030] bg-[#222222] text-white/80"
                  type="submit"
                >
                  <Icon className="h-5 w-5" name="search" />
                </button>
              </div>
              <button className="yt-icon-button h-[42px] w-[42px]" type="button">
                <Icon className="h-[18px] w-[18px]" name="mic" />
              </button>
            </form>
          </div>
        ) : null}
      </header>

      <div className={`${showSearch ? "pt-[98px] md:pt-14" : "pt-14"}`}>
        {showSidebar ? (
          <aside className={`fixed bottom-0 left-0 top-14 hidden overflow-y-auto border-r border-white/10 bg-[#0f0f0f] px-3 py-3 transition-all duration-200 md:block ${sidebarOpen ? "w-[224px]" : "w-[72px]"}`}>
            <nav className="space-y-1">
              {primaryLinks.map((item) => renderNavigationItem(item, false, !sidebarOpen))}
            </nav>

            {user ? (
              <div className={`mt-3 ${!sidebarOpen ? "hidden" : ""}`}>
                <div className="border-t border-white/10 pt-3">
                  <p className="px-3 pb-2 text-sm font-medium text-white">You</p>
                  <div className="space-y-1">
                    {libraryLinks.map((item) => renderNavigationItem(item))}
                  </div>
                </div>

                <div className="mt-3 border-t border-white/10 pt-3">
                  <p className="px-3 pb-2 text-sm font-medium text-white">Explore</p>
                  <div className="space-y-1">
                    {exploreLinks.map((item) => renderNavigationItem(item))}
                  </div>
                </div>

                <div className="mt-3 border-t border-white/10 pt-3">
                  <p className="px-3 pb-2 text-sm font-medium text-white">Studio</p>
                  <div className="space-y-1">
                    {creatorLinks.map((item) => renderNavigationItem(item))}
                  </div>
                </div>

                <div className="mt-3 border-t border-white/10 pt-3">
                  <p className="px-3 pb-2 text-sm font-medium text-white">Subscriptions</p>
                  {subscriptionsBusy ? (
                    <div className="space-y-2 px-3 py-2">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div className="h-10 animate-pulse rounded-xl bg-[#181818]" key={index} />
                      ))}
                    </div>
                  ) : visibleSubscriptions.length ? (
                    <div className="space-y-1">
                      {visibleSubscriptions.map((channel) => (
                        <Link
                          className="yt-nav-item"
                          key={channel._id}
                          to={`/channel/${channel.username}`}
                        >
                          <Avatar
                            className="h-6 w-6 rounded-full"
                            name={channel.fullName || channel.username}
                            src={channel.avatar}
                          />
                          <span className="truncate">{channel.fullName || channel.username}</span>
                        </Link>
                      ))}
                      <Link
                        className="yt-nav-item text-white/58"
                        to="/subscriptions"
                      >
                        <Icon className="h-[18px] w-[18px]" name="subscriptions" />
                        <span>See all subscriptions</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2 px-3 py-2 text-sm text-white/48">
                      <p>Your real subscriptions will appear here after you follow a few channels.</p>
                      <Link className="inline-flex text-sm font-medium text-white transition hover:text-white/80" to="/feed">
                        Explore channels
                      </Link>
                    </div>
                  )}
                </div>

                <div className="mt-3 border-t border-white/10 pt-3">
                  <button
                    className="yt-nav-item w-full text-left"
                    onClick={handleLogout}
                    type="button"
                  >
                    <Icon className="h-[18px] w-[18px]" name="logout" />
                    Logout
                  </button>
                </div>
              </div>
            ) : null}
          </aside>
        ) : null}

        {showSidebar ? (
          <div className="border-b border-white/10 bg-[#0f0f0f] px-3 py-3 md:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[...primaryLinks, ...libraryLinks.slice(0, 2)].map((item) => renderNavigationItem(item, true))}
            </div>
          </div>
        ) : null}

        <main className={showSidebar ? (sidebarOpen ? "md:ml-[224px]" : "md:ml-[72px]") : ""}>
          <div className={pathname.startsWith("/channel") ? "mx-auto max-w-[1540px] px-4 py-6 md:px-6 md:py-8" : isWatchPage ? "mx-auto max-w-[1760px] px-4 py-6 md:px-6 md:py-8" : "mx-auto max-w-[1880px] px-4 py-6 md:px-6 md:py-8"}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
