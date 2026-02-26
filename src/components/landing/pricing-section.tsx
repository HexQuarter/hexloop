"use client"

import { useRef } from "react"
import { Check, ArrowRight } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"
import { Link } from "react-router"

const included = [
  "Payment request generation",
  "Multi payment support: Spark, Lightning, Bitcoin",
  "Client redemption flow",
  "No monthly subscription",
  "No custody of funds",
  "No processor lock-in",
]

export function PricingSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="pricing" className="relative overflow-hidden border-t border-border/40 bg-slate-50 px-6 py-32 sm:px-10 md:py-40 lg:px-16">
      <div ref={ref} className="mx-auto max-w-[90rem]">
        {/* Asymmetric layout: heading left, card right */}
        <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div className={`transition-all duration-1000 ${isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <p className="mb-5 font-mono text-[11px] font-medium tracking-[0.2em] text-primary uppercase">Pricing</p>
            <h2 className="font-serif text-[clamp(2rem,4.5vw,3.75rem)] font-normal leading-[1.1] tracking-tight text-foreground">
              Simple, transparent, per-use
            </h2>
            <p className="mt-6 max-w-md text-pretty text-lg leading-[1.7] text-muted-foreground">
              Pay only when you activate a checkout.
            </p>

            {/* Large price callout */}
            <div className="mt-12 flex items-baseline gap-3">
              <span className="font-serif text-[clamp(4rem,8vw,7rem)] font-normal leading-none tracking-tight text-foreground">~$1</span>
              <span className="text-[15px] text-muted-foreground">/ checkout</span>
            </div>
          </div>

          {/* Feature list card */}
          <div className={`overflow-hidden rounded-2xl border border-border/40 bg-background transition-all duration-1000 delay-200 ${isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <div className="border-b border-border/40 px-8 py-5 md:px-10 md:py-6">
              <p className="font-mono text-[10px] font-medium tracking-[0.2em] text-muted-foreground/50 uppercase">Everything included</p>
            </div>
            <div className="flex flex-col">
              {included.map((item, i) => (
                <div
                  key={item}
                  className={`flex items-center gap-4 px-8 py-5 md:px-10 ${i < included.length - 1 ? "border-b border-border/20" : ""}`}
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-[15px] text-foreground/80">{item}</span>
                </div>
              ))}
            </div>
            <div className="px-8 py-8 md:px-10 md:py-10">
              <Link
                to='/app'
                className="group flex w-full items-center justify-center gap-2.5 rounded-full bg-foreground px-6 py-4 text-[15px] font-medium text-background transition-all duration-300 hover:shadow-lg hover:shadow-foreground/10"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
