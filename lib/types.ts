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
  repo_url: string;
  hf_url?: string;
  license: string;
  params: string;
  vram_gb: number;
  languages: string[];
  voice_cloning: boolean;
  streaming: boolean;
  realtime_factor: number;
  install: string;
  category: string;
  default_voice: string;
  voices: Voice[];
  editorial?: Editorial;
};

export type ScriptId = "neutral" | "emotional" | "numbers";

export type Script = {
  id: ScriptId;
  label: string;
  description: string;
  text: string;
};
