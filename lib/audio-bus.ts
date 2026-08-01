let current: HTMLAudioElement | null = null;

// Every player must call this in its onPlay handler so only one audio element plays at a time.
export function claimPlayback(el: HTMLAudioElement) {
  if (current && current !== el && !current.paused) current.pause();
  current = el;
}
