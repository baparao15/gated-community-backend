export default function Brand({ compact = false, light = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`grid h-11 w-11 place-items-center rounded-2xl shadow-soft ring-1 ${
        light
          ? 'bg-white/10 text-brand-100 ring-white/15'
          : 'bg-brand-50 text-brand-600 ring-brand-100'
      }`}>
        <span className="material-symbols-outlined filled text-[24px]">apartment</span>
      </div>
      {!compact && (
        <div>
          <div className={`font-display text-2xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-brand-600'}`}>
            SocietySphere
          </div>
          <div className={`text-[10px] font-bold uppercase tracking-[0.18em] ${light ? 'text-brand-100' : 'text-earth-500'}`}>
            Resident Hub
          </div>
        </div>
      )}
    </div>
  );
}
