import { useNavigate } from 'react-router-dom'
import useWatchlist from '../hooks/useWatchlist'
import MovieCard from '../components/MovieCard'

export default function Watchlist() {
  const { watchlist } = useWatchlist()
  const navigate = useNavigate()

  return (
    <main className="max-w-[1280px] mx-auto px-5 md:px-8 pt-12 pb-24">
      <div className="mb-10">
        <h1 className="font-display leading-none tracking-wide mb-1"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
          WATCH<span className="text-accent">LIST</span>
        </h1>
        <p className="text-muted text-sm tracking-widest">
          {watchlist.length} {watchlist.length === 1 ? 'film' : 'films'} saved
        </p>
      </div>

      {watchlist.length === 0 ? (
        <div className="py-32 text-center">
          <span className="font-display text-7xl text-border block mb-3">EMPTY</span>
          <p className="text-muted text-sm tracking-widest mb-6">No films saved yet.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 border border-border text-sub text-xs tracking-widest
                       uppercase rounded-sm hover:border-accent hover:text-accent
                       transition-colors duration-200"
          >
            Discover Films
          </button>
        </div>
      ) : (
        <>
          <div className="h-px w-full bg-border mb-8" />
          <div className="grid gap-6"
               style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            {watchlist.map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        </>
      )}
    </main>
  )
}
