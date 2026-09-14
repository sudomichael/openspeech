export const comparisons = [
  {
    slug: "kokoro-vs-xtts-v2",
    ids: ["kokoro-82m", "xtts-v2"],
    title: "Kokoro vs XTTS v2",
    summary:
      "Choose Kokoro for preset-voice narration on modest hardware. Choose XTTS v2 when cloning a reference voice is central to your project, and check its model license before commercial use.",
    left: "Kokoro is a compact 82M model with preset voices and CPU inference. It is a practical starting point for narration, accessibility, and apps that do not need a custom speaker.",
    right:
      "XTTS v2 focuses on multilingual speech and voice cloning from reference audio. That makes it useful for speaker consistency and localization, but its Coqui Public Model License needs separate consideration from the code license.",
    test: "Listen for how each voice handles the sentence ending and the numbers script. These recordings use different speakers, so they compare the complete output experience rather than isolating model architecture.",
  },
  {
    slug: "kokoro-vs-chatterbox-turbo",
    ids: ["kokoro-82m", "chatterbox-turbo"],
    title: "Kokoro vs Chatterbox Turbo",
    summary:
      "Start with Kokoro for compact preset-voice narration. Try Chatterbox Turbo for a more expressive delivery or a workflow that needs reference-voice conditioning.",
    left: "Kokoro keeps the workflow small: choose a preset voice and synthesize speech, including on CPU. It is well suited to a straightforward script-to-audio tool.",
    right:
      "Chatterbox Turbo is a newer release in the Chatterbox family. Its expressive controls and voice-cloning workflow offer a different set of tradeoffs; the recordings here are the Turbo checkpoint, not the original Chatterbox model.",
    test: "Use the emotional script to compare phrasing, then check the numbers script for pronunciation. Both models are available for your own English text in the free studio.",
  },
  {
    slug: "orpheus-vs-chatterbox-turbo",
    ids: ["orpheus-tts", "chatterbox-turbo"],
    title: "Orpheus vs Chatterbox Turbo",
    summary:
      "Both are worth auditioning for expressive speech. Compare your actual script: Orpheus offers a Llama-based speech approach, while Chatterbox Turbo provides the newer Chatterbox synthesis workflow.",
    left: "The Orpheus recordings use the English 3B 0.1 checkpoint. Its expressive delivery can suit dialogue and character work. Other Orpheus releases are separate checkpoints; these samples do not establish their quality.",
    right:
      "Chatterbox Turbo is a distinct release from the original Chatterbox and its multilingual variants. These samples use the Andy preset. The studio lets you compare it with Orpheus Tara using the same text.",
    test: "Listen for emphasis, pauses, and whether emotion sounds appropriate to the words. Do not compare cold-start wait time as if it were inference speed: hosting conditions also affect it.",
  },
  {
    slug: "qwen3-tts-vs-kokoro",
    ids: ["qwen3-tts", "kokoro-82m"],
    title: "Qwen3-TTS vs Kokoro",
    summary:
      "Kokoro is a compact starting point for preset voices. Qwen3-TTS offers a broader model family and speaker workflows; the studio comparison specifically uses its custom-voice mode.",
    left: "The Qwen3-TTS studio demo uses Serena in English with a pinned provider version. The family also includes other voice workflows, but a preset sample does not demonstrate the quality of a cloned or designed voice.",
    right:
      "Kokoro uses Bella for this comparison and offers a compact 82M architecture with CPU inference. It is a useful baseline when you care about setup effort as well as the sound of the result.",
    test: "Try a product explanation and a sentence containing dates or prices. Compare clarity and phrasing before choosing a model for longer scripts.",
  },
] as const;
export const comparisonFor = (a: string, b: string) =>
  comparisons.find(
    (c) => c.ids.includes(a as never) && c.ids.includes(b as never),
  );
