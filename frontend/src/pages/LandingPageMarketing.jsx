import { Link } from "react-router-dom";
import { formatCount, formatDate, formatDuration } from "../lib/utils.js";

const fallbackVideos = [
  {
    _id: "demo-1",
    title: "Full stack app with React & Node.js",
    views: 48000,
    createdAt: "2026-03-24T00:00:00.000Z",
    duration: 754,
    owner: { username: "codewithvarun" },
  },
  {
    _id: "demo-2",
    title: "MongoDB aggregation pipelines explained",
    views: 22000,
    createdAt: "2026-03-21T00:00:00.000Z",
    duration: 501,
    owner: { username: "arjundev" },
  },
  {
    _id: "demo-3",
    title: "REST API from scratch full tutorial",
    views: 91000,
    createdAt: "2026-03-16T00:00:00.000Z",
    duration: 1447,
    owner: { username: "rahulcodes" },
  },
];

const mockSidebarItems = ["Home", "Trending", "Subscriptions", "Liked", "Playlists", "History"];

const featureCards = [
  {
    title: "HD video upload",
    description:
      "Upload any format. Cloudinary handles delivery, storage, and thumbnail-ready media flow behind the scenes.",
    icon: "play",
    iconBackground: "bg-[#2a0808]",
    iconColor: "text-[#ff5f57]",
  },
  {
    title: "Subscriptions",
    description:
      "Viewers can subscribe to channels they love and your channel pages are already wired to support that flow.",
    icon: "users",
    iconBackground: "bg-[#081420]",
    iconColor: "text-[#378add]",
  },
  {
    title: "Creator dashboard",
    description:
      "Track views, likes, uploads, and audience momentum from a dedicated studio experience backed by your API.",
    icon: "dashboard",
    iconBackground: "bg-[#081408]",
    iconColor: "text-[#639922]",
  },
  {
    title: "Comments and likes",
    description:
      "Keep engagement on every video with comment threads and like systems that plug directly into your backend.",
    icon: "comments",
    iconBackground: "bg-[#110820]",
    iconColor: "text-[#7f77dd]",
  },
  {
    title: "Playlists",
    description:
      "Group tutorials, breakdowns, or episodes into playlists so viewers stay inside the content loop longer.",
    icon: "list",
    iconBackground: "bg-[#1a1008]",
    iconColor: "text-[#ef9f27]",
  },
  {
    title: "Secure auth",
    description:
      "JWT auth, refresh tokens, hashing, upload validation, and rate limiting are now part of the real stack.",
    icon: "shield",
    iconBackground: "bg-[#081a14]",
    iconColor: "text-[#1d9e75]",
  },
];

const creatorChecklist = [
  "Real-time view and subscriber counts",
  "Publish or unpublish any video instantly",
  "Old thumbnails cleaned from Cloudinary",
  "Watch history with full video metadata",
  "Upload avatar and cover image through the real backend flow",
];

const getVideoCardTone = (index) => {
  if (index === 0) {
    return "from-[#1a0d2e] to-[#2a1a4e]";
  }

  if (index === 1) {
    return "from-[#0d1f14] to-[#0f2e1a]";
  }

  return "from-[#1a0808] to-[#2a0c0c]";
};

const getVideoAccent = (index) => {
  if (index === 0) {
    return "bg-[#7f77dd]";
  }

  if (index === 1) {
    return "bg-[#1d9e75]";
  }

  return "bg-[#d85a30]";
};

const getInitial = (value = "") => value.trim().charAt(0).toUpperCase() || "V";

const Icon = ({ name, className = "" }) => {
  if (name === "play") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" />
        <circle cx="9.5" cy="7" r="3" />
        <path d="M21 19v-1a4 4 0 0 0-3-3.87" />
        <path d="M16 4.13a3 3 0 0 1 0 5.74" />
      </svg>
    );
  }

  if (name === "dashboard") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="14" rx="2.5" />
        <path d="M8 20h8" />
        <path d="M12 18v2" />
      </svg>
    );
  }

  if (name === "comments") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }

  if (name === "list") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 6h13" />
        <path d="M8 12h13" />
        <path d="M8 18h13" />
        <path d="M3 6h.01" />
        <path d="M3 12h.01" />
        <path d="M3 18h.01" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
};

