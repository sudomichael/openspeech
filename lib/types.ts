export type Sample = {
  neutral: string | null;
  emotional: string | null;
  numbers: string | null;
};

export type Voice = {
  id: string;
  name: string;
  gender: "m" | "f" | "n"; // n = neutral/unspecified
  accent: string;
  samples: Sample;
};

export type Editorial = {
  rank?: "gold" | "silver" | "bronze";
  pitch: string;
  good_for?: string;
};

export type Model = {
  id: string;
  name: string;
  tagline: string;
  /** Longer SEO/editorial prose shown on the model page. */
  about?: string;
  repo_url: string;
  hf_url?: string;
  license: string;
  params: string;
  vram_gb: number | null;
  languages: string[];
  voice_cloning: boolean;
  streaming: boolean;
  realtime_factor: number | null;
  install: string;
  category: string;
  default_voice: string;
  voices: Voice[];
  editorial?: Editorial;
  added_at?: string;
  reviewed_at?: string;
  release_date?: string;
  sources?: { label: string; url: string }[];
  best_for?: string;
  limitations?: string;
  hardware_notes?: string;
  quickstart?: string;
  newer_model_id?: string;
  sample_version?: string;
};

export type ScriptId = "neutral" | "emotional" | "numbers";

export type Script = {
  id: ScriptId;
  label: string;
  description: string;
  text: string;
};
