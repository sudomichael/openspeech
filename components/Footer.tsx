import { GithubIcon } from "./Icons";

const REPO_URL = "https://github.com/sudomichael/openspeech";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center text-accent-fg font-semibold text-xs">
              O
            </div>
            <span className="font-semibold tracking-tight">OpenSpeech</span>
          </div>
          <p className="text-sm text-fg-muted leading-relaxed max-w-sm">
            An open directory of open-source text-to-speech models. Same scripts,
            every voice — so you can actually compare them.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-fg-subtle mb-3">
            Project
          </div>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fg-muted hover:text-fg inline-flex items-center gap-1.5"
              >
                <GithubIcon className="w-3.5 h-3.5" /> Source
              </a>
            </li>
            <li>
              <a
                href={`${REPO_URL}/blob/main/CONTRIBUTING.md`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fg-muted hover:text-fg"
              >
                Contribute a model
              </a>
            </li>
            <li>
              <a
                href={`${REPO_URL}/issues/new/choose`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fg-muted hover:text-fg"
              >
                Open an issue
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-fg-subtle mb-3">
            Credits
          </div>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://github.com/wildminder/awesome-ai-voice"
                target="_blank"
                rel="noopener noreferrer"
                className="text-fg-muted hover:text-fg"
              >
                awesome-ai-voice
              </a>
            </li>
            <li>
              <a
                href="https://replicate.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-fg-muted hover:text-fg"
              >
                Replicate
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-5 text-xs text-fg-subtle">
          Not affiliated with any model author. All models linked to their original sources.
        </div>
      </div>
    </footer>
  );
}
