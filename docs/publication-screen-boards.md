# Publication screen boards — 2026-10-13

## Entry points

- `/all?group=publications` — 38 mobile publication states, exact 402×870 frames, within the existing application gallery. Other groups retain their existing dimensions.
- `/handoff/publications-mobile-screens.html` — focused HTML mobile board, search and group filters.
- `/handoff/publications-web-screens.html` — 58 web states, exact 1440×900 iframe viewports. CSS scale affects presentation only; 100% is available.
- `/handoff/publication-state?platform=mobile|web&case=<id>` — an individual interactive state.

`src/gallery/publication-screens/cases.js` is the explicit state inventory. `node scripts/build-publication-boards.mjs` regenerates the two HTML pages after inventory changes. Both pages require this application's server/origin; they are not screenshots or standalone offline copies.

## Coverage

Feed/all channels/filter/empty/loading (mobile), normal article/audit/improvement cards, expanded text, second slide, positive and improvement photo notes, video cover, lightbox, three readers, scroll-to-top, like/bookmark (mobile), unavailable article, short/long/collapsed/expanded nested discussions, reply/draft/empty/disabled comments, publication menu, sharing, statistics, subscribed/unsubscribed/empty channels, subscription settings, existing Channels and Events mobile tabs.

Web additionally includes publication type dropdown, create/edit/preview for all three types, separate media, photo annotation, video URL, validation, publication settings, and Quilly welcome/materials/working/result/history/error/info/applied states. Media playback, gallery swiping, menu toggles, editing and other transient interactions can be exercised inside frames. The gallery is a finite inventory of meaningful product states, not every possible content combination.

## Implementation and isolation

Actual production components render every frame. `PublicationScenarioContext` is null in normal application routes. Only the handoff frame supplies explicit initial state. Publications, comments, channel subscriptions and Quilly history in these frames do not read/write the user's persistent datasets. Quilly fixtures do not call the external AI provider. Autoplay is paused for deterministic review; manual slide navigation works.

`PrepareState` invokes a small number of existing controls to open menus/dialogs and place the scroll position. It reports missing selectors and verifies expected sheets/expanded cards/lightbox/assistant states. HTML boards have a sequential smoke-check button. Offscreen frames unload to limit editor memory; returning resets to the named state. Developer annotations remain outside product screens.

## Delivery scope for Gaziz

His web is already built: transfer only publication feed/cards, reading/discussion and create/edit/Quilly flows. The historical portal shell inside the reference is not a replacement for his site. The `/all` gallery is a mobile implementation handoff, not a request to change unrelated app flows.

## Acceptance

- iframe viewports: web 1440×900; mobile 402×870.
- All listed frames mount, expected overlays are open and state preparation reports no failures.
- Inspect mobile feed, reader, comments and web reader/editor/Quilly visually.
- Main feed, article navigation, likes and storage continue to use normal state outside handoff routes.
- Build application and Storybook from current origin/main plus this focused change before publishing.
- Confirm the deployed `/all` and HTML assets on Cloudflare; a Git push alone is not deployment evidence.

## Verified — 2026-10-13

- Browser sequential state checks: 38/38 mobile and 58/58 web ready; expected overlays and expanded states passed.
- Rendered mobile frames measured 402×870; web iframe viewport attributes are 1440×900.
- Existing publication model/content/editor tests: 23 passed.
- Application + Storybook build passed from a clean release based on origin/main b84bbd5.
- Focused lint: no errors; existing react-refresh export warnings in ChannelsContext/Skeleton only.
- Visual review: mobile feed and threaded comments; web article, editor and Quilly.

## CSS integration correction — 2026-10-13

Cloudflare exposed CSS order conflicts between the mobile application, old portal rules and shared publication styles. The web review and gallery frames now have isolated entry graphs in the source app. Gaziz should retain his own entrypoint and avoid importing the mobile application's global styles.

The package includes corrected PortalShell.css, PublicationPolish.css, PublicationAppearance.css and PublicationsWeb.css: obsolete avatar/person/share sizing is removed, legacy portal selectors have lower specificity, and reaction line-height is explicit. PublicationIdentity uses 44px avatars; action buttons use 15px type, 21px icons and 8px gaps; cover menu icon stays white. Preserve these component-owned rules when integrating.
