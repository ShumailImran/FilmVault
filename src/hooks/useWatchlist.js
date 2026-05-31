import { useState, useEffect } from 'react'

const KEY   = 'filmvault_wl'
const EVENT = 'filmvault_wl_change'

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] }
  catch { return [] }
}

export default function useWatchlist() {
  const [watchlist, setWatchlist] = useState(read)

  // Sync when any other instance of this hook writes
  useEffect(() => {
    const handler = () => setWatchlist(read())
    window.addEventListener(EVENT, handler)
    return () => window.removeEventListener(EVENT, handler)
  }, [])

  const isInWatchlist = (id) => watchlist.some(m => m.id === id)

  const toggleWatchlist = (movie) => {
    const updated = isInWatchlist(movie.id)
      ? watchlist.filter(m => m.id !== movie.id)
      : [...watchlist, movie]
    localStorage.setItem(KEY, JSON.stringify(updated))
    setWatchlist(updated)
    window.dispatchEvent(new Event(EVENT))
  }

  return { watchlist, isInWatchlist, toggleWatchlist }
}
