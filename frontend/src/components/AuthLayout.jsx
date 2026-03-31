import { Link } from "react-router-dom";

const AuthLayout = ({
  badge,
  title,
  description,
  asideBadge,
  asideTitle,
  asideDescription,
  asidePoints,
  children,
}) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
      <div className="pointer-events-none absolute left-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,45,45,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute bottom-[-10rem] right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(127,119,221,0.14),transparent_60%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1380px] items-center p-4 sm:p-6 lg:p-10">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/12 bg-[#101010] shadow-[0_34px_100px_rgba(0,0,0,0.42)] ring-1 ring-white/5 lg:grid-cols-[0.95fr,1.05fr]">
          <aside className="relative hidden min-h-[760px] overflow-hidden border-r border-white/10 bg-[linear-gradient(180deg,#0b0b0b_0%,#090909_100%)] p-10 lg:flex lg:flex-col lg:justify-between">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,45,45,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_30%)]" />

            <div className="relative z-10">
              <Link className="inline-flex items-center gap-3" to="/">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ff2d2d] text-white shadow-[0_18px_40px_rgba(255,45,45,0.25)]">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold tracking-[-0.05em]">
                  <span className="text-white">Video</span>
                  <span className="text-[#ff2d2d]">Tube</span>
                </div>
              </Link>

              <div className="mt-14 space-y-6">
                <div className="inline-flex rounded-full border border-[#3a1010] bg-[#1a0a0a] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#ff8d8d]">
                  {asideBadge}
                </div>
                <h2 className="max-w-md font-body text-6xl font-bold leading-[0.92] tracking-[-0.08em] text-white">
                  {asideTitle}
                </h2>
                <p className="max-w-md text-lg leading-9 text-white/55">{asideDescription}</p>
              </div>
            </div>

            <div className="relative z-10 grid gap-4">
              {asidePoints.map((point, index) => (
                <div
                  className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-5 backdrop-blur-sm"
                  key={point}
                >
                  <div className="flex items-start gap-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/6 text-sm font-semibold text-[#ff8d55]">
                      0{index + 1}
                    </div>
                    <p className="pt-1 text-base leading-8 text-white/76">{point}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className="relative flex min-h-full flex-col justify-center bg-[linear-gradient(180deg,#141414_0%,#111111_100%)] p-6 sm:p-8 lg:p-12">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
            <div className="mx-auto w-full max-w-[38rem]">
              <div className="flex items-center justify-between gap-4">
                <Link className="inline-flex items-center gap-3 lg:hidden" to="/">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#ff2d2d] text-white">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <div className="text-xl font-bold tracking-[-0.05em] text-white">
                    <span>Video</span>
                    <span className="text-[#ff2d2d]">Tube</span>
                  </div>
                </Link>

                <Link
                  className="group ml-auto inline-flex items-center gap-2 text-sm font-medium text-white/50 transition hover:text-white"
                  to="/"
                >
                  <svg
                    className="h-4 w-4 transition group-hover:-translate-x-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  Back to landing
                </Link>
              </div>

              <div className="mt-10 max-w-[34rem]">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#ff8d8d]">
                  {badge}
                </p>
                <h1 className="mt-4 font-body text-5xl font-bold leading-tight tracking-[-0.07em] text-white sm:text-6xl">
                  {title}
                </h1>
                <p className="mt-5 text-lg leading-9 text-white/50">{description}</p>
              </div>

              <div className="mt-10">{children}</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
