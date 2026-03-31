const EmptyState = ({ title, description, action }) => {
  return (
    <div className="glass-panel flex flex-col items-start gap-4 border-white/10 bg-[#181818] p-8 text-white">
      <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
        VideoTube
      </div>
      <div className="space-y-2">
        <h2 className="text-[1.8rem] font-semibold tracking-[-0.03em] text-white">{title}</h2>
        <p className="max-w-2xl text-sm leading-7 text-white/50">{description}</p>
      </div>
      {action}
    </div>
  );
};

export default EmptyState;
