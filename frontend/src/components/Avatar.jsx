import { initialsFromName } from "../lib/utils.js";

const Avatar = ({ src, name, className = "h-11 w-11 rounded-2xl" }) => {
  if (src) {
    return (
      <img
        alt={name || "avatar"}
        className={`${className} object-cover`}
        src={src}
      />
    );
  }

  return (
    <div
      className={`${className} grid place-items-center border border-white/10 bg-gradient-to-br from-[#ff2d2d] to-[#7a1515] font-semibold text-white`}
    >
      {initialsFromName(name)}
    </div>
  );
};

export default Avatar;
