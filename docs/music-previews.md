# Compact music playback in Alex

Checked against official provider documentation on 2026-10-20.

SoundCloud supports custom players using its authorized track streams. A registered application and server-side client-credentials token exchange are required; visitors need not sign in to play eligible public tracks. The current static site has no configured playback service. Existing scraped like metadata is not playback authorization.

Proposed integration: a small server endpoint resolves a curated SoundCloud track, checks its `access` value, and obtains the current supported stream. Keep the app secret and token renewal server-side. Alex's existing footer supplies play/pause, progress, volume, a clear preview label, and track/creator attribution linking to SoundCloud. For a 30-second experience, stop at 30 seconds or earlier if the authorized preview ends; never claim all tracks offer a 30-second preview. Handle blocked tracks and API failures with an explicit unavailable state and the existing outbound link. Do not download or bundle provider audio, cache expiring stream URLs into the static snapshot, or conceal an embed.

Spotify's track `preview_url` is deprecated and nullable. It is not a reliable source for universal 30-second previews. Full Spotify playback is a separate integration with its own account and SDK requirements, outside this change.

Sources:
- https://developers.soundcloud.com/docs/api/guide
- https://developer.spotify.com/documentation/web-api/reference/get-track

No playback integration has been enabled. Pending: registered SoundCloud app configuration and a server-side runtime choice.
