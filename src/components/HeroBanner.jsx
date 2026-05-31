import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { tmdb } from '../api/tmdb'

export default function HeroBanner({ movies }) {
  const [active, setActive] = useState(0)
  const [fading, setFading] = useState(false)
  const navigate = useNavigate()

  const goTo = useCallback((idx) => {
    if (idx === active) return
    setFading(true)
    setTimeout(() => { setActive(idx); setFading(false) }, 500)
  }, [active])

  useEffect(() => {
    if (!movies.length) return
    const t = setInterval(() => goTo((active + 1) % movies.length), 6000)
    return () => clearInterval(t)
  }, [active, movies.length, goTo])

  if (!movies.length) return <div className="h-[70vh] bg-surface" />

  const film     = movies[active]
  const backdrop = tmdb.backdrop(film.backdrop_path)

  return (
    <div className="relative h-[88vh] max-h-[700px] min-h-[500px] overflow-hidden">

      {/* Backdrop */}
      <div key={active} className={`absolute inset-0 transition-opacity duration-700 ${fading ? 'opacity-0' : 'opacity-100'}`}>
        {backdrop
          ? <img src={backdrop} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-surface" />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-bg/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className={`relative h-full flex flex-col justify-end pb-14 px-5 md:px-10
                       max-w-[1280px] mx-auto transition-opacity duration-500
                       ${fading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="animate-slide-up max-w-xl">
          <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3 font-display">
            Trending This Week
          </p>
          <h2
            onClick={() => navigate(`/movie/${film.id}`)}
            className="font-display leading-none tracking-wide cursor-pointer
                       hover:text-accent transition-colors duration-200 mb-3"
            style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)' }}
          >
            {film.title}
          </h2>

          {/* Rating + year */}
          <div className="flex items-center gap-3 mb-4">
            {film.vote_average > 0 && (
              <span className="flex items-center gap-1.5 bg-accent/15 border border-accent/25
                               text-accent text-xs px-3 py-1.5 rounded-sm font-medium">
                ★ {film.vote_average.toFixed(1)}
              </span>
            )}
            {film.release_date && (
              <span className="text-xs text-muted tracking-wider border border-border px-3 py-1.5 rounded-sm">
                {film.release_date.slice(0, 4)}
              </span>
            )}
          </div>

          <p className="text-sub text-sm leading-relaxed line-clamp-2 mb-8">
            {film.overview}
          </p>

          {/* CTA */}
          <button
            onClick={() => navigate(`/movie/${film.id}`)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-bg
                       font-display text-sm tracking-wider rounded-sm hover:opacity-85
                       transition-opacity duration-150"
          >
            ▶ View Details
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center gap-2 mt-10">
          {movies.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 cursor-pointer
                ${i === active
                  ? 'w-6 h-1.5 bg-accent'
                  : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/50'
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
