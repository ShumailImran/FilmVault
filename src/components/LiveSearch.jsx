import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { tmdb } from '../api/tmdb'

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function LiveSearch({ autoFocus = false }) {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [open, setOpen]         = useState(false)
  const debouncedQuery          = useDebounce(query, 300)
  const wrapRef                 = useRef(null)
  const navigate                = useNavigate()

  // Fetch on debounced change
  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); setOpen(false); return }
    setLoading(true)
    tmdb.search(debouncedQuery)
      .then(d => {
        setResults((d.results || []).slice(0, 6))
        setOpen(true)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [debouncedQuery])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const go = (id) => {
    setQuery('')
    setResults([])
    setOpen(false)
    navigate(`/movie/${id}`)
  }

  return (
    <div ref={wrapRef} className="relative w-full max-w-[560px]">
      {/* Input */}
      <div className={`flex items-stretch bg-white/10 backdrop-blur-md border rounded-sm
                       transition-colors duration-200
                       ${open ? 'border-accent rounded-b-none' : 'border-white/20 focus-within:border-accent'}`}>
        <span className="flex items-center pl-4 text-white/40 text-sm select-none">
          {loading
            ? <span className="w-3.5 h-3.5 border border-white/30 border-t-accent rounded-full animate-spin block" />
            : '⌕'
          }
        </span>
        <input
          autoFocus={autoFocus}
          className="flex-1 px-3 py-3.5 bg-transparent outline-none text-white
                     placeholder-white/40 text-sm font-light"
          placeholder="Search any movie..."
          value={query}
          onChange={e => { setQuery(e.target.value); if (!e.target.value) setOpen(false) }}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
            className="pr-4 text-white/30 hover:text-white transition-colors text-lg leading-none"
          >×</button>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-surface/95 backdrop-blur-md
                        border border-accent border-t-0 rounded-b-sm z-50 overflow-hidden
                        animate-slide-down">
          {results.map((m, i) => {
            const poster = tmdb.poster(m.poster_path, 'w92')
            return (
              <button
                key={m.id}
                onClick={() => go(m.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5
                           transition-colors duration-100 text-left group"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                {poster
                  ? <img src={poster} alt="" className="w-8 h-12 object-cover rounded-sm flex-shrink-0 border border-border" />
                  : <div className="w-8 h-12 bg-border rounded-sm flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate group-hover:text-accent transition-colors duration-100">
                    {m.title}
                  </p>
                  <p className="text-xs text-muted">{m.release_date?.slice(0, 4) || '—'}</p>
                </div>
                {m.vote_average > 0 && (
                  <span className="text-xs text-muted flex-shrink-0">★ {m.vote_average.toFixed(1)}</span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* No results */}
      {open && !loading && query && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 bg-surface/95 backdrop-blur-md
                        border border-accent border-t-0 rounded-b-sm z-50 px-4 py-4
                        text-muted text-sm tracking-wider animate-slide-down">
          No results for "{query}"
        </div>
      )}
    </div>
  )
}
