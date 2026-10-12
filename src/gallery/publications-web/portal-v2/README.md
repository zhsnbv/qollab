# Imported Qollab portal shell

Source: https://github.com/gazizomarkhanov-dev/qollab-portal-v2
Commit: f8148b6adc4442a1fe3db02125e14d7fd3a1f359

Markup, assets and shell behavior are reused from the designer repository. CSS is scoped to .pw-source-shell; browser globals are adapted for mount/unmount, theme isolation and listener cleanup. Feed cards and article markup are replaced by the existing publications review via React portals. Navigation and search bridge to React. Other source interactions remain intact (including source-only mock data and placeholder links).

44 assets missing from the repository were copied from the rendered https://qollabwebv2.netlify.app/ page (2026-10-08). The original files are in public/portal-v2/assets with their source paths preserved.
Four untracked empty-state image references use existing source SVGs (search/chat/person/emoji) to avoid broken images in deferred panels.
