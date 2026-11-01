# Content and application map

The desktop is an XP workspace. At 760px and below, the phone is the AFR Pocket handheld with its own app interiors. Both presentations consume the same local records. Phone views must not render desktop interiors and shrink or recolour them with CSS.

## Canonical sources

| Content | Source | Consumers |
| --- | --- | --- |
| Personal profile | `scripts/lib/profile.ts` | Messenger (primary profile), Alex collection → profile, phone Profile, quickplay identity and social links |
| Photographs | `data/photos.json`, shaped by `scripts/render/shape.ts` | Alex collection → pictures, Picture & Fax Viewer, phone Photos |
| Music | Existing `data/snapshot.json` stats.fm / SoundCloud records, shaped into `SiteData` | Alex quickplay / music / collection, phone Music |
| Projects | `data/content.json` → `projects` | Explorer → My Projects, Digital Creativity, phone Projects and Keygen |
| Writing | `data/content.json` → `words`, joined to `data/articles.json` by `articleId` | Office Word 2003, phone Writing |
| Project soundtrack | `assets/audio/unreeeal-superhero-3.mp3` | Discovery's desktop and phone presentations |

Profile copy belongs in the profile record. The photo manifest is hand-maintained, not a remote feed. Project descriptions, titles, article sources and destinations come directly from curated content. Writing records join to locally saved structured article blocks in `data/articles.json`. Word and phone Office render five full LangWatch articles with original headings, paragraphs, lists, code, links, and embedded images; reading requires no publisher requests. Each record preserves its actual byline, publication date, original URL, and retrieval source. The OpenTelemetry article is recovered from Wayback because the original page returns 404. The Snapchat item is coverage of Alex’s research by The Verge’s Ben Popper and Russell Brandom: it contains an attributed short summary and original link, not the full third-party article. Unrecoverable text or images must be labelled explicitly; never invent replacements.

## Desktop and phone mapping

| Intent / URL | Desktop app | Phone app |
| --- | --- | --- |
| `/` | Alex’s Main Stream Media open; Alex and Digital Creativity minimized (after XP welcome) | Menu, with the last-played track at the top |
| Profile | Messenger | Profile → card, links, sections |
| `/music` | Alex music | Music → albums tab (recent / albums / artists / songs / likes) |
| `/collection` | Alex collection → music / pictures / profile | Music → albums tab |
| `/photography` | Picture & Fax Viewer | Photos → grid → viewer |
| `/words` | Microsoft Office Word 2003 | Writing → list → reading view → original article |
| `/projects` | Encarta project encyclopedia | Projects → list → detail, website, source |
| My Computer launcher | Explorer directory | Menu |
| Digital Creativity launcher | Digital Creativity project picker | Keygen (same Discovery state, phone markup) |
| Canal Cadet | Existing pinball window | Canal Cadet, played with the hardware buttons |

Studio is absent from the app registry, routes, desktop Start menu and phone apps. Word replaces WordPad. Alex retains only quickplay, music and collection as its top-level pivots.

Explorer starts as My Computer with My Pictures, My Music, My Documents and My Projects folders. Pictures show thumbnails and open the selected photograph in Picture & Fax Viewer. Documents open the selected article in Word. Music folders open Alex's music browser. Project shortcuts open their selected Encarta entry, with an Internet Explorer link opening the project website in a new tab. Encarta has search, categories, project descriptions, repository facts and real preview artwork where available. Digital Creativity remains the alternate project picker.

Alex keeps the Zune-inspired media presentation with a custom AFR monogram and Alex wordmark. Its collection includes a selected-photo gallery with a handoff to Picture & Fax Viewer. The bottom glow is decorative, pauses when hidden and respects reduced motion; it does not claim to visualize music playback.

## Phone behaviour (AFR Pocket)

The phone is an original handheld console, not a recreation of any real device's software. `phone-shell.ts` owns the device, boot, menu, hardware buttons and cursor; `phone-apps.ts` owns Profile, Music, Photos, Writing and Projects. Keygen reuses Discovery's phone branch (restyled by `.pk-app-keygen`) and Canal Cadet reuses the pinball game.