const PreviewVideoCard = ({ video, index }) => {
  const cardTone = getVideoCardTone(index);
  const accentTone = getVideoAccent(index);
  const content = (
    <article className="group">
      <div className="relative overflow-hidden rounded-lg border border-white/5 bg-[#101010]">
        {video.thumbnail ? (
          <img
            alt={video.title}
            className="aspect-[16/9] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            src={video.thumbnail}
          />
        ) : (
          <div className={`aspect-[16/9] bg-gradient-to-br ${cardTone} p-4`}>
            <div className="flex h-full flex-col justify-between rounded-md border border-white/5 bg-black/10 p-4">
              <div className={`h-2 w-16 rounded-full ${accentTone} opacity-80`} />
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-2 w-24 rounded-full bg-white/15" />
                  <div className="h-2 w-16 rounded-full bg-white/10" />
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/90">
                  <Icon className="h-4 w-4" name="play" />
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {formatDuration(video.duration)}
        </div>
      </div>
      <div className="mt-3 flex gap-3">
        <div className={`grid h-8 w-8 flex-none place-items-center rounded-full ${accentTone} text-xs font-semibold text-white`}>
          {getInitial(video.owner?.username)}
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-xs font-medium leading-5 text-white/95">{video.title}</p>
          <p className="mt-1 text-[11px] text-white/45">
            {video.owner?.username || "videotube"} · {formatCount(video.views)} views
          </p>
        </div>
      </div>
    </article>
  );

  if (!video.href) {
    return content;
  }

  return <Link to={video.href}>{content}</Link>;
};

const LandingPageMarketing = ({ user, videos = [], loading = false }) => {
  const showcase = (videos.length ? videos.slice(0, 3) : fallbackVideos).map((video) => ({
    ...video,
    href: video._id?.startsWith("demo-") ? null : `/watch/${video._id}`,
    owner: video.ownerDetails || video.owner || {},
    thumbnail: video.thumbnail?.url || video.thumbnail || "",
  }));

  const leadVideo = showcase[0];
  const totalViews = videos.reduce((sum, video) => sum + (Number(video.views) || 0), 0);
  const totalLikes = videos.reduce((sum, video) => sum + (Number(video.likesCount) || 0), 0);
  const totalPublishedVideos = videos.filter((video) => video.isPublished !== false).length;

  const stats = [
    {
      value: loading ? "--" : videos.length ? `${formatCount(videos.length)}+` : "2.4M+",
      label: videos.length ? "Videos available" : "Videos uploaded",
    },
    { value: user ? "1+" : "180K+", label: user ? "Your creator profile" : "Active creators" },
    { value: "99.9%", label: "Uptime SLA" },
    { value: "40+", label: "Countries" },
  ];

  const dashboardStats = [
    {
      label: "Total views",
      value: totalViews ? formatCount(totalViews) : "128K",
      note: totalViews ? "live from your current video feed" : "12% higher this month",
      noteTone: "text-emerald-400",
    },
    {
      label: "Subscribers",
      value: user ? `@${user.username}` : "4.2K",
      note: user ? "your channel is ready to grow" : "steady weekly growth",
      noteTone: "text-emerald-400",
    },
    {
      label: "Total likes",
      value: totalLikes ? formatCount(totalLikes) : "9.8K",
      note: totalLikes ? "engagement across current videos" : "strong creator retention",
      noteTone: "text-emerald-400",
    },
  ];

  const demoTarget = leadVideo?.href || "/login";
  const creatorTarget = user ? "/studio" : "/register";
  const signInTarget = user ? `/channel/${user.username}` : "/login";

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-[1520px] bg-[#0a0a0a]">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-5 md:px-8">
            <Link className="flex items-center gap-2 text-white" to="/">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#ff2d2d]">
                <Icon className="h-[18px] w-[18px]" name="play" />
              </div>
              <span className="text-lg font-semibold tracking-[-0.03em]">
                Video<span className="text-[#ff2d2d]">Tube</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-7 text-sm text-white/65 md:flex">
              <button className="transition hover:text-white" onClick={() => scrollToSection("features")} type="button">
                Features
              </button>
              <button className="transition hover:text-white" onClick={() => scrollToSection("creators")} type="button">
                Creators
              </button>
              <button className="transition hover:text-white" onClick={() => scrollToSection("cta")} type="button">
                Pricing
              </button>
              <button className="transition hover:text-white" onClick={() => scrollToSection("footer")} type="button">
                About
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/85 transition hover:border-white/30 hover:text-white"
                to={signInTarget}
              >
                {user ? "Channel" : "Sign in"}
              </Link>
              <Link
                className="rounded-lg bg-[#ff2d2d] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                to={creatorTarget}
              >
                {user ? "Open studio" : "Get started"}
              </Link>
            </div>
          </div>
        </header>

        <main>
          <section className="mx-auto max-w-[980px] px-5 pb-14 pt-20 text-center md:px-8 md:pt-24">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#3a1010] bg-[#1a0a0a] px-3.5 py-1.5 text-xs text-[#ff7070]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff2d2d]" />
              Now with HD streaming and live analytics
            </div>
            <h1 className="mx-auto mt-7 max-w-[820px] text-[clamp(2.8rem,8vw,4.4rem)] font-bold leading-[1.06] tracking-[-0.06em] text-white">
              Watch, share and grow with <span className="text-[#ff2d2d]">VideoTube</span>
            </h1>
            <p className="mx-auto mt-5 max-w-[620px] text-lg leading-8 text-white/50">
              The creator-first video platform. Upload videos, build your audience, and grow your channel with the same backend your app already runs on.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                className="rounded-[10px] bg-[#ff2d2d] px-7 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
                to={creatorTarget}
              >
                {user ? "Open studio" : "Start for free"}
              </Link>
              <button
                className="rounded-[10px] border border-white/15 px-7 py-3.5 text-sm font-medium text-white/80 transition hover:border-white/30 hover:text-white"
                onClick={() => scrollToSection("platform-preview")}
                type="button"
              >
                Watch demo
              </button>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div className="text-center" key={stat.label}>
                  <div className="text-[28px] font-bold tracking-[-0.04em] text-white">{stat.value}</div>
                  <div className="mt-1 text-[13px] text-white/35">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-[1040px] px-5 pb-20 md:px-8" id="platform-preview">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111] shadow-[0_28px_70px_rgba(0,0,0,0.45)]">
              <div className="flex items-center gap-2 border-b border-white/10 bg-[#1a1a1a] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <div className="ml-3 flex-1 rounded bg-[#111] px-3 py-1.5 text-xs text-white/30">
                  videotube.app/{leadVideo?.href ? `watch/${leadVideo._id}` : "feed"}
                </div>
              </div>

              <div className="grid min-h-[320px] md:grid-cols-[210px,1fr]">
                <aside className="hidden border-r border-white/10 bg-[#111] md:block">
                  <div className="space-y-1 py-4">
                    {mockSidebarItems.map((item, index) => (
                      <div
                        className={`flex items-center gap-3 px-5 py-2.5 text-sm ${
                          index === 0 ? "bg-[#1a1a1a] text-white" : "text-white/35"
                        }`}
                        key={item}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {item}
                      </div>
                    ))}
                  </div>
                </aside>

                <div className="bg-[#0f0f0f] p-5">
                  <div className="grid gap-5 md:grid-cols-3">
                    {showcase.map((video, index) => (
                      <PreviewVideoCard index={index} key={video._id} video={video} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-white/10 bg-[#111]">
            <div className="mx-auto grid max-w-[1200px] gap-4 px-5 md:grid-cols-2 md:px-8 xl:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  className={`px-4 py-7 text-center ${index < stats.length - 1 ? "xl:border-r xl:border-white/10" : ""}`}
                  key={`bar-${stat.label}`}
                >
                  <div className="text-[26px] font-bold tracking-[-0.04em] text-white">{stat.value}</div>
                  <div className="mt-1 text-[13px] text-white/35">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-[1120px] px-5 py-20 md:px-8" id="features">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#ff2d2d]">Everything you need</p>
              <h2 className="mt-4 text-[clamp(2.1rem,6vw,3.25rem)] font-bold tracking-[-0.05em] text-white">
                Built for creators and viewers
              </h2>
              <p className="mx-auto mt-3 max-w-[620px] text-base text-white/40">
                Every feature your backend already powers, now presented like a real product landing page instead of a placeholder.
              </p>
            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {featureCards.map((feature) => (
                <article
                  className="rounded-xl border border-white/10 bg-[#111] p-6 transition duration-200 hover:-translate-y-1 hover:border-white/20"
                  key={feature.title}
                >
                  <div className={`grid h-10 w-10 place-items-center rounded-[10px] ${feature.iconBackground} ${feature.iconColor}`}>
                    <Icon className="h-5 w-5" name={feature.icon} />
                  </div>
                  <h3 className="mt-5 max-w-[13rem] text-[1.65rem] font-bold leading-tight tracking-[-0.04em] text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/42">{feature.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="border-y border-white/10 bg-[#0d0d0d]" id="creators">
            <div className="mx-auto grid max-w-[1120px] gap-14 px-5 py-20 md:px-8 lg:grid-cols-[0.9fr,1.1fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#ff2d2d]">For creators</p>
                <h2 className="mt-4 text-[clamp(2.25rem,6vw,4rem)] font-bold leading-[1.02] tracking-[-0.06em] text-white">
                  Your channel, your data
                </h2>
                <p className="mt-5 max-w-[420px] text-[15px] leading-8 text-white/45">
                  Everything your audience does, views, likes, uploads, and subscriptions, flows into the same backend that powers your dashboard and studio.
                </p>

                <div className="mt-8 space-y-3.5">
                  {creatorChecklist.map((item) => (
                    <div className="flex items-start gap-3 text-sm text-white/80" key={item}>
                      <div className="mt-0.5 grid h-[18px] w-[18px] flex-none place-items-center rounded-full bg-[#1d0909] text-[#ff2d2d]">
                        <span className="text-[11px]">✓</span>
                      </div>
                      <span className="leading-6">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[14px] border border-white/10 bg-[#111] shadow-[0_26px_65px_rgba(0,0,0,0.32)]">
                <div className="border-b border-white/10 px-5 py-4">
                  <div className="text-sm font-semibold text-white">Channel dashboard</div>
                </div>

                <div className="space-y-5 p-5">
                  <div className="grid gap-3 md:grid-cols-3">
                    {dashboardStats.map((stat) => (
                      <div className="rounded-[10px] border border-white/10 bg-[#0f0f0f] p-4" key={stat.label}>
                        <div className="text-[11px] text-white/35">{stat.label}</div>
                        <div className="mt-3 text-[30px] font-bold tracking-[-0.05em] text-white">{stat.value}</div>
                        <div className={`mt-2 text-[11px] ${stat.noteTone}`}>{stat.note}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="mb-3 text-[11px] text-white/35">Top videos this month</div>
                    <div className="space-y-2">
                      {showcase.map((video, index) => (
                        <div
                          className="grid items-center gap-3 rounded-[10px] border border-white/10 bg-[#0f0f0f] px-3 py-3 md:grid-cols-[72px,1fr,auto]"
                          key={`dashboard-${video._id}`}
                        >
                          <div className={`h-10 rounded-md bg-gradient-to-br ${getVideoCardTone(index)}`} />
                          <div className="min-w-0">
                            <p className="truncate text-sm text-white">{video.title}</p>
                            <p className="mt-1 text-xs text-white/35">
                              {formatCount(video.views)} views · {formatDate(video.createdAt)}
                            </p>
                          </div>
                          <div
                            className={`rounded px-2 py-1 text-[11px] ${
                              index === 0
                                ? "bg-[#1a2a0a] text-[#9fd86a]"
                                : index === 1
                                  ? "bg-white/5 text-white/55"
                                  : "bg-[#250909] text-[#ff5f57]"
                            }`}
                          >
                            {index === 0 ? "Published" : index === 1 ? "Queued" : "Draft"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[10px] border border-white/10 bg-[#0f0f0f] px-4 py-3 text-xs text-white/45">
                    {totalPublishedVideos ? `${totalPublishedVideos} published videos connected right now.` : "Your next upload can appear here as soon as you sign in."}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-[#2a0808] bg-[#150303] px-5 py-20 text-center md:px-8" id="cta">
            <div className="mx-auto max-w-[760px]">
              <h2 className="text-[clamp(2.2rem,6vw,3.5rem)] font-bold leading-[1.04] tracking-[-0.06em] text-white">
                Ready to start creating?
              </h2>
              <p className="mt-4 text-base text-white/45">
                Join creators already using VideoTube. Free to start, no credit card required.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  className="rounded-[10px] bg-[#ff2d2d] px-7 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
                  to={creatorTarget}
                >
                  {user ? "Open your studio" : "Create your account"}
                </Link>
                <button
                  className="rounded-[10px] border border-[#5a1010] px-7 py-3.5 text-sm font-medium text-white/80 transition hover:border-white/30 hover:text-white"
                  onClick={() => scrollToSection("platform-preview")}
                  type="button"
                >
                  Watch a demo
                </button>
              </div>
              <p className="mt-6 text-sm text-white/30">Built with Express, MongoDB, Cloudinary, React, and Tailwind CSS.</p>
            </div>
          </section>
        </main>

        <footer className="px-5 py-12 md:px-8" id="footer">
          <div className="mx-auto max-w-[1120px]">
            <div className="grid gap-10 border-b border-white/10 pb-8 md:grid-cols-[1.5fr,1fr,1fr,1fr]">
              <div>
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#ff2d2d]">
                    <Icon className="h-[18px] w-[18px]" name="play" />
                  </div>
                  <span className="text-lg font-semibold tracking-[-0.03em] text-white">
                    Video<span className="text-[#ff2d2d]">Tube</span>
                  </span>
                </div>
                <p className="mt-4 max-w-[240px] text-sm leading-7 text-white/35">
                  The creator-first video platform built over your own backend, not a fake landing page mock.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white/60">Product</h4>
                <div className="mt-4 space-y-2 text-sm text-white/35">
                  <button className="block transition hover:text-white" onClick={() => scrollToSection("features")} type="button">
                    Features
                  </button>
                  <button className="block transition hover:text-white" onClick={() => scrollToSection("platform-preview")} type="button">
                    Demo
                  </button>
                  <button className="block transition hover:text-white" onClick={() => scrollToSection("cta")} type="button">
                    Pricing
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white/60">Creators</h4>
                <div className="mt-4 space-y-2 text-sm text-white/35">
                  <button className="block transition hover:text-white" onClick={() => scrollToSection("creators")} type="button">
                    Dashboard
                  </button>
                  <Link className="block transition hover:text-white" to={creatorTarget}>
                    {user ? "Studio" : "Get started"}
                  </Link>
                  <Link className="block transition hover:text-white" to={demoTarget}>
                    Browse videos
                  </Link>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white/60">Company</h4>
                <div className="mt-4 space-y-2 text-sm text-white/35">
                  <button className="block transition hover:text-white" onClick={() => scrollToSection("footer")} type="button">
                    About
                  </button>
                  <Link className="block transition hover:text-white" to="/login">
                    Sign in
                  </Link>
                  <Link className="block transition hover:text-white" to="/register">
                    Create account
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-6 text-sm text-white/25 md:flex-row md:items-center md:justify-between">
              <p>© 2026 VideoTube. All rights reserved.</p>
              <p>Connected to your live Express API and auth flow.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPageMarketing;
