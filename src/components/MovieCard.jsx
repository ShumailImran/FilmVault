import { useNavigate } from 'react-router-dom'
import { tmdb } from '../api/tmdb'

export default function MovieCard({ movie }) {
  const navigate = useNavigate()
  const poster = tmdb.poster(movie.poster_path)

  return (
    <div
      onClick={() => navigate(`/movie/${movie.id}`)}
      className="flex-shrink-0 w-[150px] cursor-pointer group"
    >
      {poster ? (
        <img
          src={poster}
          alt={movie.title}
          loading="lazy"
          className="w-full aspect-[2/3] object-cover rounded-sm border border-border
                     group-hover:border-accent transition-all duration-200 group-hover:-translate-y-1"
        />
      ) : (
        <div className="w-full aspect-[2/3] flex items-center justify-center rounded-sm
                        bg-surface border border-border text-muted text-[0.65rem] tracking-widest
                        text-center px-2 group-hover:border-accent group-hover:-translate-y-1
                        transition-all duration-200">
          NO POSTER
        </div>
      )}
      <p className="mt-2 text-[0.82rem] font-medium text-white truncate leading-snug">
        {movie.title}
      </p>
      <p className="text-[0.7rem] text-muted mt-0.5">
        {movie.release_date?.slice(0, 4) || '—'}
      </p>
    </div>
  )
}
