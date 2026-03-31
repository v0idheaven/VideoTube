const escapeXml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const hashString = (value = "") => {
  let hash = 0;

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash;
};

const palettes = [
  ["#ff5f57", "#ff2d2d"],
  ["#7f77dd", "#3f3cbb"],
  ["#1d9e75", "#0f6e56"],
  ["#d85a30", "#993c1d"],
  ["#378add", "#1d5b93"],
];

const getInitials = (fullName = "", username = "") => {
  const nameParts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }

  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 2).toUpperCase();
  }

  return username.trim().slice(0, 2).toUpperCase() || "VT";
};

const createDefaultAvatar = ({ fullName = "", username = "" } = {}) => {
  const initials = escapeXml(getInitials(fullName, username));
  const palette = palettes[hashString(`${fullName}:${username}`) % palettes.length];
  const [startColor, endColor] = palette;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240" role="img" aria-label="${escapeXml(fullName || username || "VideoTube")}">
      <defs>
        <linearGradient id="avatarGradient" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${startColor}" />
          <stop offset="100%" stop-color="${endColor}" />
        </linearGradient>
      </defs>
      <rect width="240" height="240" rx="48" fill="url(#avatarGradient)" />
      <circle cx="120" cy="120" r="86" fill="rgba(255,255,255,0.08)" />
      <text
        x="120"
        y="132"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="84"
        font-weight="700"
        fill="#ffffff"
      >
        ${initials}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export { createDefaultAvatar };
