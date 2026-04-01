import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "./Avatar.jsx";
import { formatCount, formatDuration, formatTimeAgo } from "../lib/utils.js";

const DotsIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);

const VideoCard = ({ video, channelLink, compact = false }) => {
  const owner = video.ownerDetails || video.owner || {};
  const thumbnail = video.thumbnail?.url || video.thumbnail;
  const watchLink = `/watch/${video._id}`;
  const channelHref = channelLink || (owner.username ? `/channel/${owner.username}` : "/feed");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const thumbnailMarkup = thumbnail ? (
    <img
      alt={video.title}
      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
      loading="lazy"
      src={thumbnail}
    />
  ) : (
    <div className="flex h-full items-center justify-center bg-[#272727] text-xs text-[#aaaaaa]">
      No thumbnail
    </div>
  );

  if (compact) {
    return (
      <article className="group flex gap-2">
        <Link className="relative block w-[168px] flex-shrink-0 overflow-hidden rounded-xl bg-[#272727]" to={watchLink}>
          <div className="aspect-video">{thumbnailMarkup}</div>
          {video.duration != null && (
            <span className="absolute bottom-1 right-1 rounded bg-black/90 px-1 py-0.5 text-[11px] font-medium text-white">
              {formatDuration(video.duration)}
            </span>
          )}
        </Link>
        <div className="min-w-0 flex-1 pt-0.5">
          <Link className="line-clamp-2 text-[13px] font-medium leading-[18px] text-[#f1f1f1]" to={watchLink}>
            {video.title}
          </Link>
          <Link className="mt-1 block text-xs text-[#aaaaaa] hover:text-[#f1f1f1]" to={channelHref}>
            {owner.fullName || owner.username || "VideoTube"}
          </Link>
          <div className="mt-0.5 text-xs text-[#aaaaaa]">
            {formatCount(video.views)} views · {formatTimeAgo(video.createdAt)}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group">
      <Link className="relative block aspect-video overflow-hidden rounded-xl bg-[#272727]" to={watchLink}>
        {thumbnailMarkup}
        {video.duration != null && (
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/90 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {formatDuration(video.duration)}
          </span>
        )}
        <div className="absolute right-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100" ref={menuRef}>
          <button
            aria-label="More options"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/80 text-white"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen((v) => !v); }}
            type="button"
          >
            <DotsIcon />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-50 min-w-[180px] overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#282828] shadow-xl">
              <Link className="flex items-center px-4 py-3 text-sm text-[#f1f1f1] hover:bg-[#3f3f3f]" onClick={() => setMenuOpen(false)} to={watchLink}>Watch</Link>
              <Link className="flex items-center px-4 py-3 text-sm text-[#f1f1f1] hover:bg-[#3f3f3f]" onClick={() => setMenuOpen(false)} to={channelHref}>View channel</Link>
              <button
                className="flex w-full items-center px-4 py-3 text-sm text-[#f1f1f1] hover:bg-[#3f3f3f]"
                onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/watch/${video._id}`).catch(() => {}); setMenuOpen(false); }}
                type="button"
              >
                Copy link
              </button>
            </div>
          )}
        </div>
      </Link>

      <div className="mt-3 flex gap-3">
        <Link className="flex-shrink-0" to={channelHref}>
          <Avatar className="h-9 w-9 rounded-full" name={owner.fullName || owner.username} src={owner.avatar} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link className="line-clamp-2 text-sm font-medium leading-5 text-[#f1f1f1]" to={watchLink}>
            {video.title}
          </Link>
          <div className="mt-1 text-[13px] text-[#aaaaaa]">
            {owner.username && (
              <Link className="block hover:text-[#f1f1f1]" to={channelHref}>
                {owner.fullName || owner.username}
              </Link>
            )}
            <div>{formatCount(video.views)} views · {formatTimeAgo(video.createdAt)}</div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default VideoCard;
