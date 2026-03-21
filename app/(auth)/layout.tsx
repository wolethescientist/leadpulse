export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#06060b] flex items-center justify-center px-4 overflow-hidden">
      {/* Dot grid */}
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-30" />

      {/* Glow orbs */}
      <div
        className="glow-pulse glow-orb pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[700px] -translate-x-1/2 -translate-y-1/2"
        style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.05) 45%, transparent 70%)" }}
      />

      {/* Content */}
      <div className="relative w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
