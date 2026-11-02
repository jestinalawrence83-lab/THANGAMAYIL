
import { Link } from "react-router-dom";

export default function PeacockLogo() {
  return (
    <Link to="/" className="thangamayil-brand">
      <svg
        className="peacock-emblem"
        viewBox="0 0 72 82"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Golden peacock emblem"
        role="img"
      >
        <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M36 58 C20 48 8 34 12 18 C25 20 34 31 36 45" />
          <path d="M36 52 C25 36 24 18 34 7 C44 18 45 34 36 52" />
          <path d="M38 49 C39 31 48 18 61 17 C64 32 53 45 38 54" />
          <path d="M33 55 C18 48 8 46 5 34 C18 32 29 42 36 54" />
          <path d="M40 55 C51 43 62 39 68 29 C70 44 57 53 40 59" />
          <path d="M36 49 C26 31 16 29 12 18" />
          <path d="M36 48 C35 27 34 17 34 7" />
          <path d="M37 49 C45 29 54 23 61 17" />
        </g>

        <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <path d="M36 39 C28 48 28 58 35 65 C42 58 43 48 36 39Z" />
          <path d="M35 64 C31 69 30 73 31 77" />
          <path d="M37 64 C41 69 42 73 41 77" />
          <path d="M30 77 L43 77" />
          <path d="M35 40 L35 34" />
          <path d="M35 34 C31 31 31 28 33 26" />
          <path d="M35 34 C39 31 39 28 37 26" />
        </g>

        <g fill="currentColor">
          <circle cx="34" cy="7" r="2.1" />
          <circle cx="12" cy="18" r="2.1" />
          <circle cx="61" cy="17" r="2.1" />
        </g>

        <g stroke="#171717" strokeWidth="1.1">
          <ellipse cx="36" cy="53" rx="4" ry="6" fill="#C8A45D" />
          <ellipse cx="36" cy="53" rx="1.7" ry="3" fill="#171717" />
        </g>
      </svg>

      <span className="thangamayil-wordmark">
        <span className="thangamayil-name">THANGAMAYIL</span>
        <span className="thangamayil-tagline">
          TRADITION, WOVEN IN GOLD
        </span>
      </span>
    </Link>
  );
}
