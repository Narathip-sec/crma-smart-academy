'use client'

import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'


import type { HeroSlide } from '@/fixtures/home'

export interface HeroCarouselProps {
  slides: HeroSlide[]
  autoPlayMs?: number
  onCtaPress?: (slide: HeroSlide) => void
}

export function HeroCarousel({ slides, autoPlayMs = 3000, onCtaPress }: HeroCarouselProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const id = setInterval(() => {
      setIndex((c) => (c + 1) % slides.length)
    }, autoPlayMs)
    return () => clearInterval(id)
  }, [slides.length, autoPlayMs])

  if (slides.length === 0) return null

  const safeIndex = index % slides.length
  const active = slides[safeIndex]!

  return (
    <div>
      <div className="rounded-3xl bg-slate-900 p-6 overflow-hidden relative">
        {/* Decorative amber glow */}
        <div
          aria-hidden
          className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/20 pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute right-8 bottom-2 h-24 w-24 rounded-full border border-white/10 pointer-events-none"
        />

        <span className="inline-flex self-start rounded-full bg-white/10 px-3 py-1">
          <span className="text-[10px] uppercase tracking-widest font-bold text-white">
            {active.badge}
          </span>
        </span>
        <p className="mt-3 text-2xl font-bold text-white line-clamp-2">{active.title}</p>
        <p className="mt-1 text-sm text-slate-300 truncate">{active.subtitle}</p>

        <button
          type="button"
          data-testid="hero.cta"
          aria-label={active.ctaLabel}
          onClick={() => onCtaPress?.(active)}
          className="mt-5 inline-flex items-center gap-1 rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-slate-900"
        >
          {active.ctaLabel}
          <ChevronRight size={16} strokeWidth={2.6} />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-1.5 px-1">
        {slides.map((slide, i) => {
          const isActive = i === safeIndex
          return (
            <span
              key={slide.id}
              data-testid={`hero.dot.${slide.id}`}
              role="img"
              aria-label={isActive ? 'current slide' : 'slide'}
              aria-selected={isActive}
              className={`h-1.5 rounded-full transition-all ${isActive ? 'w-4 bg-amber-500' : 'w-1.5 bg-slate-300'}`}
            />
          )
        })}
      </div>
    </div>
  )
}
