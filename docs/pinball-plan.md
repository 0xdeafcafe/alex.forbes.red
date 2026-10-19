# Canal Cadet implementation

- [x] Confirm direction: dense late-90s Space Cadet-inspired art, asymmetric left ramp, purple dot-matrix cabinet, Dutch nightlife illustration.
- [x] Illustrated mockup and matching table art.
- [x] Rebuild scene composition and cabinet to match the mockup.
- [x] Verify gameplay and speed modifiers, desktop and phone layouts.
- [x] Independent Opus UI review and final production phone launch check.

## Arcade modifiers

The club ramp opens 15 seconds of tagged surfaces: gold **PEP** gives 250 points; violet **KETA** gives 1,000. Surface contacts debounce for 750ms. Three KETA hits trigger **K-hole**: eight seconds of 200ms delayed flipper input and 3 rad/s flipper motion (normal: 14 rad/s). The ball keeps normal physics speed and leaves a chromatic ghost trail; reduced motion disables the trail.

PEP gives ten seconds of 23 rad/s flippers, length 72 instead of 60 and collision radius 10 instead of 7; rendered geometry grows with the collision shape. Ball time receives a modest 1.12× boost. PEP scores during K-hole but cannot cancel the penalty. The horseshoe adds KETA outside the club, and the three distinct PEP lanes remain another way to activate PEP.

Timers advance only in active game time. Pause/hidden apps freeze timers; blur clears queued inputs. Drain and new game clear every effect. Six helper tests cover scoring gates, debounce, buildup, exact delay, dimensions and reset. Browser tests exercise actual club-ramp entry, rail/horse collisions, measured delayed flipper motion, pause/expiry, drain and F2 restart.

## Artwork

Generated art uses the built-in image-generation tool. Final prompts and asset paths will be recorded here. Geometry and hitboxes remain code-owned; decorative artwork must not imply nonexistent collision objects.

Generated assets (built-in image-generation tool):
- assets/pinball/design-mockup.png — full desktop art-direction target.
- assets/pinball/playfield.png — flat printed illustration beneath real 3D geometry.
- assets/pinball/marquee.png — standalone cyclist title illustration.

Prompt briefs: dense late-1990s Space Cadet-inspired dark Dutch canal pinball; purple sculpted left bridge ramp, cream/red bumpers, warm lamps and purple dot-matrix score tower. Playfield prompt: flat top-down midnight-blue canal map, painted Amsterdam houses, windmill, bicycles, dance-floor medallion and worn ink, no physical collision objects. Marquee prompt: lavender Canal Cadet lettering, adult cyclist with red scarf, cargo bike, small dog, tulips and starry canal backdrop; no UI counters.

## Pinball polish (2026-10-19)

- [x] Inspect physics, rendering and existing mode tests.
- [x] Add gesture-unlocked procedural audio, persistent visible mute, and silence on pause/hidden/inactive state.
- [x] Subdivide flipper sweeps, extend return guides to the pivots, and aim the ramp exit toward the playable lower field.
- [x] Fit the cabinet to the canvas, add cabinet depth/contact shadow, individual hit lamps and mode feedback.
- [x] Complete final instrumented browser regression after the immediate-reload mute fix: PASS. TypeScript and all eight unit tests also pass.

The audio module synthesizes six short voices: launch, flipper stroke, bumper, target, drain and mode. Events originate in the actual simulation; flipper sounds follow delayed motion in K-hole. Muting or deactivating immediately stops existing voices, and teardown closes the context. The sound button remains visible on phones and saves its preference synchronously. No samples or dependencies are added.

Collision substeps now account for paddle travel as well as ball travel, testing interpolated paddle angles during the stroke. The original restitution/contact model and arcade mode constants remain. The table uses an orthographic cabinet-fit camera based on the canvas's measured dimensions. Hit intensity decays over 180ms of simulation time; reduced motion removes these transient flashes and the existing K-hole trails, retaining steady progress and mode lamps. Bumpers and targets have independent materials, so one hit does not illuminate the whole bank.

Validation commands:

```sh
npx tsc --noEmit
node --import tsx --test scripts/tests/pinball-*.test.ts
node scripts/tests/pinball-play.mjs
```

The browser script bundles only the real Pinball component into `$TMPDIR/pinball-polish`, injecting state access and sound-event recording at build time. It runs real Chromium/WebGL and actual key/pointer input. It also places balls at controlled collision locations for repeatable flipper, bumper, target, ramp and drain checks. No test accessors are present in production sources. `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH` can override the local browser-tool paths. It serves fixtures through Playwright routing, without writing site build outputs.

Eight unit tests cover mode constants/scoring/delay and audio lifecycle. Browser coverage includes three launch strengths with timed flippers, both flipper returns, club entry/ramp exit, bumper/target scoring and flashes, real oscillator scheduling for all six sound categories, K-hole lag, PEP lane activation, paused/inactive/hidden timers and audio, drain/reset, phone launch, and mute persistence across reload. Desktop (1100×850) and phone (390×844, reduced motion) screenshots stay in session scratch. Hidden visibility is simulated with a test-only document property/event; inactive app state is exercised through the component prop.

Limits: headless WebAudio scheduling and lifecycle are verified, but perceived loudness/timbre still need human listening on speakers/headphones. This is a bounded physics improvement, not a full rigid-body solver or a long-session difficulty study. The harness isolates the component from concurrently edited desktop/phone shell code. No commits, generated site outputs, or deployment are part of this pass.
