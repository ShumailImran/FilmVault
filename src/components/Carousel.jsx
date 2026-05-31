import { useRef, useState, useEffect, useCallback } from 'react'
import MovieCard from './MovieCard'
import Skeleton from './Skeleton'

export default function Carousel({ title, movies, loading }) {
  const trackRef = useRef(null)
  const [canLeft, setCanLeft]   = useState(false)
  const [canRight, setCanRight] = useState(true)

  const sync = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 8)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', sync, { passive: true })
    // re-check once images might have loaded
    const t = setTimeout(sync, 300)
    return () => { el.removeEventListener('scroll', sync); clearTimeout(t) }
  }, [movies, sync])

  const scroll = (dir) =>
    trackRef.current?.scrollBy({ left: dir * 600, behavior: 'smooth' })

  return (
    <section className="mb-14">
      {/* Header row */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="font-display text-[1.4rem] tracking-[0.2em] text-white leading-none">
            {title}
          </h2>
          <div className="h-px w-10 bg-accent mt-1.5" />
        </div>

        {/* Arrow buttons */}
        <div className="flex gap-1.5">
          {[[-1, '‹'], [1, '›']].map(([dir, icon]) => {
            const enabled = dir === -1 ? canLeft : canRight
            return (
              <button
                key={dir}
                onClick={() => scroll(dir)}
                disabled={!enabled}
                className={`w-8 h-8 flex items-center justify-center text-lg rounded-sm border
                            transition-all duration-150 select-none
                            ${enabled
                              ? 'border-border text-sub hover:border-accent hover:text-accent cursor-pointer'
                              : 'border-border/20 text-muted/20 cursor-not-allowed'
                            }`}
              >
                {icon}
              </button>
            )
          })}
        </div>
      </div>

      {/* Track */}
      {loading
        ? <Skeleton />
        : (
          <div
            ref={trackRef}
            className="flex gap-5 overflow-x-auto no-scrollbar pb-1"
          >
            {movies.length > 0
              ? movies.map(m => <MovieCard key={m.id} movie={m} />)
              : <p className="text-muted text-sm tracking-wider py-10">Nothing to show.</p>
            }
          </div>
        )
      }
    </section>
  )
}
