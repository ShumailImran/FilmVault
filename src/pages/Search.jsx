import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { tmdb } from "../api/tmdb";
import MovieCard from "../components/MovieCard";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showBackTop, setShowBackTop] = useState(false);

  // Back-to-top visibility
  useEffect(() => {
    const handler = () => setShowBackTop(window.scrollY > 600);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Initial fetch when query changes
  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    setPage(1);
    setResults([]);
    tmdb
      .search(query, 1)
      .then((d) => {
        setResults(d.results || []);
        setTotal(d.total_results || 0);
        setTotalPages(d.total_pages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setLoadingMore(true);
    tmdb
      .search(query, nextPage)
      .then((d) => {
        setResults((prev) => [...prev, ...(d.results || [])]);
        setPage(nextPage);
        setLoadingMore(false);
      })
      .catch(() => setLoadingMore(false));
  }, [query, page]);

  const hasMore = page < totalPages && results.length < total;

  return (
    <main className="max-w-[1280px] mx-auto px-5 md:px-8 pt-10 pb-24 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-muted text-xs tracking-widest uppercase mb-5 flex items-center gap-1.5
                     hover:text-white transition-colors duration-150 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-150">
            ←
          </span>{" "}
          Back
        </button>
        <h1
          className="font-display leading-none tracking-wide mb-1"
          style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)" }}
        >
          RESULTS FOR <span className="text-accent">"{query}"</span>
        </h1>
        {!loading && (
          <p className="text-muted text-sm tracking-wider mt-2">
            {total.toLocaleString()} movies found · Showing {results.length}
          </p>
        )}
      </div>

      <div className="h-px w-full bg-border mb-8" />

      {/* Grid */}
      {loading ? (
        <div
          className="grid gap-5"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i}>
              <div className="w-full aspect-[2/3] bg-surface border border-border rounded-sm animate-pulse" />
              <div className="h-3 bg-surface rounded mt-2 w-4/5 animate-pulse" />
              <div className="h-2.5 bg-surface rounded mt-1.5 w-1/3 animate-pulse" />
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <div
            className="grid gap-5"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            }}
          >
            {results.map((m) => (
              <MovieCard key={`${m.id}-${m.title}`} movie={m} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center mt-10">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-8 py-3 border border-border text-sub
                           text-xs tracking-widest uppercase rounded-sm hover:border-accent
                           hover:text-accent transition-all duration-200 disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <span className="w-3.5 h-3.5 border border-border border-t-accent rounded-full animate-spin" />{" "}
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-32 text-center">
          <span className="font-display text-7xl text-border block mb-3">
            NOPE
          </span>
          <p className="text-muted text-sm tracking-widest">
            No movies found for "{query}"
          </p>
        </div>
      )}

      {/* Back to top — appears after 40 results */}
      {showBackTop && results.length >= 40 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 w-10 h-10 bg-surface border border-border
                     flex items-center justify-center rounded-3xl text-muted
                     hover:border-accent hover:text-accent transition-all duration-200
                     shadow-lg shadow-black/40 animate-fade-in z-40"
          aria-label="Back to top"
        >
          ↑
        </button>
      )}
    </main>
  );
}
