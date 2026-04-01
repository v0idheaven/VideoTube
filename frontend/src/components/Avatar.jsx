import { initialsFromName } from "../lib/utils.js";

const COLORS = [
  "bg-[#1565c0]", "bg-[#6a1b9a]", "bg-[#ad1457]",
  "bg-[#00695c]", "bg-[#e65100]", "bg-[#4527a0]",
];

const Avatar = ({ src, name, className = "h-9 w-9 rounded-full" }) => {
  if (src) {
    return <img alt={name || "avatar"} className={`${className} object-cover`} src={src} />;
  }

  const initials = initialsFromName(name);
  const colorIndex = name ? name.charCodeAt(0) % COLORS.length : 0;
  const color = COLORS[colorIndex];

  return (
    <div className={`${className} ${color} grid place-items-center text-xs font-medium text-white`}>
      {initials}
    </div>
  );
};

export default Avatar;