- **Screen:** ordinary HTML drawn in four greys. One SVG filter per palette (`#pk-lcd-leaf|slate|amber`) dithers and maps every pixel, text and photos alike, onto four LCD shades; `colour` turns the filter off. A pixel grid sits above the screen. Links, focus and screen readers keep working.
- **Cursor:** DOM focus on `[data-pk]` elements. The D-pad moves focus to the nearest element in that direction; with nothing beside it, left/right switch tabs. A clicks the focused element. Apps can claim D-pad presses through the cancelable `pocket-pad` window event (photo viewer steps, reading view scrolls).
- **Buttons:** A open, B back (closes a detail view before leaving an app), START menu, SELECT palette. Keyboard: arrows, Enter/X, Z/Escape/Backspace, Home. Hardware buttons never take focus. Optional square-wave blips and vibration; the VOL switch persists `afr-pocket-sound`, the palette persists `afr-pocket-palette`.
- **Canal Cadet:** the buttons send the game's keys (B/left: left flipper, A/right: right flipper, down: launch, up: nudge, SELECT: pause); START returns to the menu.
- **Boot:** four records drop in and the wordmark types out, once per browser session; any button skips; reduced motion skips it.
- **Routes:** music, writing, photos and projects keep their URLs (`/music`, `/words`, `/photography`, `/projects`); other apps are history entries. Browser Back/Forward restores the app.
- **Layouts:** portrait (controls under the screen), landscape up to 760px wide (controls beside the screen) and a device-on-a-desk frame from 520px wide.

