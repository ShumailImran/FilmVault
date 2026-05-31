import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg mt-auto">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-10">
        <div
          className="flex flex-col md:flex-row items-start md:items-center
                        justify-between gap-8"
        >
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="font-display text-2xl tracking-[0.15em] text-accent block mb-2"
            >
              FILMVAULT
            </Link>
            <p className="text-muted text-xs tracking-wider max-w-[260px] leading-relaxed">
              Discover, track, and explore films from around the world. Powered
              by TMDB.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2">
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-muted mb-1">
              Navigate
            </p>
            {[
              ["/", "Discover"],
              ["/watchlist", "Watchlist"],
            ].map(([path, label]) => (
              <Link
                key={path}
                to={path}
                className="text-xs text-sub hover:text-accent transition-colors duration-150 tracking-wider"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex flex-col items-start md:items-end gap-4">
            {/* GitHub link */}
            <a
              href="https://github.com/ShumailImran"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 text-sub hover:text-white
                         transition-colors duration-150 group"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482
                         0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462
                         -1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529
                         2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943
                         0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025
                         A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025
                         2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842
                         -2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743
                         0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                />
              </svg>
              <span className="text-xs tracking-widest uppercase">
                View Source
              </span>
            </a>

            {/* Fun fact */}
            {/* <div className="text-right">
              <p className="text-[0.65rem] tracking-[0.15em] uppercase text-muted mb-1">
                Did you know?
              </p>
              <p className="text-[0.7rem] text-sub leading-relaxed max-w-[220px] md:text-right">
                The average person spends over 3 years of their life watching
                movies.
              </p>
            </div> */}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="h-px w-full bg-border mt-8 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[0.65rem] text-muted/50 tracking-wider">
            © {new Date().getFullYear()} FilmVault. Built with React + TMDB API.
          </p>
          <p className="text-[0.65rem] text-muted/50 tracking-wider">
            For educational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
