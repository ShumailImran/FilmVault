import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useWatchlist from "../hooks/useWatchlist";
import { tmdb } from "../api/tmdb";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const SearchIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { watchlist } = useWatchlist();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const inputRef = useRef(null);
  const desktopRef = useRef(null); // wraps the desktop inline search
  const debounced = useDebounce(query, 350);

  // ── shared fetch logic ──
  useEffect(() => {
    if (debounced.trim().length < 3) {
      setResults([]);
      setDropOpen(false);
      return;
    }
    setSearching(true);
    tmdb
      .search(debounced)
      .then((d) => {
        setResults((d.results || []).slice(0, 6));
        setDropOpen(true);
        setSearching(false);
      })
      .catch(() => setSearching(false));
  }, [debounced]);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
    setDropOpen(false);
  }, []);

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (desktopRef.current && !desktopRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Escape closes everything
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") closeSearch();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeSearch]);

  const openDesktop = () => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const goToMovie = (id) => {
    closeSearch();
    navigate(`/movie/${id}`);
  };
  const goToSearch = () => {
    if (!query.trim()) return;
    const q = query.trim();
    closeSearch();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      {/* ── Navbar shell — same max-width & padding as page content ── */}
      <nav className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-border/60">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 h-[60px] flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="font-display text-2xl tracking-[0.15em] text-accent
                                   hover:opacity-80 transition-opacity duration-200 flex-shrink-0"
          >
            FILMVAULT
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* ── DESKTOP: inline expanding search (md+) ── */}
            <div
              ref={desktopRef}
              className="relative hidden md:flex items-center"
            >
              {/* Expanding input */}
              <div
                className={`flex items-stretch overflow-hidden border rounded-sm bg-surface
                               transition-all duration-300 ease-in-out
                               ${
                                 searchOpen
                                   ? "w-[300px] opacity-100 " +
                                     (dropOpen
                                       ? "border-accent rounded-b-none"
                                       : "border-accent")
                                   : "w-0 opacity-0 border-transparent"
                               }`}
              >
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") goToSearch();
                  }}
                  placeholder="Search movies..."
                  className="flex-1 px-4 py-2 bg-transparent outline-none text-white
                             placeholder-muted text-sm font-light"
                />
                {searching && (
                  <span className="flex items-center pr-3">
                    <span className="w-3 h-3 border border-border border-t-accent rounded-full animate-spin block" />
                  </span>
                )}
              </div>

              {/* Icon / close toggle */}
              <button
                onClick={searchOpen ? closeSearch : openDesktop}
                className="ml-2 flex items-center justify-center w-8 h-8 text-muted
                           hover:text-white transition-colors duration-150 flex-shrink-0"
              >
                {searchOpen ? (
                  <span className="text-xl leading-none">×</span>
                ) : (
                  <SearchIcon />
                )}
              </button>

              {/* Desktop dropdown */}
              {dropOpen && results.length > 0 && (
                <div
                  className="absolute top-full left-0 w-[300px] bg-surface border border-accent
                                border-t-0 rounded-b-sm z-50 overflow-hidden animate-slide-down"
                >
                  {results.map((m) => {
                    const poster = tmdb.poster(m.poster_path, "w92");
                    return (
                      <button
                        key={m.id}
                        onClick={() => goToMovie(m.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5
                                   hover:bg-white/5 transition-colors duration-100 text-left group
                                   border-b border-border/40 last:border-0"
                      >
                        {poster ? (
                          <img
                            src={poster}
                            alt=""
                            className="w-9 h-12 object-cover rounded-sm flex-shrink-0 border border-border"
                          />
                        ) : (
                          <div className="w-9 h-12 bg-border rounded-sm flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate group-hover:text-accent transition-colors">
                            {m.title}
                          </p>
                          <p className="text-xs text-muted mt-0.5">
                            {m.release_date?.slice(0, 4) || "—"}
                          </p>
                        </div>
                        {m.vote_average > 0 && (
                          <span className="text-xs text-muted flex-shrink-0">
                            ★ {m.vote_average.toFixed(1)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <button
                    onClick={goToSearch}
                    className="w-full px-4 py-2.5 text-xs text-muted tracking-widest uppercase
                               hover:text-accent hover:bg-white/5 transition-colors duration-150 text-left
                               border-t border-border"
                  >
                    See all results for "{query}" →
                  </button>
                </div>
              )}
              {/* No results */}
              {searchOpen &&
                debounced.trim().length >= 3 &&
                !searching &&
                results.length === 0 && (
                  <div
                    className="absolute top-full left-0 w-[300px] bg-surface border border-accent
                  border-t-0 rounded-b-sm z-50 h-24 flex flex-col items-center
                  justify-center gap-1 animate-slide-down"
                  >
                    <span className="text-white text-xs tracking-widest uppercase">
                      No Results
                    </span>
                    <p className="text-muted text-[0.7rem] tracking-wider">
                      Nothing found for "{debounced}"
                    </p>
                  </div>
                )}
            </div>

            {/* ── MOBILE: icon that triggers overlay (below md) ── */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex md:hidden items-center justify-center w-8 h-8 text-muted
                         hover:text-white transition-colors duration-150"
            >
              <SearchIcon />
            </button>

            {/* Watchlist */}
            <Link
              to="/watchlist"
              className={`relative text-xs tracking-[0.12em] uppercase transition-colors duration-200
                ${pathname === "/watchlist" ? "text-white" : "text-muted hover:text-white"}`}
            >
              Watchlist
              {watchlist.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-accent text-bg text-[0.6rem] font-display rounded-sm">
                  {watchlist.length}
                </span>
              )}
              {pathname === "/watchlist" && (
                <span className="absolute -bottom-[1px] left-0 right-0 h-px bg-accent" />
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── MOBILE: full-screen overlay (below md only) ── */}
      {searchOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-bg/95 backdrop-blur-md flex flex-col animate-fade-in">
          {/* Input row */}
          <div className="flex items-center gap-3 px-5 h-[60px] border-b border-border flex-shrink-0">
            <span className="text-muted flex-shrink-0">
              <SearchIcon />
            </span>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") goToSearch();
              }}
              placeholder="Search movies..."
              className="flex-1 bg-transparent outline-none text-white placeholder-muted
                         text-base font-light py-2"
            />
            {searching && (
              <span className="w-4 h-4 border border-border border-t-accent rounded-full animate-spin flex-shrink-0" />
            )}
            <button
              onClick={closeSearch}
              className="flex-shrink-0 text-muted hover:text-white transition-colors text-2xl leading-none px-1"
            >
              ×
            </button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {dropOpen && results.length > 0 && (
              <div className="animate-slide-down">
                {results.map((m) => {
                  const poster = tmdb.poster(m.poster_path, "w92");
                  return (
                    <button
                      key={m.id}
                      onClick={() => goToMovie(m.id)}
                      className="w-full flex items-center gap-4 px-5 py-3
                                 hover:bg-white/5 transition-colors duration-100 text-left group
                                 border-b border-border/40"
                    >
                      {poster ? (
                        <img
                          src={poster}
                          alt=""
                          className="w-10 h-14 object-cover rounded-sm flex-shrink-0 border border-border"
                        />
                      ) : (
                        <div className="w-10 h-14 bg-surface border border-border rounded-sm flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate group-hover:text-accent transition-colors">
                          {m.title}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          {m.release_date?.slice(0, 4) || "—"}
                        </p>
                      </div>
                      {m.vote_average > 0 && (
                        <span className="text-xs text-muted flex-shrink-0">
                          ★ {m.vote_average.toFixed(1)}
                        </span>
                      )}
                    </button>
                  );
                })}
                <button
                  onClick={goToSearch}
                  className="w-full px-5 py-3.5 text-xs text-muted tracking-widest uppercase
                             hover:text-accent hover:bg-white/5 transition-colors duration-150 text-left
                             border-t border-border"
                >
                  See all results for "{query}" →
                </button>
              </div>
            )}

            {query.length >= 3 &&
              !searching &&
              results.length === 0 &&
              dropOpen && (
                <p className="px-5 py-8 text-muted text-sm tracking-wider">
                  No results for "{query}"
                </p>
              )}
            {query.length > 0 && query.length < 3 && (
              <p className="px-5 py-8 text-muted text-sm tracking-wider">
                Keep typing...
              </p>
            )}
            {query.length === 0 && (
              <p className="px-5 py-8 text-muted text-sm tracking-wider">
                Type to search any movie
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
