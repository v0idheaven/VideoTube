import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "./Avatar.jsx";
import { formatCount, formatDuration, formatTimeAgo } from "../lib/utils.js";

const DotsIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.75" />
    <circle cx="12" cy="12" r="1.75" />
    <circle cx="12" cy="19" r="1.75" />
  </svg>
);

const VideoCard = ({ video, channelLink, compact = false }) => {
  const owner = video.ownerDetails || video.owner || {};
  const thumbnail = video.thumbnail?.url || video.thumbnail;
  const watchLink = `/watch/${video._id}`;
  const channelHref = channelLink || (owner.username ? `/channel/${owner.username}` : "/feed");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const thumbnailMarkup = thumbnail ? (
    <img
      alt={video.title}
      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
      loading="lazy"
      src={thumbnail}
    />
  ) : (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#252525] to-[#131313] text-xs font-medium text-white/35">
      No thumbnail
    </div>
  );

  if (compact) {
    return (
      <article className="group grid gap-3 sm:grid-cols-[168px,1fr]">
        <Link className="relative block aspect-video overflow-hidden rounded-xl bg-[#1b1b1b]" to={watchLink}>
          {thumbnailMarkup}
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {formatDuration(video.duration)}
          </span>
        </Link>

        <div className="min-w-0 space-y-1 pt-0.5">
          <Link
            className="line-clamp-2 text-[13px] font-medium leading-5 text-white transition group-hover:text-white/90"
            to={watchLink}
          >
            {video.title}
          </Link>
          <Link className="block text-xs text-white/55 transition hover:text-white" to={channelHref}>
            {owner.fullName || owner.username || "VideoTube creator"}
          </Link>
          <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 text-xs text-white/40">
            <span>{formatCount(video.views)} views</span>
            <span>·</span>
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group">
      <Link className="relative block aspect-video overflow-hidden rounded-xl bg-[#1b1b1b]" to={watchLink}>
        {thumbnailMarkup}
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-medium text-white">
          {formatDuration(video.duration)}
        </span>
      </Link>

      <div className="mt-3 grid grid-cols-[36px,1fr,28px] gap-3">
        <Link className="self-start" to={channelHref}>
          <Avatar className="h-9 w-9 rounded-full" name={owner.fullName || owner.username} src={owner.avatar} />
        </Link>
        <div className="min-w-0">
          <Link className="line-clamp-2 block text-[15px] font-medium leading-5 text-white" to={watchLink}>
            {video.title}
          </Link>
          <div className="mt-1 space-y-0.5 text-sm text-white/55">
            {owner.username ? (
              <Link className="inline-flex text-[13px] transition hover:text-white" to={channelHref}>
                {owner.fullName || owner.username}
              </Link>
            ) : null}
            <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 text-[13px] leading-5 text-white/40">
              <span>{formatCount(video.views)} views</span>
              <span>·</span>
              <span>{formatTimeAgo(video.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="relative mt-0.5" ref={menuRef}>
          <button
            aria-label="Video options"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white/0 transition group-hover:text-white/50 hover:!text-white hover:bg-white/5"
            onClick={(e) => { e.preventDefault(); setMenuOpen((v) => !v); }}
            type="button"
          >
            <DotsIcon />
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-8 z-50 min-w-[180px] overflow-hidden rounded-xl border border-white/10 bg-[#282828] shadow-xl">
              <Link
                className="flex items-center gap-3 px-4 py-3 text-sm text-white/85 transition hover:bg-white/5"
                onClick={() => setMenuOpen(false)}
                to={watchLink}
              >
                Watch
              </Link>
              <Link
                className="flex items-center gap-3 px-4 py-3 text-sm text-white/85 transition hover:bg-white/5"
                onClick={() => setMenuOpen(false)}
                to={channelHref}
              >
                View channel
              </Link>
              <button
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-white/85 transition hover:bg-white/5"
                onClick={() => {
                  navigator.clipboard?.writeText(`${window.location.origin}/watch/${video._id}`).catch(() => {});
                  setMenuOpen(false);
                }}
                type="button"
              >
                Copy link
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default VideoCard;
