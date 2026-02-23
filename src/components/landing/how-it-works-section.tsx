"use client"

import { useRef } from "react"
import { FileText, Zap, Award, RotateCcw } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"

const steps = [
  {
    icon: FileText,
    title: "Create a payment request",
    description: "Generate a Lightning-compatible invoice for your client. Link it to a specific project, milestone, or deliverable.",
  },
  {
    icon: Zap,
    title: "Payment settles instantly",
    description: "Your client pays over the Lightning Network. Settlement is final, irreversible, and confirmed in seconds.",
  },
  {
    icon: Award,
    title: "Mint an earned credit",
    description: "After work is completed, issue a self-custodial token to your client. It represents earned value from real work.",
  },
  {
    icon: RotateCcw,
    title: "Client redeems later",
    description: "When the client returns for new work, they redeem their earned credits. Simple, transparent, self-sovereign.",
  },
]

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="how-it-works" className="relative overflow-hidden border-t border-border/40 bg-white px-6 py-32 sm:px-10 md:py-40 lg:px-16">
      <div ref={ref} className="mx-auto max-w-[90rem]">
        {/* Asymmetric header */}
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <div className={`transition-all duration-1000 ${isInView ? "translate-y-0 opacity-50" : "translate-y-8 opacity-0"}`}>
            <p className="font-mono text-[11px] font-medium tracking-[0.2em] text-primary uppercase">How it works</p>
          </div>
          <div className={`transition-all duration-1000 delay-100 ${isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <h2 className="max-w-2xl font-serif text-[clamp(2rem,4.5vw,3.75rem)] font-normal leading-[1.1] tracking-tight text-foreground">
              Four steps. No complexity.
            </h2>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-[1.7] text-muted-foreground">
              From invoice to earned credit in a straightforward flow that respects your time and your client's sovereignty.
            </p>
          </div>
        </div>

        {/* Staggered steps - alternating offset */}
        <div className="mt-24 grid md:grid-cols-2">
          {steps.map((item, i) => (
            <div
              key={item.title}
              className={`group relative border-t border-border/40 p-8 transition-all duration-700 md:p-12 ${i % 2 === 1 ? "md:translate-y-0" : ""} ${i >= 2 ? "md:border-t-0" : ""} ${isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
              style={{ transitionDelay: isInView ? `${300 + i * 150}ms` : "0ms" }}
            >
              {/* Large step number behind */}
              <div className="pointer-events-none absolute right-8 top-6 font-serif text-[7rem] font-bold leading-none text-primary/[0.08] md:right-12 md:top-8 md:text-[9rem]">
                {String(i + 1).padStart(2, "0")}
              </div>

              <div className="relative">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-background ring-1 ring-border/50 transition-all duration-300 group-hover:ring-primary/30 group-hover:shadow-md">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-card-foreground">{item.title}</h3>
                <p className="mt-3 max-w-sm text-[15px] leading-[1.7] text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
