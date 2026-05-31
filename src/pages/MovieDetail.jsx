import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { tmdb } from '../api/tmdb'
import useWatchlist from '../hooks/useWatchlist'
import Carousel from '../components/Carousel'
import TrailerModal from '../components/TrailerModal'

export default function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie,       setMovie]       = useState(null)
  const [recs,        setRecs]        = useState([])
  const [loading,     setLoading]     = useState(true)
  const [loadingRecs, setLoadingRecs] = useState(true)
  const [trailerOpen, setTrailerOpen] = useState(false)
  const { isInWatchlist, toggleWatchlist } = useWatchlist()

  useEffect(() => {
    setLoading(true)
    setLoadingRecs(true)
    setMovie(null)
    setRecs([])
    window.scrollTo({ top: 0, behavior: 'smooth' })

    tmdb.detail(id)
      .then(d => { setMovie(d); setLoading(false) })
      .catch(() => { setMovie(null); setLoading(false) })

    tmdb.recommendations(id)
      .then(d => { setRecs(d.results || []); setLoadingRecs(false) })
      .catch(() => setLoadingRecs(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-7 h-7 rounded-full border-2 border-border border-t-accent animate-spin" />
    </div>
  )

  if (!movie) return (
    <div className="text-center py-32">
      <span className="font-display text-7xl text-border block mb-3">404</span>
      <span className="text-muted text-sm tracking-widest">Movie not found.</span>
    </div>
  )

  const inList   = isInWatchlist(movie.id)
  const director = movie.credits?.crew?.find(p => p.job === 'Director')
  const cast     = movie.credits?.cast?.slice(0, 4).map(p => p.name).join(', ')
  const poster   = tmdb.poster(movie.poster_path, 'w500')
  const backdrop = tmdb.backdrop(movie.backdrop_path)
  const runtime  = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null

  const trailer = movie.videos?.results?.find(
    v => v.site === 'YouTube' && v.type === 'Trailer'
  ) || movie.videos?.results?.find(v => v.site === 'YouTube')

  // Format box office (revenue field from TMDB)
  const boxOffice = movie.revenue > 0
    ? `$${(movie.revenue / 1e6).toFixed(0)}M`
    : null

  const mini = {
    id: movie.id, title: movie.title,
    release_date: movie.release_date, poster_path: movie.poster_path,
    genre_ids: movie.genres?.map(g => g.id) || [],
  }

  return (
    <div className="animate-fade-in">

      {backdrop && (
        <div className="relative h-[220px] md:h-[300px] overflow-hidden pointer-events-none">
          <img src={backdrop} alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
        </div>
      )}

      <main className={`max-w-[1280px] mx-auto px-5 md:px-8 pb-10
                        ${backdrop ? '-mt-16 md:-mt-24 relative' : 'pt-10'}`}>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-muted text-xs tracking-widest uppercase
                     mb-6 md:mb-8 hover:text-white transition-colors duration-150 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-150">←</span>
          Back
        </button>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start animate-slide-up">

          <div className="flex-shrink-0 w-[140px] md:w-[220px]">
            {poster ? (
              <img src={poster} alt={movie.title}
                   className="w-full rounded-sm border border-border shadow-2xl shadow-black/60" />
            ) : (
              <div className="w-full aspect-[2/3] flex items-center justify-center
                              bg-surface border border-border rounded-sm text-muted
                              text-xs tracking-widest">
                NO POSTER
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-display tracking-wide leading-tight mb-2"
                style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)' }}>
              {movie.title}
            </h1>

            <div className="flex gap-2 flex-wrap text-[0.7rem] text-muted tracking-widest uppercase mb-4">
              {[movie.release_date?.slice(0,4), movie.original_language?.toUpperCase(), runtime]
                .filter(Boolean)
                .map((v, i, arr) => (
                  <span key={i} className="flex items-center gap-2">
                    {v}{i < arr.length - 1 && <span className="opacity-30">·</span>}
                  </span>
                ))}
            </div>

            {movie.vote_average > 0 && (
              <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20
                              text-accent px-3 py-1.5 rounded-sm text-sm mb-4">
                ★ {movie.vote_average.toFixed(1)}
                <span className="text-accent/40 text-xs">/ 10</span>
                <span className="hidden sm:inline text-accent/40 text-xs">
                  ({movie.vote_count?.toLocaleString()} votes)
                </span>
              </div>
            )}

            {movie.genres?.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-4">
                {movie.genres.map(g => (
                  <span key={g.id} className="px-2.5 py-1 border border-border rounded-full
                                               text-[0.68rem] text-sub tracking-wider
                                               hover:border-accent hover:text-accent
                                               transition-colors duration-150 cursor-default">
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {movie.overview && (
              <p className="text-sub text-sm leading-relaxed max-w-xl mb-6">{movie.overview}</p>
            )}

            <div className="grid grid-cols-2 gap-3 mb-6 max-w-lg">
              {[
                ['Director',    director?.name],
                ['Cast',        cast],
                ['Status',      movie.status],
                ['Box Office',  boxOffice],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="border-l-2 border-border pl-3
                                             hover:border-accent transition-colors duration-200">
                  <div className="text-[0.62rem] tracking-[0.12em] uppercase text-muted mb-0.5">{label}</div>
                  <div className="text-[0.8rem] text-white leading-snug">{value}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => toggleWatchlist(mini)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-sm text-xs
                            tracking-widest uppercase transition-all duration-200
                            ${inList
                              ? 'border-accent text-accent bg-accent/10'
                              : 'border-border text-sub hover:border-accent hover:text-accent'
                            }`}
              >
                {inList ? '✓ Watchlist' : '+ Watchlist'}
              </button>

              {trailer && (
                <button
                  onClick={() => setTrailerOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-accent text-bg
                             font-display text-sm tracking-wider rounded-sm
                             hover:opacity-85 transition-opacity duration-150"
                >
                  ▶ Trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="max-w-[1280px] mx-auto px-5 md:px-8 pt-6 pb-24 animate-slide-up stagger-2">
        <Carousel title="MORE LIKE THIS" movies={recs} loading={loadingRecs} />
      </div>

      {trailerOpen && trailer && (
        <TrailerModal videoKey={trailer.key} onClose={() => setTrailerOpen(false)} />
      )}
    </div>
  )
}
