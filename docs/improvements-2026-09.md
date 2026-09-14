# OpenSpeech improvements — September 2026

## Product changes

- Model pages lead with listen, strengths, limitations, hardware context, direct comparisons, and installation actions.
- Custom English text comparisons use four pinned Replicate versions: Kokoro, Chatterbox Turbo, Orpheus, and Qwen3-TTS. Default voices are disclosed. Input is limited to 300 characters, three selected models, nine generation attempts per network per UTC day, and 100 attempts across the site per UTC day. Each provider job expires after 180 seconds (including cold start). `DEMO_ENABLED=false` disables creation; `DEMO_DAILY_LIMIT` can lower the global cap (maximum accepted configuration: 500).
- Inputs and emails never go into custom analytics. Provider processing still receives submitted text. The UI explains this; generated output is temporary.
- Recorded comparisons use one audio owner, skip missing recordings, and recover from errors.
- Cloud links point to app.openspeech.dev. Pricing tiers match its advertised launch prices: $0.10 / $0.20 / $0.40 per minute, reviewed September 14. Other provider estimates are explicitly dated June 2026.
- Directory signup writes to the Cloud application's existing waitlist. Configure `WAITLIST_REDIS_REST_URL` and `WAITLIST_REDIS_REST_TOKEN` with the Cloud database credentials. The existing directory Redis remains responsible for demo quotas and votes. Duplicate signups do not increase the subscriber count.

## Catalog review

Eleven additions: Chatterbox Turbo, Nano, Multilingual V3; CosyVoice 3; Pocket TTS; Fish Audio S2 Pro; MOSS-TTS v1.5, Local Transformer v1.5, Nano; OmniVoice; TADA 3B Multilingual. Dates marked "added" are directory dates, not release dates.

Official publisher repositories and model cards are linked on each entry. New versions have separate IDs. Old Chatterbox and Fish Speech audio is explicitly labeled; older model pages link to successors. Unknown hardware and speed values are null, never invented. New entries without a generated recording remain visibly marked as sample pending.

Research used DataForSEO Google organic live results (US/English, September 14) with the user-provided turboConsole credentials, followed by original model cards and source repositories. Search results exposed MOSS, OmniVoice, and TADA gaps. Search snippets were used for discovery, not model specifications. No search-volume or ranking forecasts are implied.

## Recurring maintenance

`.github/workflows/catalog-review.yml` runs Monday at 13:17 UTC and supports manual dispatch. `npm run catalog:watch` checks known publishers plus trending TTS models, compares repository README hashes, and lists entries older than 90 days and missing recordings. It opens or updates one review PR containing `docs/catalog-review.md` and JSON evidence. Candidate forks/quantizations are deliberately reviewable rather than silently published as new models. GitHub repository settings must permit workflow PR creation.

A maintainer must verify candidates and merge catalog additions. This is an active discovery-and-review workflow, not an autonomous editorial service. Run `npm run check:catalog` before merging. `scripts/generate-turbo-samples.mjs` is an idempotent, narrowly scoped sample generator; broader providers remain in the existing generation script.

## Measurement

Gizmo site: openspeech.dev. Goals: sample_play, comparison_play, install_copy, cloud_click, waitlist_signup, custom_generate_success. Funnels: visit → sample_play → waitlist_signup and custom_compare_start → custom_generate_success → custom_audio_play. The directory emits signup only after a successful server response. Outbound Cloud clicks are not treated as signups.

Baseline August 15–September 13: 451 visitors, 824 pageviews, 105 organic-attributed visitors; previous 30 days: 490, 1,147, and 48. Evaluate successful listening, custom generation, installation copies, and signups after launch. Do not equate bounce rate with failure on an audio tool.

## Validation

Production build, TypeScript, ESLint, catalog validation (44 models / 132 recordings), four unit tests, and four browser tests passed. Real provider tests returned audio for all four custom-text models. The Cloud database test verified signup and duplicate handling, then removed its temporary subscriber. Dependency upgrades to Next.js 16.3.5 and patched transitive dependencies resulted in zero npm audit findings.

The release is deployed at https://www.openspeech.dev. All four browser tests also passed against production, and production API tests generated audio with every supported custom-text model and verified the real waitlist database without retaining the test subscriber.