Test: `make build-offline && node scripts/tests/phone-apps.mjs` (add `webkit` to run in Safari's engine).

## Current integration checklist

- [x] Profile-first desktop startup; media and keygen minimized.
- [x] Folder-first picture, document, music and project navigation.
- [x] Encarta project library; external links retain new-tab behavior.
- [x] Alex branding, quiet profile links, gallery and reduced-motion-aware glow.
- [x] Pinball procedural sounds, persisted mute, improved flipper collisions, fitted cabinet and hit lamps; eight unit tests and focused instrumented browser play checks.
- [x] Combined article-data build and desktop/phone journey verification: startup, photo selection, folders, Encarta, route hydration and Office reading.
- [x] Integrated desktop/phone pinball: visible mute persists across shells, touch launch works, keyboard hints are hidden on phone, and Back returns to Start.
- [x] Final independent review; Quickplay now separates the latest five distinct albums from earlier history.

The route writer uses a replacement callback so literal dollar amounts in article text cannot become replacement tokens. All six generated routes were checked for one SSR slot and intact dollar amounts.

## Encarta visual identity

The project encyclopedia opens on an illustrated Encarta 95/96-inspired home screen, with original pale-cyan collage artwork, oversized serif lettering and an edition numeral. Find/Index open the full searchable library; Look and Listen filters Audio; Experiment filters Utility; Play a Game filters Game; Explore Projects opens Rush. Explorer project events bypass the home screen and select the requested article. Articles use a charcoal navigation strip, olive headings, inset images and a faint artwork watermark. Existing external project links still open in a new tab. Desktop-only: the phone retains its Metro Projects app.

Validated: typecheck/offline build, home/menu/category/search journeys, article selection, external target, Explorer event handoff, 530px window width and no browser errors.

Each of the 22 project entries now has its own illustrated encyclopedia plate and caption mapped by project name in `scripts/lib/project-plates.ts`. Detail pages use beige paper and brown/olive section headings. Existing real project screenshots remain secondary reference images. Login restores the rounded, fading selection border and plays the original XP startup WAV on explicit entry; the custom loading sentence is replaced by the welcome transition. Alex uses angular uppercase lettering. Pinball restores a perspective camera, keeps viewport fitting, reduces cabinet thickness, and removes the oversized floor shadow; simulation and audio behavior are unchanged.

## First-open splashes

Only Alex, Alexacarta and Alex’s Main Stream Media show splash screens. They dismiss automatically after 1.3 seconds with no Continue button. The app remains hidden and inert until dismissal. Closing resets the splash for the next launch; minimizing/restoring does not replay a completed splash. Reduced motion keeps static artwork. Other desktop apps open directly; phone apps retain Metro transitions.

## Alexacarta and desktop history revision

The encyclopedia is now named Alexacarta throughout the desktop UI and splash. Its active background is `assets/encarta/alexarta-collage.png`, a subtle halftone collage using Alex's supplied portrait. The ornate AI project plates have been removed from rendered views; real project images or restrained explanatory SVG diagrams replace them.

Desktop launches push a browser history entry containing active app and window visibility. Back/Forward restores that workspace; normal route navigation remains supported. Alexacarta additionally records home/index/article navigation, category and search text. Browser history remains finite: no popstate handler pushes replacement navigation entries or prevents leaving the site. Phone app navigation retains its existing Metro history behavior.

Verified in Chromium: Messenger → Alex → Alexacarta and reverse/forward traversal, home/index/article traversal, restored search, mixed music-route/app navigation, and zero browser exceptions. Build and typecheck pass.

### Latest personal shell pass

- Four vinyl records form the shell mark; transparent Messenger artwork includes glasses. Show Desktop has its own icon. Personal copy uses Alexander Forbes-Reed; Alex/Alexacarta remain application brands.
- First launches use the synchronous visibility gate described above; the splash always precedes visible app content.
- Alexacarta contains 43 entries, including 21 additional public GitHub projects verified on 2026-10-20, with broader browsing categories and individual workflow diagrams.
- Pinball has cream/red floral bumpers, masonry ramp parapets and warm lamps; physics and mode constants are unchanged.

### Main Stream Media MSN layout

Alex’s Main Stream Media uses a compact MSN-style personal-message header, framed display picture, topic/contact list and read-only conversation pane. About, work, off-hours and toolkit topics use the shared profile record. Projects, Music and Pictures toolbar buttons open the existing apps; social links open their real profiles. The first-open splash animates two original glossy vector people, with a static reduced-motion variant. The app is hidden synchronously before the first splash frame. Verified topic selection, no horizontal overflow, reduced-motion styling and frame-by-frame launch order in Chromium; build/typecheck passed.

### XP controls and pinball feedback

Window move/resize tracks the initiating pointer and commits at window level, including after title-bar capture loss; Escape, pointer cancellation, blur and viewport resize cancel. Corners are 28px. Explorer has shaded toolbar icons, clickable path segments and an editable virtual address (dropdown, Enter/Go, Escape); unknown folders show an inline error. These paths navigate only the site's folders. Picture & Fax Viewer uses a pale stage and compact icon toolbar; arrow keys work whenever the window is active.

Pinball has an original 100 BPM synthesized arpeggio, separate persisted music toggle and master sound control. Music requires a gesture and stops on pause, hidden/inactive state or drain. Lamp chases and the windmill follow active simulation time; reduced motion keeps lights steady. Shift or Nudge applies a small impulse, with a 300ms cooldown. Three quick nudges tilt: flippers and scoring stop until the last live ball drains. Existing club, K-hole and PEP constants are preserved.

Validation: `make check`, ten pinball unit tests, `scripts/tests/pinball-play.mjs` (including live music and tilt), and `scripts/tests/desktop-controls.mjs`. Phone Chromium checks retain JavaScript-disabled lock-screen rendering, zero XP frames, unlock/app motion, Back, 320px layout and reduced motion.

### Alexacarta catalogue revision

The portrait collage remains the home artwork. A three-entry featured browser and Surprise me provide alternate entry points. Three curated trails connect terminal tools (Rush, DockOS, Loafer), audio projects (AirPods Pro Lapse, Yap, Sounding), and Xbox work (Assembly, Vintage, VisualForge). Entries link to the other stops. The index offers subject counts and filters across all 43 entries. Repeated box diagrams are replaced by explicitly labelled catalogue illustrations: typeset software jackets, record sleeves, teletext and technical covers; existing real screenshots remain. Repository facts are expandable. Chromium checks cover the featured selector, trails, Back, search, filters, external links, and narrow/short windows.

### Desktop wallpaper selection

Start → Display Properties or right-clicking empty desktop opens an XP-style modal with a monitor preview. Twenty original XP wallpapers are bundled locally (credits in assets/xp/CREDITS.md), alongside the existing 30-photo collection and a solid-colour option. Fill, Fit, Stretch, Center and Tile are supported. Thumbnail selection previews only; Apply/OK saves the chosen image and position in localStorage. Cancel discards changes since the last Apply. Saved values are validated against current assets; invalid or unavailable storage falls back to Bliss. Background game/photo keyboard handling is suspended while the modal is open. Browser checks cover image decoding, both collections, Apply/Cancel, reload persistence, Fit, right-click, Escape and short windows.

### Mobile publishing follow-up

The live page was still serving the pre-mobile-first-render shell while the phone fixes were local. Real Chromium touch input confirms upward lock drag and release; the locked Start surface is now visible but inert under the moving curtain. Safari text selection/callouts are disabled on that surface. WebKit also passes mobile first-paint and pointer-swipe checks. Digital Creativity has its own Start tile and app entry (searchable as keygen), with the plasma header; Projects opens the collection separately. Music uses a plain black background instead of selecting an arbitrary artist image. Build/typecheck, original phone regressions, real touch app journeys and WebKit checks pass.
