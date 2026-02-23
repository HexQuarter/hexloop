"use client"

import { useRef } from "react"
import { Sparkles, Hammer } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"

const problems = [
  {
    title: "Points expire or devalue",
    description: "Traditional loyalty points sit in someone else's database. They can be diluted, expired, or revoked at any time.",
  },
  {
    title: "No real ownership",
    description: "Your customers earn rewards but never truly own them. Trapped in walled gardens with no portability.",
  },
  {
    title: "Processor lock-in",
    description: "Switch payment processors and lose your loyalty history. Traditional systems couple payments with retention.",
  },
  {
    title: "High overhead for small teams",
    description: "Loyalty programs are built for enterprise. For freelancers and small agencies, the cost and complexity don't make sense.",
  },
]

const differentiators = [
  {
    icon: Hammer,
    title: "Tokens minted on real work",
    description: "Only when work is delivered and payment confirmed. No speculation, no empty promises.",
  },
  {
    icon: Sparkles,
    title: "Value from trust, not hype",
    description: "Anchored to Bitcoin's network. Backed by real business activity, not market sentiment.",
  },
]

export function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="problem" className="relative border-t border-border/40 px-6 py-32 sm:px-10 md:py-40 lg:px-16 bg-slate-50">
      <div ref={ref} className="mx-auto max-w-[90rem]">
        {/* Section header - asymmetric with large number */}
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <div className={`transition-all duration-1000 ${isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <p className="font-mono text-[11px] font-medium tracking-[0.2em] text-primary uppercase">The problem</p>
          </div>
          <div className={`transition-all duration-1000 delay-100 ${isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <h2 className="max-w-2xl font-serif text-[clamp(2rem,4.5vw,3.75rem)] font-normal leading-[1.1] tracking-tight">
              Most loyalty systems reward spending. <br /><span className="text-primary">Work deserves better.</span>
            </h2>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-[1.7] text-muted-foreground">
              Traditional loyalty platforms issue points disconnected from real value. Crypto loyalty often turns into speculation.
            </p>
          </div>
        </div>

        {/* Bento grid - varied card sizes */}
        <div className="mt-20 grid gap-3 md:grid-cols-2 lg:grid-cols-12">
          {problems.map((problem, i) => {
            const spans = ["lg:col-span-6", "lg:col-span-6", "lg:col-span-6", "lg:col-span-6"]
            return (
              <div
                key={problem.title}
                className={`bg-card group relative overflow-hidden rounded-2xl border border-border/40 p-8 transition-all duration-700 hover:border-border/80 hover:shadow-lg md:p-10 ${spans[i]} ${isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
                style={{ transitionDelay: isInView ? `${300 + i * 100}ms` : "0ms" }}
              >
                <div className="pointer-events-none absolute -right-6 -top-6 font-serif text-[8rem] font-bold leading-none text-primary/[0.1]">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="relative">
                  <h3 className="text-lg font-semibold tracking-tight text-card-foreground md:text-xl">{problem.title}</h3>
                  <p className="mt-3 max-w-md text-[15px] leading-[1.7] text-muted-foreground">{problem.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Differentiators - full-width strip */}
        <div className="mt-24">
          <div className={`mb-10 flex items-center gap-8 transition-all duration-1000 ${isInView ? "opacity-100" : "opacity-0"}`}>
            <div className="h-px flex-1 bg-border/40" />
            <p className="font-mono text-[11px] font-medium tracking-[0.2em] text-primary uppercase">How this is different</p>
            <div className="h-px flex-1 bg-border/40" />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {differentiators.map((item) => (
              <div
                key={item.title}
                className={`group relative overflow-hidden rounded-2xl border border-primary/10 bg-card p-8 transition-all duration-700 hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg md:p-10 ${isInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
                style={{ transitionDelay: isInView ? `10ms` : "0ms" }}
              >
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 transition-all duration-300 group-hover:bg-primary/50 group-hover:text-white text-primary" >
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-foreground">{item.title}</h3>
                <p className="mt-3 max-w-md text-[15px] leading-[1.7] text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
