type Props = { className?: string };

export const PlayIcon = ({ className = "w-3.5 h-3.5" }: Props) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
    <path d="M4.5 3.5v9a.5.5 0 0 0 .76.43l7.5-4.5a.5.5 0 0 0 0-.86l-7.5-4.5A.5.5 0 0 0 4.5 3.5Z" />
  </svg>
);

export const PauseIcon = ({ className = "w-3.5 h-3.5" }: Props) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
    <rect x="4" y="3" width="3" height="10" rx="0.5" />
    <rect x="9" y="3" width="3" height="10" rx="0.5" />
  </svg>
);

export const GithubIcon = ({ className = "w-4 h-4" }: Props) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
    <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.23.49-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.81.06 1.23.83 1.23.83.72 1.23 1.88.88 2.34.67.07-.52.28-.88.51-1.08-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.66 7.66 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.66 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
);

export const SunIcon = ({ className = "w-4 h-4" }: Props) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className={className} aria-hidden>
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
  </svg>
);

export const MoonIcon = ({ className = "w-4 h-4" }: Props) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
    <path d="M6.5 1A6.5 6.5 0 1 0 15 9.5a.5.5 0 0 0-.78-.42 5 5 0 0 1-7.3-7.3.5.5 0 0 0-.42-.78Z" />
  </svg>
);

export const ArrowRight = ({ className = "w-3.5 h-3.5" }: Props) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

export const SparkIcon = ({ className = "w-3.5 h-3.5" }: Props) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden>
    <path d="M8 0l1.6 4.8L14 6.5l-4.4 1.7L8 13l-1.6-4.8L2 6.5l4.4-1.7L8 0Z" />
  </svg>
);
