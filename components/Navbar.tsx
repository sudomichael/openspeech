import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { GithubIcon } from "./Icons";

const REPO_URL = "https://github.com/sudomichael/openspeech";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-canvas/80 border-b border-border">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-accent-fg font-semibold text-sm">
            O
          </div>
          <span className="font-semibold tracking-tight text-[15px]">
            OpenSpeech
          </span>
          <span className="text-[10px] uppercase tracking-widest text-fg-subtle ml-1 border border-border rounded px-1.5 py-0.5">
            beta
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2 text-sm">
          <Link
            href="/"
            className="hidden sm:inline-flex px-3 py-1.5 rounded-md text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors"
          >
            Models
          </Link>
          <Link
            href="/compare"
            className="hidden sm:inline-flex px-3 py-1.5 rounded-md text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors"
          >
            Compare
          </Link>
          <Link
            href="/about"
            className="hidden sm:inline-flex px-3 py-1.5 rounded-md text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors"
          >
            About
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-md text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors inline-flex items-center gap-1.5"
          >
            <GithubIcon />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <ThemeToggle />
          <a
            href={`${REPO_URL}/blob/main/CONTRIBUTING.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 px-3.5 py-1.5 rounded-md bg-accent text-accent-fg text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            Contribute
          </a>
        </div>
      </div>
    </nav>
  );
}
