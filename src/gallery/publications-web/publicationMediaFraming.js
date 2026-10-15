// Art-directed framing for the bundled editorial photographs, in the 8:5 media box.
// Originals stay unchanged in the lightbox; arbitrary uploads retain contain/blur.
const FOCAL_POSITIONS = {
  'prod-power-plant-02.webp': '50% 45%',
  'prod-furnace-02.webp': '50% 50%',
  'prod-jig-machine-02.webp': '60% 50%',
  'prod-balance-02.webp': '55% 40%',
  'prod-audit-01.webp': '50% 35%',
  'prod-audit-02.webp': '50% 45%',
  'prod-audit-03.webp': '50% 50%',
  'prod-audit-04.webp': '50% 45%',
  'prod-audit-05.webp': '50% 50%',
  'clean-aksu-conveyors.webp': '50% 48%',
  'clean-aksu-agglomeration.webp': '72% 50%',
  'clean-aktobe-fire-drill.webp': '30% 50%',
  'clean-award-trophy.webp': '50% 32%',
  'clean-developer-workspace.webp': '52% 48%',
  'erg-run-fest-2026.webp': '50% 38%',
  'erg-ssgpo-trees-2025.webp': '50% 35%',
};

export function publicationMediaPosition(src) {
  const prefix = '/img/publications-web/';
  return src?.startsWith(prefix) ? FOCAL_POSITIONS[src.slice(prefix.length)] : undefined;
}
