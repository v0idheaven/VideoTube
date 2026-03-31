const SectionHeader = ({ eyebrow, title, description, action }) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-[1.65rem] font-semibold tracking-[-0.03em] text-white md:text-[1.8rem]">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-sm leading-7 text-white/50">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
};

export default SectionHeader;
