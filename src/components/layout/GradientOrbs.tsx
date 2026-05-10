export function GradientOrbs() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full opacity-20 blur-3xl animate-float-slow"
        style={{ background: "radial-gradient(circle, var(--sage), transparent 60%)" }}
      />
      <div
        className="absolute top-1/3 -right-32 h-[32rem] w-[32rem] rounded-full opacity-20 blur-3xl animate-float-slow"
        style={{ background: "radial-gradient(circle, var(--blush), transparent 60%)", animationDelay: "-7s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full opacity-10 blur-3xl animate-float-slow"
        style={{ background: "radial-gradient(circle, var(--greed), transparent 60%)", animationDelay: "-3s" }}
      />
    </div>
  );
}
