const EmptyState = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#272727]">
      <svg className="h-8 w-8 text-[#aaaaaa]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    </div>
    <div className="space-y-1">
      <h2 className="text-base font-medium text-[#f1f1f1]">{title}</h2>
      {description && <p className="max-w-sm text-sm text-[#aaaaaa]">{description}</p>}
    </div>
    {action}
  </div>
);

export default EmptyState;
