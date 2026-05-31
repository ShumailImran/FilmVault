const KEY = import.meta.env.VITE_TMDB_KEY
const BASE = 'https://api.themoviedb.org/3'

const get = (path, params = {}) => {
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('api_key', KEY)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
}

export const tmdb = {
  topRated:        (page = 1) => get('/movie/top_rated',            { page }),
  nowPlaying:      (page = 1) => get('/movie/now_playing',          { page }),
  upcoming:        (page = 1) => get('/movie/upcoming',             { page }),
  trending:        ()         => get('/trending/movie/week'),
  search:          (query, page = 1) => get('/search/movie',        { query, page, include_adult: false }),
  detail:          (id)       => get(`/movie/${id}`,                { append_to_response: 'credits,videos' }),
  recommendations: (id)       => get(`/movie/${id}/recommendations`),
  discover:        (params)   => get('/discover/movie',             { sort_by: 'popularity.desc', ...params }),
  poster:   (path, size = 'w342')  => path ? `https://image.tmdb.org/t/p/${size}${path}`  : null,
  backdrop: (path, size = 'w1280') => path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
}
