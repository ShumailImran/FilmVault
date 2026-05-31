import { useState, useEffect } from 'react'
import { tmdb } from '../api/tmdb'
import HeroBanner from '../components/HeroBanner'
import Carousel from '../components/Carousel'
import useWatchlist from '../hooks/useWatchlist'

export default function Home() {
  const [heroMovies,  setHeroMovies]  = useState([])
  const [topRated,    setTopRated]    = useState([])
  const [nowPlaying,  setNowPlaying]  = useState([])
  const [upcoming,    setUpcoming]    = useState([])
  const [recommended, setRecommended] = useState([])

  const [loadingTop,  setLoadingTop]  = useState(true)
  const [loadingNow,  setLoadingNow]  = useState(true)
  const [loadingUp,   setLoadingUp]   = useState(true)
  const [loadingRec,  setLoadingRec]  = useState(false)

  const { watchlist } = useWatchlist()

  useEffect(() => {
    tmdb.trending().then(d  => setHeroMovies((d.results || []).slice(0, 8)))
    tmdb.topRated().then(d  => { setTopRated(d.results   || []); setLoadingTop(false) })
    tmdb.nowPlaying().then(d => { setNowPlaying(d.results || []); setLoadingNow(false) })
    tmdb.upcoming().then(d  => { setUpcoming(d.results   || []); setLoadingUp(false)  })
  }, [])

  useEffect(() => {
    if (!watchlist.length) { setRecommended([]); return }
    const genreCount = {}
    watchlist.forEach(m => {
      ;(m.genre_ids || []).forEach(id => { genreCount[id] = (genreCount[id] || 0) + 1 })
    })
    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1]).slice(0, 2).map(([id]) => id).join(',')
    if (!topGenres) return
    setLoadingRec(true)
    const wlIds = new Set(watchlist.map(m => m.id))
    tmdb.discover({ with_genres: topGenres })
      .then(d => {
        setRecommended((d.results || []).filter(m => !wlIds.has(m.id)))
        setLoadingRec(false)
      })
      .catch(() => setLoadingRec(false))
  }, [watchlist])

  return (
    <div className="animate-fade-in">
      <HeroBanner movies={heroMovies} />
      <main className="max-w-[1280px] mx-auto px-5 md:px-8 pt-14 pb-24">
        {(loadingRec || recommended.length > 0) && (
          <div className="animate-slide-up stagger-1">
            <Carousel title="RECOMMENDED FOR YOU" movies={recommended} loading={loadingRec} />
          </div>
        )}
        <div className="animate-slide-up stagger-2">
          <Carousel title="TOP RATED"   movies={topRated}   loading={loadingTop} />
        </div>
        <div className="animate-slide-up stagger-3">
          <Carousel title="NOW PLAYING" movies={nowPlaying} loading={loadingNow} />
        </div>
        <div className="animate-slide-up stagger-4">
          <Carousel title="COMING SOON" movies={upcoming}   loading={loadingUp}  />
        </div>
      </main>
    </div>
  )
}
