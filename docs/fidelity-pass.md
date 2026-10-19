# XP, Zune and phone fidelity pass

- [x] Review supplied Zune and Windows Phone reference images and fresh online references.
- [x] Zune responsive media UI, authentic logo, immersive collection view; XP controls and demoscene header.
- [x] Phone lock screen and panorama hubs.
- [x] Club scoring, keta buildup, delayed K-hole flippers, enlarged fast Pep flippers.
- [x] Integrated production build, browser and gameplay checks.

## References

- Zune 4.8 release: https://blogs.windows.com/windowsexperience/2011/08/23/now-available-zune-4-8/
- Original Zune symbol: https://commons.wikimedia.org/wiki/File:Zune_icon_without_wordmark.svg
- Original Zune wordmark: https://commons.wikimedia.org/wiki/File:Zune_logo_and_wordmark.svg
- Microsoft support describes entering Now Playing from the current album picture: https://learn.microsoft.com/en-us/answers/questions/2468804/current-song-playing
- User-supplied screenshots are the visual targets: dark pins/new/history Quickplay, white music collection, full-window album collage with pink/orange bottom glow; WP8 oversized panorama titles, white/orange Office, image-backed Music and Pictures hubs.

## Interaction decisions

Window title bars move a classic outline; releasing applies position. Escape, cancellation or blur leaves the previous position intact. Resize uses the same outline behavior. Zune uses custom slim chrome within the XP desktop. Desktop project links keep Internet Explorer icons and open new tabs.

Digital Creativity uses a small WebGL fragment shader for the pastel demoscene plasma behind its existing title and audio spectrum. Animation pauses when hidden, respects reduced motion, and keeps a CSS fallback when WebGL is unavailable.

The revised game rules supersede the previous ball-time K-hole effect. Entering the club activates tagged collision surfaces. Pep rewards small points and faster, enlarged flippers. Keta rewards more points, accumulating toward K-hole with delayed, slower flippers and a chromatic ball trail. Game effects are fictional arcade modifiers.

## Verification

`make check`, six mode regression tests and `git diff --check` pass. Browser checks cover desktop outline drag/Escape/resize/maximize, WebGL context-loss fallback, Zune full-screen selection and focus return, 420px Zune layout, phone lock/unlock and detail Back, direct routes, actual soundtrack state persistence, and phone game launch at 390px/320px. Instrumented test-only bundles verified real club ramp/rail/horse collisions, delayed flipper response, pause/expiry/drain/restart. No instrumentation is present in production. Opus reviewed the desktop changes; confirmed findings were fixed. No commit or deployment.
