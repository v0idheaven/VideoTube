import { Link } from "react-router-dom";
import { formatCount, formatDate, formatDuration } from "../lib/utils.js";

const features = [
  ["01", "HD Video Streaming", "Upload sharp video and keep playback smooth across screens."],
  ["02", "Channel Subscriptions", "Build a loyal audience with creator pages that feel personal."],
  ["03", "Creator Dashboard", "Track views, likes, and momentum from one clean control room."],
  ["04", "Comments & Likes", "Keep conversation close to the video instead of buried elsewhere."],
  ["05", "Playlists", "Group tutorials, series, or collections so viewers stay in the flow."],
  ["06", "Secure & Private", "JWT auth, refresh tokens, hashing, and protected routes are already in place."],
];

const creatorChecklist = [
  "Upload video + thumbnail in one step",
  "Edit title, description, and thumbnail anytime",
  "Toggle publish / unpublish instantly",
  "Track views, likes, and audience response",
];

const plans = [
  ["Watcher", "Free", "Watch, like, comment, and subscribe.", "Start watching"],
  ["Creator", "Free", "Upload, manage, and grow a channel.", "Upload for free"],
  ["Studio", "Soon", "Bigger workflows and deeper analytics.", "See roadmap"],
];

const fallbackVideos = [
  {
    _id: "demo-1",
    title: "Building VideoTube from Scratch",
    views: 142000,
    createdAt: "2026-03-23T00:00:00.000Z",
    duration: 1260,
    owner: { username: "shweta" },
  },
  {
    _id: "demo-2",
    title: "JWT Auth Deep Dive",
    views: 204000,
    createdAt: "2026-03-19T00:00:00.000Z",
    duration: 840,
    owner: { username: "arjun" },
  },
  {
    _id: "demo-3",
    title: "Tailwind CSS v4 Breakdown",
    views: 56000,
    createdAt: "2026-03-15T00:00:00.000Z",
    duration: 930,
    owner: { username: "designlane" },
  },
];

