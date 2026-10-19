---
name: add-site-images
description: Add or update photographs in the alex.forbes.red website's local photo collection, including image files, captions, alt text, and an offline rebuild. Use for adding photos to this site, not for fetching an Instagram feed or generating unrelated artwork.
---

# Add images to alex.forbes.red

Work in the `alex.forbes.red` checkout (normally `/Users/lw/Source/github.com/0xdeafcafe/alex.forbes.red`). Read the current `data/photos.json`, `scripts/lib/photos.ts`, and repository instructions before editing. Run `langwatch ingest context` if switching into this repository or another branch/worktree.

The website is the source of truth. Instagram is retired. `data/photos.json` is the hand-maintained photo manifest; `images/photos/` holds the permanent files. Do not scrape a feed, edit `data/snapshot.json` to add photos, or overwrite the collection with generated data. The music cache cleanup owns only `images/albums/` and `images/artists/`.

## Add a photograph

- Inspect the supplied image. Use the user's title, location, date, and ordering when supplied. Write descriptive alt text from what is visible; do not invent a location, date, or person's identity. Ask for the image if it has not been supplied.
- Copy the image into `images/photos/` with a stable, descriptive filename using letters, digits, hyphens, and underscores. Keep existing files intact. Supported formats: JPG, JPEG, PNG, WebP, and AVIF. Convert unsupported formats with an available image tool, preserving orientation and aspect ratio; verify the resulting image. Avoid enlarging originals. Strip private GPS metadata from new public copies unless the user requests retaining it.
- Add an entry to `data/photos.json` with `src`, `title`, `alt`, `location`, `takenAt`, `width`, and `height`. `src` is root-relative, e.g. `/images/photos/amsterdam-rain.webp`. Dimensions are positive integers matching the saved image. `takenAt` is an ISO date or `""` if unknown. `location` may be `""`. Preserve existing metadata and use a nonempty, useful `alt`.
- Manifest order is display order. Put new photos first unless the user gives another order. Do not reorder the older collection. The renderer computes portrait, landscape, and featured tile sizing from dimensions; do not hand-edit those flags in generated output.

## Verify and finish

Run `make check`. The photo loader rejects missing files, duplicate paths, invalid dimensions, and malformed entries. The offline build updates `data.json`, `client.js`, and all six route HTML files without fetching upstreams. Review the diff to ensure every existing photo remains unless removal was requested.

Preview `/photography/` at desktop and phone widths, check the new image and alt text, and open its tile to confirm the local full image works. Check Quickplay's photo count and the photo background as relevant. Keep scratch conversions and screenshots in `$TMPDIR`.

Report the added files, captions, and validation. Adding a photo does not itself authorize committing, pushing, or publishing. The checked-in Pages workflow already deploys `images/`; the snapshot build reads the manifest and never regenerates it.
