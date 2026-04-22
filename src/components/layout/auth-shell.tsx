import { BrandMark } from "@/components/layout/brand-mark";

export function AuthShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="absolute inset-0 bg-glow" />
      <div className="grid w-full max-w-6xl gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="hidden rounded-[2rem] border border-white/10 bg-white/5 p-10 shadow-panel backdrop-blur-xl lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-8">
            <BrandMark />
            <div className="space-y-5">
              <p className="text-sm uppercase tracking-[0.35em] text-primary/80">
                Build. Break. Fix. Master networks.
              </p>
              <h1 className="max-w-xl font-[family-name:var(--font-heading)] text-5xl font-semibold leading-tight text-gradient">
                A premium network simulation workspace for engineers and learners.
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Design topologies, test connectivity, debug issues with AI, and complete guided labs in one focused workflow.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              "Visual topology builder with React Flow",
              "Live ping engine with clear failure reasons",
              "Guided labs for CCNA-style foundations",
              "Firebase-backed progress and projects"
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-8 shadow-panel backdrop-blur-xl">
          <div className="mb-8 space-y-3">
            <BrandMark className="lg:hidden" />
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-foreground">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
