export function BackspaceLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Backspace" className="h-14 w-auto object-contain" />
      <div className="flex flex-col leading-none">
        <span className="text-white font-black text-2xl tracking-tight">Backspace</span>
        <span className="text-amber-400 text-[10px] font-semibold tracking-[0.2em] uppercase mt-0.5">Book Your Space</span>
      </div>
    </div>
  )
}
