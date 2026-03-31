export const classNames = (...classes) => classes.filter(Boolean).join(" ");

export const formatCount = (value = 0) => {
  const number = Number(value) || 0;

  if (number >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(1).replace(".0", "")}M`;
  }

  if (number >= 1_000) {
    return `${(number / 1_000).toFixed(1).replace(".0", "")}K`;
  }

  return number.toString();
};

export const formatDate = (value) => {
  if (!value) {
    return "recently";
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

export const formatTimeAgo = (value) => {
  if (!value) {
    return "recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  const elapsed = date.getTime() - Date.now();
  const units = [
    { unit: "year", ms: 1000 * 60 * 60 * 24 * 365 },
    { unit: "month", ms: 1000 * 60 * 60 * 24 * 30 },
    { unit: "week", ms: 1000 * 60 * 60 * 24 * 7 },
    { unit: "day", ms: 1000 * 60 * 60 * 24 },
    { unit: "hour", ms: 1000 * 60 * 60 },
    { unit: "minute", ms: 1000 * 60 },
  ];
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const { unit, ms } of units) {
    if (Math.abs(elapsed) >= ms) {
      return formatter.format(Math.round(elapsed / ms), unit);
    }
  }

  return "just now";
};

export const formatDuration = (seconds) => {
  const totalSeconds = Math.max(0, Math.round(Number(seconds) || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return [hours, minutes, remainingSeconds]
      .map((part, index) => (index === 0 ? part : String(part).padStart(2, "0")))
      .join(":");
  }

  return [minutes, remainingSeconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
};

export const initialsFromName = (value = "") => {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "VT";
};
