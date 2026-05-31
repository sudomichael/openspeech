import modelsData from "@/data/models.json";
import scriptsData from "@/data/scripts.json";
import type { Model, Script, ScriptId, Voice } from "./types";

export const models = modelsData as Model[];
export const scripts = scriptsData as Record<ScriptId, Script>;

export function getModel(id: string): Model | undefined {
  return models.find((m) => m.id === id);
}

export function getDefaultVoice(model: Model): Voice {
  return (
    model.voices.find((v) => v.id === model.default_voice) ?? model.voices[0]
  );
}
