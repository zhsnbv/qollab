CHAT WALLPAPER RENDERER v11

Run from this directory:
  python3 server.py 8766
Open http://127.0.0.1:8766/ in desktop Chrome.
1. Preview first frames shows all 12 palettes.
2. Play 4 families shows one moving example per rendering family.
3. Start all exports renders each of the 12 jobs offline, sequentially.

No npm packages or reference websites are needed after these files are saved.
The exporter uses local shaders.json, prism.js, manifest.json and exporter.js.
It does not automate a browser. A person or authorized CUA session starts it
through the page controls. Keep the page open while rendering.

OUTPUT
720 x 1280 pixels, 9:16, 24 fps, 24 seconds, 576 frames, silent H.264.
VideoEncoder receives an explicit timestamp and duration per canvas frame;
it does not record real-time page playback. Delays therefore cannot skip frames.
The local Python server only accepts known manifest job IDs and approved
extensions, on 127.0.0.1. It writes to artifacts/live-wallpapers-v11-2026-11-17/renders/ under the repo root. Raw .h264 is remuxed by
ffmpeg (from PATH, with Homebrew fallback) to faststart MP4 without audio or re-encoding.
Each job also saves its frame-zero WebP poster and a JSON QA report.
/status returns the completed-job reports. batch-complete.json is written
only after all jobs finish. The renderer does not change production files.
After export, python3 compress_runtime.py compresses the 12 known jobs into
public/video/chat-themes and copies their posters into public/img/chat-themes.
It uses libx264 slow / CRF20 / animation / AQ3, silent H.264 High3.1, GOP48.
The command requests -pix_fmt yuv420p; actual ffprobe output is authoritative.
The three procedural Prism videos (blue/mint/peach) decode as yuvj420p with
color_range=pc (full range). The other nine procedural videos decode as
yuv420p. The separate three supplied clips also decode as yuv420p. No range
conversion was forced after QA. Runtime manifest records requestedPixelFormat
separately from decodedPixelFormat and colorRange; absent tags remain unknown.
python3 verify_exports.py verifies the master exports and exact source-endpoint metadata, and writes
artifact reports. The original raw reference bundles are not needed to render;
all required extracted effect math is checked in here.

LOOP
For frame k, shader time = base + span * sin(2*pi*(k mod 576)/576).
Sky: base8/span3; Mesh: base10/span2.2; Aurora: base20.75/span2.8;
Prism: base28/span4.5. Motion follows a smooth closed trajectory; its direction
reverses gradually at quarter and three-quarter phase. This is deliberate,
not a claim that the original effects have naturally periodic linear time.
Position and first derivative match across the seam. Frame576 equals frame0.
The export includes frames0..575, avoiding a duplicated held endpoint.
Every job renders and compares frame0/frame576 pixel-for-pixel before encoding,
and records first/last-step and quarter-cycle image differences. These prove
the deterministic source seam, not the absence of compression error. Inspect
the final decoded MP4 across the seam after export.

REFERENCE PROVENANCE
Sky: https://skyflowpro.framer.website/
Actual shared JS: https://framerusercontent.com/sites/7ytQkU0VJrQ3UPVUv5YAuS/shared-lib.DwcBjsHW.mjs
Mesh: https://mesh-gradient.framer.website/
Actual shared JS: https://framerusercontent.com/sites/7hDlQdYO1DpgrXH9yv0QzW/shared-lib.CBpeLlWi.mjs
Effects: https://new-domain-587305.framer.app/
Actual shared JS: https://framerusercontent.com/sites/eBO6NJFkB40MTPLLSHpxu/shared-lib.HkE17PCC.mjs

Original downloaded snapshots and main/page modules are in artifacts/live-wallpapers-v11-2026-11-17/reference-code/.
SHA-256 values of the three shared snapshots are in manifest.json.
Sky uses the original WebGL2 procedural cloud shader and deterministic LCG
noise texture seeded73451. Its Glacier Blue, Mint Current and Lilac Mist
palettes are preserved; grainStrength=0. The reference UI is excluded.
Mesh uses the original Paper Shaders vertex/fragment mesh code extracted from
the public bundle, with three calmer custom palettes, distortion.65/swirl.12,
grainMixer0/grainOverlay0. Template constants are resolved in shaders.json.
Aurora uses the effects reference's curtain fragment shader and Northern
lights/Violet crown/Ice dome palettes. Fast individual-ray flicker and star
twinkle are suppressed. Fold/drift are reduced slightly for calm motion.
Prism uses the reference's Prism2 Canvas geometry and OKLab interpolation
(hl/pl functions), Glacier/Mint tonic/Velvet peach palettes, original crest
shape and expand movement, facets25. No invented replacement SVG or gradients.
These are attributed adaptations of the reference rendering math, not a claim
of authorship of the original effects. No reference titles, UI, logos or text
are included in the output.

RUNTIME SEPARATION
This folder is an offline asset-generation artifact. Product components should
use the resulting MP4 and WebP files, not compile shaders while chatting.
The source assets and product motion/reduced-motion policy are separate.

VALIDATION BEFORE PUBLICATION
- ffprobe: exact dimensions, frame rate, frame count, duration and no audio.
- Decode adjacent frames at the seam and compare to normal adjacent steps.
- Confirm visibly changing frames and inspect all four families in motion.
- Confirm all 12 MP4/poster pairs and manifest source IDs match the catalog.

DECODED SEAM METRIC
The exact source endpoint check is mandatory. Encoded video is lossy: its
first keyframe may differ by about one 8-bit level from the closing neighbour.
The verifier accepts absolute seam mean error <=1.5/255 at180x320 while
retaining relative ratios >=3 as separate flags; a ratio alone is unstable
when nearly static motion has adjacent differences of only0.03/255.
Run python3 verify_exports.py --runtime after compression to inspect the
actual product MP4s. This is not a claim of decoded pixel identity.

LICENSE STATUS
The original public Framer shader/Canvas effect code has no verified license
in the downloaded snapshots. Its license status is UNKNOWN. This folder does
not label that reference code MIT and does not treat publication on Framer
as a license grant. Any Phosphor MIT notice elsewhere in this project applies
to Phosphor icons, not these effect sources. Exact reference URLs and hashes
above/in manifest.json identify the source used. This offline adaptation has
no remote JavaScript imports, external assets, fonts, analytics or runtime
network dependencies; its browser fetch calls read only local exporter files
and send completed known jobs to its local save endpoint.

ACTUAL DECODED FORMATS
ffprobe reports yuvj420p/full-range (pc) for live-prism-blue, live-prism-mint
and live-prism-peach. The other nine procedural clips report yuv420p.
The requested encoding flag -pix_fmt yuv420p is not a claim that every output
has identical range signalling. Runtime manifests record the actual metadata.
