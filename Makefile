# Convenience targets for the build pipeline. The underlying script is
# scripts/build.ts (run via `tsx`); env vars gate which upstreams it hits.
# See scripts/build.ts for the full env-var list.

.PHONY: help dev build build-offline build-ssr build-github typecheck check clean-images

help: ## list available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS=":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

dev: ## start a local static file server on :8765
	npm run dev

build: ## full build — fetch every upstream, write snapshot.json, SSR index.html
	npm run build

build-offline: ## SSR-only — reuse data/snapshot.json, skip every upstream and the image step
	SKIP_FETCH=1 SKIP_IMAGES=1 npm run build

build-ssr: ## SSR-only with image accounting (refreshes images/ from existing snapshot URLs)
	SKIP_FETCH=1 npm run build

build-github: ## refresh github stats only — useful after editing data/content.json
	SKIP_STATSFM=1 SKIP_SOUNDCLOUD=1 SKIP_INSTAGRAM=1 npm run build

build-music: ## refresh stats.fm + soundcloud + instagram (skips github)
	SKIP_GITHUB=1 npm run build

typecheck: ## tsc --noEmit
	npm run typecheck

check: typecheck build-offline ## quick local verification — typecheck + offline rebuild
