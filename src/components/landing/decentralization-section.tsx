"use client"

import { useRef } from "react"
import { Network, Users, Zap, Share2 } from "lucide-react"
import { useInView } from "@/hooks/use-in-view"

const benefits = [
  {
    icon: Network,
    title: "No single point of failure",
    description:
      "Bitlasso runs on Nostr, a decentralized network. Your business isn't dependent on any company staying online or in business.",
  },
  {
    icon: Users,
    title: "You control your data",
    description:
      "Your transaction history and client relationships aren't locked in a proprietary database. You own and can export everything.",
  },
  {
    icon: Zap,
    title: "Instant everywhere",
    description:
      "Decentralized infrastructure means no geographic restrictions. Send payments, settle credits, and manage clients from anywhere.",
  },
  {
    icon: Share2,
    title: "Portable business",
    description:
      "Switch tools without losing your history. Your identity and credits move with you across any Nostr-enabled platform.",
  },
]

export function DecentralizationSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="decentralized" className="relative border-t border-border/40 px-6 py-32 sm:px-10 md:py-40 lg:px-16">
      <div ref={ref} className="mx-auto max-w-[90rem]">
        {/* Header */}
        <div className={`mb-24 transition-all duration-1000 ${isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          <p className="mb-5 font-mono text-[11px] font-medium tracking-[0.2em] text-primary uppercase">Decentralized</p>
          <h2 className="max-w-4xl font-serif text-[clamp(2rem,4.5vw,3.75rem)] font-normal leading-[1.1] tracking-tight text-foreground">
            Built on Nostr for freedom
          </h2>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-[1.7] text-muted-foreground">
            Bitlasso is built on Nostr, an open protocol where no single company controls your data. Think of it like email: your identity and history belong to you, not the platform.
          </p>
        </div>

        {/* 2x2 feature grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {benefits.map((benefit, i) => (
            <div
              key={benefit.title}
              className={`group relative overflow-hidden rounded-2xl border border-border/40 bg-card p-8 transition-all duration-700 hover:border-border/80 hover:shadow-lg md:p-10 ${isInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              style={{ transitionDelay: isInView ? `${400 + i * 100}ms` : "0ms" }}
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8 ring-1 ring-primary/10 transition-all duration-300 group-hover:bg-primary/12 group-hover:ring-primary/20">
                <benefit.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-card-foreground md:text-xl">{benefit.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.7] text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom callout */}
        <div
          className={`mt-20 rounded-2xl border border-primary/20 bg-primary/5 p-8 md:p-12 transition-all duration-1000 delay-500 ${isInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <p className="text-[15px] leading-[1.8] text-foreground/80">
            <span className="font-semibold text-foreground">What's Nostr?</span> It's a simple, open standard that lets you own your identity and data. <br />
            Like Bitcoin for communication and relationships, Nostr gives you total control. <br />
            You own your merchant profile, your client list, your transaction history — Bitlasso can't lock you in or shut you down.
          </p>
        </div>
      </div>
    </section>
  )
}
