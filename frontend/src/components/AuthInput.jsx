const InputIcon = ({ icon }) => {
  if (icon === "user") {
    return (
      <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="8" r="4" />
      </svg>
    );
  }

  if (icon === "at") {
    return (
      <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="M16 12v-1a4 4 0 1 0-4 4c1.11 0 2.12-.45 2.85-1.17" />
        <path d="M16 8v8" />
      </svg>
    );
  }

  if (icon === "mail") {
    return (
      <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="10" width="16" height="10" rx="2.5" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" />
    </svg>
  );
};

const AuthInput = ({
  label,
  icon,
  trailing,
  hint,
  className = "",
  ...props
}) => {
  const hasTrailing = Boolean(trailing);

  return (
    <label className="grid gap-2.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/52">
        {label}
      </span>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-white/26">
          <InputIcon icon={icon} />
        </div>
        <input
          className={`auth-input w-full rounded-[20px] border border-white/10 bg-[#0b0b0b] py-4 pl-12 text-base text-white outline-none transition placeholder:text-white/24 focus:border-[#ff2d2d] focus:bg-[#0e0e0e] focus:ring-4 focus:ring-red-500/10 ${hasTrailing ? "pr-16" : "pr-5"} ${className}`}
          {...props}
        />
        {hasTrailing ? (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {trailing}
          </div>
        ) : null}
      </div>
      {hint ? <span className="text-xs leading-6 text-white/35">{hint}</span> : null}
    </label>
  );
};

export default AuthInput;