const LandingPage = ({ user, videos, loading }) => {
  const hasRealVideos = videos.length > 0;
  const showcase = videos.length
    ? videos.slice(0, 3).map((video) => ({
        ...video,
        href: `/watch/${video._id}`,
        owner: video.ownerDetails || video.owner || {},
        thumbnail: video.thumbnail?.url || video.thumbnail || "",
      }))
    : fallbackVideos;
  const leadVideo = showcase[0];
  const totalViews = videos.reduce((sum, video) => sum + (Number(video.views) || 0), 0);
  const totalLikes = videos.reduce((sum, video) => sum + (Number(video.likesCount) || 0), 0);
  const stats = [
    [loading ? "--" : `${formatCount(videos.length || 24)}+`, "Videos uploaded"],
    ["180K+", "Creators"],
    ["99.9%", "Uptime"],
    ["40+", "Countries"],
  ];
  const dashboardStats = [
    ["Total views", totalViews ? formatCount(totalViews) : "1.4M", totalViews ? "live public data" : "+12% this month"],
    ["Subscribers", user ? `@${user.username}` : "28.3K", user ? "your channel is ready" : "+340 this week"],
    ["Total likes", totalLikes ? formatCount(totalLikes) : "86K", totalLikes ? "community signal" : "+2.1K today"],
    ["Videos", videos.length ? String(videos.length) : "47", videos.length ? `${videos.length} public` : "3 unpublished"],
  ];

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const primaryCta = hasRealVideos
    ? { label: "Start watching", to: leadVideo.href }
    : user
      ? { label: "Open studio", to: "/studio" }
      : { label: "Sign in to watch", to: "/login" };

  const secondaryCta = hasRealVideos
    ? { label: "Browse videos", to: leadVideo.href }
    : user
      ? { label: "Upload now", to: "/studio" }
      : { label: "Sign in", to: "/login" };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-[1520px] border-x border-white/10 bg-[#0a0a0a]">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-5 py-4 lg:px-10">
            <Link className="flex items-center gap-3" to="/">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[var(--coral)] to-red-500 text-white">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M9 7.5L16.2 12 9 16.5v-9z" /></svg>
              </div>
              <div className="text-xl font-bold tracking-[-0.05em]"><span>Video</span><span className="text-[var(--coral)]">Tube</span></div>
            </Link>
            <nav className="hidden items-center gap-8 text-sm text-white/70 lg:flex">
              <button onClick={() => scrollToSection("features")} type="button">Features</button>
              <button onClick={() => scrollToSection("creators")} type="button">Creators</button>
              <button onClick={() => scrollToSection("pricing")} type="button">Pricing</button>
              <button onClick={() => scrollToSection("about")} type="button">About</button>
            </nav>
            <div className="flex items-center gap-3">
              <Link className="rounded-2xl border border-white/15 px-4 py-2.5 text-sm font-semibold" to={user ? `/channel/${user.username}` : "/login"}>
                {user ? "Channel" : "Sign in"}
              </Link>
              <Link className="rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950" to={user ? "/studio" : "/register"}>
                {user ? "Open studio" : "Get started"}
              </Link>
            </div>
          </div>
        </header>

        <main>
          <section className="border-b border-white/10 px-5 py-10 lg:px-10 lg:py-16">
            <div className="grid gap-10 lg:grid-cols-[0.88fr,1.12fr]">
              <div className="flex flex-col justify-center">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400">
                  <span className="h-2 w-2 rounded-full bg-[var(--coral)]" />
                  Now live - share your world
                </div>
                <h1 className="mt-10 font-body text-[clamp(3.5rem,10vw,6.8rem)] font-bold leading-[0.88] tracking-[-0.08em]">
                  <span className="block">Watch.</span><span className="block">Share.</span><span className="block text-[var(--coral)]">Create.</span><span className="block">Repeat.</span>
                </h1>
                <p className="mt-8 max-w-md text-[1.18rem] leading-10 text-[#a7a39a]">
                  VideoTube is your open platform to upload, discover, and connect through video. No black-box algorithm hiding your content.
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link className="rounded-2xl border border-white/20 px-7 py-3.5 text-lg font-semibold" to={primaryCta.to}>{primaryCta.label}</Link>
                  <Link className="rounded-2xl border border-white/10 px-7 py-3.5 text-lg font-semibold text-white/90" to={user ? "/studio" : "/register"}>Upload a video</Link>
                </div>
                <p className="mt-8 text-sm text-white/35">Free forever. No credit card required.</p>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-[#121212] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
                  <span className="h-3 w-3 rounded-full bg-[#ff7a66]" /><span className="h-3 w-3 rounded-full bg-[#f4c04d]" /><span className="h-3 w-3 rounded-full bg-[#72d56a]" />
                  <div className="ml-4 rounded-lg bg-white/5 px-4 py-1.5 text-sm text-white/35">videotube.app/watch?v=abc123</div>
                </div>
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#1b0d10] via-[#0f1020] to-[#071612]">
                  {leadVideo?.thumbnail ? <img alt={leadVideo.title} className="h-full w-full object-cover opacity-45" src={leadVideo.thumbnail} /> : null}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                    <div className="grid h-24 w-24 place-items-center rounded-full bg-[var(--coral)] shadow-[0_18px_40px_rgba(207,99,48,0.38)]">
                      <svg className="ml-1 h-10 w-10 fill-current" viewBox="0 0 24 24"><path d="M8 6.5L18 12 8 17.5v-11z" /></svg>
                    </div>
                    <div className="text-center">
                      <p className="text-lg text-white/80">{leadVideo.title}</p>
                      <p className="mt-2 text-sm uppercase tracking-[0.24em] text-white/35">{formatDuration(leadVideo.duration)}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/10 bg-[#111111] px-5 py-4">
                  <h2 className="font-body text-2xl font-bold tracking-[-0.05em]">{leadVideo.title}</h2>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/6"><div className="h-full w-[44%] rounded-full bg-[var(--coral)]" /></div>
                </div>
                <div className="divide-y divide-white/8 bg-[#111111]">
                  {showcase.map((video, index) =>
                    video.href ? (
                      <Link className="grid gap-4 px-5 py-4 transition hover:bg-white/5 md:grid-cols-[92px,1fr]" key={video._id} to={video.href}>
                        <div className={`rounded-xl ${index === 0 ? "bg-gradient-to-br from-indigo-950 to-indigo-900/20" : index === 1 ? "bg-gradient-to-br from-green-950 to-green-900/20" : "bg-gradient-to-br from-cyan-950 to-cyan-900/20"}`} />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{video.title}</p>
                          <p className="mt-1 text-sm text-white/35">@{video.owner?.username || "videotube"} - {formatCount(video.views)} views</p>
                        </div>
                      </Link>
                    ) : (
                      <div className="grid gap-4 px-5 py-4 md:grid-cols-[92px,1fr]" key={video._id}>
                        <div className={`rounded-xl ${index === 0 ? "bg-gradient-to-br from-indigo-950 to-indigo-900/20" : index === 1 ? "bg-gradient-to-br from-green-950 to-green-900/20" : "bg-gradient-to-br from-cyan-950 to-cyan-900/20"}`} />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{video.title}</p>
                          <p className="mt-1 text-sm text-white/35">@{video.owner?.username || "videotube"} - {formatCount(video.views)} views</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-white/10 px-5 py-7 lg:px-10"><div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">{stats.map(([value, label], index) => <div className={`${index < 3 ? "xl:border-r xl:border-white/10" : ""} px-2`} key={label}><div className="font-body text-4xl font-bold tracking-[-0.06em]">{value}</div><p className="mt-2 text-lg text-white/45">{label}</p></div>)}</div></section>

          <section className="border-b border-white/10 px-5 py-16 lg:px-10 lg:py-24" id="features">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[var(--coral)]">Why VideoTube</p>
              <h2 className="mt-5 font-body text-5xl font-bold leading-tight tracking-[-0.07em] md:text-6xl">Everything you need to grow</h2>
              <p className="mt-5 text-lg text-white/45">Built for creators who are serious about owning their audience.</p>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {features.map(([tag, title, description]) => <article className="rounded-[26px] border border-white/10 bg-[#121212] p-6 transition hover:-translate-y-1 hover:border-white/15" key={title}><div className="inline-flex rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-[var(--coral)]">{tag}</div><h3 className="mt-6 max-w-[13rem] font-body text-3xl font-bold leading-tight tracking-[-0.05em]">{title}</h3><p className="mt-4 text-lg leading-9 text-white/42">{description}</p></article>)}
            </div>
          </section>

          <section className="border-b border-white/10 px-5 py-16 lg:px-10 lg:py-24" id="creators">
            <div className="grid items-start gap-10 xl:grid-cols-[0.76fr,1.24fr]">
              <div className="max-w-md">
                <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[var(--coral)]">For creators</p>
                <h2 className="mt-6 font-body text-5xl font-bold leading-[0.92] tracking-[-0.08em] md:text-6xl"><span className="block">Your content.</span><span className="block">Your audience.</span><span className="block text-[var(--coral)]">Your rules.</span></h2>
                <p className="mt-8 text-xl leading-10 text-white/45">No black-box algorithms deciding who sees your videos. Upload, publish, and your subscribers get notified instantly.</p>
                <div className="mt-10 grid gap-5">{creatorChecklist.map((item) => <div className="flex items-start gap-4" key={item}><div className="mt-1 grid h-7 w-7 place-items-center rounded-full bg-red-500/10 text-[var(--coral)]">+</div><p className="text-lg leading-8 text-white/80">{item}</p></div>)}</div>
              </div>
              <div className="rounded-[30px] border border-white/10 bg-[#101010] shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
                <div className="border-b border-white/10 px-6 py-5"><h3 className="font-body text-3xl font-bold tracking-[-0.05em]">Channel Dashboard</h3></div>
                <div className="space-y-5 p-5">
                  <div className="grid gap-4 md:grid-cols-2">{dashboardStats.map(([label, value, note]) => <div className="rounded-[22px] border border-white/10 bg-[#121212] p-5" key={label}><p className="text-sm text-white/35">{label}</p><strong className="mt-4 block font-body text-5xl font-bold tracking-[-0.06em]">{value}</strong><p className="mt-3 text-sm text-emerald-400">{note}</p></div>)}</div>
                  <div className="space-y-3 rounded-[22px] border border-white/10 bg-[#121212] p-4">{showcase.slice(0, 2).map((video, index) => <div className="grid items-center gap-4 rounded-[18px] border border-white/10 px-3 py-3 md:grid-cols-[88px,1fr,auto]" key={video._id}><div className={`h-12 rounded-xl ${index === 0 ? "bg-gradient-to-br from-indigo-950 to-indigo-900/20" : "bg-gradient-to-br from-green-950 to-green-900/20"}`} /><div className="min-w-0"><p className="truncate font-medium">{video.title}</p><p className="mt-1 text-sm text-white/35">{formatCount(video.views)} views - {formatDate(video.createdAt)}</p></div><div className={`rounded-lg px-3 py-1 text-sm ${index === 0 ? "bg-white/6 text-white/55" : "bg-red-500/12 text-red-400"}`}>{index === 0 ? "Published" : "Draft"}</div></div>)}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-white/10 px-5 py-16 lg:px-10 lg:py-24" id="pricing">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[var(--coral)]">Simple pricing</p>
              <h2 className="mt-5 font-body text-5xl font-bold tracking-[-0.07em] md:text-6xl">Start free. Grow on your own terms.</h2>
              <p className="mt-5 text-lg text-white/45">Keep the barrier low for viewers and creators, then expand the toolkit later.</p>
            </div>
            <div className="mt-14 grid gap-5 xl:grid-cols-3">
              {plans.map(([name, price, description, cta], index) => <article className={`rounded-[28px] border p-6 ${index === 1 ? "border-[var(--coral)] bg-[linear-gradient(180deg,rgba(207,99,48,0.12),rgba(255,255,255,0.02))]" : "border-white/10 bg-[#121212]"}`} key={name}><p className="text-sm uppercase tracking-[0.28em] text-white/35">{name}</p><strong className="mt-4 block font-body text-5xl font-bold tracking-[-0.06em]">{price}</strong><p className="mt-6 text-lg leading-9 text-white/45">{description}</p><Link className={`mt-8 inline-flex rounded-2xl px-5 py-3 font-semibold ${index === 1 ? "bg-white text-slate-950" : "border border-white/12 text-white"}`} to={user ? "/studio" : "/register"}>{cta}</Link></article>)}
            </div>
          </section>

          <section className="px-5 py-16 lg:px-10 lg:py-24" id="about">
            <div className="rounded-[34px] border border-[var(--coral)]/20 bg-[radial-gradient(circle_at_top,rgba(207,99,48,0.16),transparent_38%),linear-gradient(180deg,#1a0d0d_0%,#120d0d_100%)] px-6 py-14 text-center lg:px-12">
              <h2 className="font-body text-5xl font-bold leading-[0.95] tracking-[-0.08em] md:text-7xl"><span className="block">Ready to start creating?</span><span className="mt-2 block text-[var(--coral)]">Join VideoTube today.</span></h2>
              <p className="mx-auto mt-6 max-w-2xl text-xl leading-10 text-white/45">Free to join. Free to upload. Free to watch.</p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link className="rounded-2xl bg-white px-7 py-3.5 text-lg font-semibold text-slate-950" to={user ? "/studio" : "/register"}>{user ? "Open studio" : "Create free account"}</Link>
                <Link className="rounded-2xl border border-white/15 px-7 py-3.5 text-lg font-semibold" to={secondaryCta.to}>{secondaryCta.label}</Link>
              </div>
              <p className="mt-8 text-sm text-white/30">No credit card. Built to scale with your channel.</p>
            </div>
          </section>
        </main>

        <footer className="border-t border-white/10 px-5 py-8 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-xl font-bold tracking-[-0.05em]"><span>Video</span><span className="text-[var(--coral)]">Tube</span></div>
            <div className="flex flex-wrap items-center gap-5 text-sm text-white/35">
              <button onClick={() => scrollToSection("about")} type="button">About</button>
              <button onClick={() => scrollToSection("features")} type="button">Features</button>
              <button onClick={() => scrollToSection("pricing")} type="button">Pricing</button>
              <Link to={user ? "/studio" : "/register"}>{user ? "Studio" : "Join"}</Link>
            </div>
            <p className="text-sm text-white/25">© 2026 VideoTube. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
