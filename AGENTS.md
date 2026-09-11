# Upstream merge notes

This fork adds Chromium support to upstream Sidebery v5. Keep Firefox behavior unchanged unless a browser-specific implementation is required.

## Intentional divergences

- WXT owns build, dev, zip, entrypoint discovery, manifest generation, SVG inlining, locale generation, and per-browser output. See `wxt.config.ts` and `wxt/`.
- The manifest source is `wxt/manifest.json`. Do not restore `src/manifest.json` or the deleted `build/` pipeline.
- HTML entrypoints reference source `.ts` and `.styl` files. WXT preserves upstream output paths such as `sidebar/sidebar.html`, `sidebery/group.html`, and `styles/sidebar.css`.
- `transform-vue-template-typescript` in `wxt.config.ts` strips TypeScript assertions left in Pug template modules during dev. Keep it while templates contain expressions such as `value as Type`.
- Chromium manifest generation removes Firefox-only permissions/action fields and normalizes command shortcuts. Firefox keeps the upstream manifest capabilities.
- `src/services/styles.fg.ts` and `src/services/styles.bg.ts` use `browser.theme` only when available. Chromium maps Firefox-theme mode to system light/dark mode.
- `src/services/session-values.ts` is the compatibility boundary for Firefox-only tab/window session values. Firefox uses `browser.sessions`; Chromium uses `browser.storage.session`. Route new `getTabValue`, `setTabValue`, `getWindowValue`, and `setWindowValue` calls through it.
- `src/services/info.ts` uses `runtime.getBrowserInfo` on Firefox and derives Chromium version metadata from the user agent. Keep Firefox-version gates disabled outside Firefox and route new browser-info reads through `Info.loadBrowserInfo`.
- `src/services/permissions.ts` filters Firefox-only permission names before calling the permissions API. Route new permission checks/requests through it; Chrome rejects unknown names such as `tabHide` and `webRequestBlocking`.
- `src/services/containers.ts` owns contextual-identity capability detection. Chromium disables native container loading/listeners, and tab normalization supplies `DEFAULT_CONTAINER_ID` when `cookieStoreId` is absent.
- Media injections are passed as functions from `src/injections/` instead of emitted standalone scripts. This keeps `browser.scripting.executeScript` compatible with WXT output.
- Background initialization is wrapped in `defineBackground`; listeners must remain synchronously registered inside that callback.
- pnpm is the package manager. Keep `pnpm-lock.yaml`; do not restore `package-lock.json`.

## Known Chromium gaps

These are not handled by the build migration yet:

- `browser.sidebarAction` must map to `browser.sidePanel`.
- Container creation/configuration UI still needs to be hidden on Chromium; native contextual identities remain unavailable there.
- `browser.menus`/`menus.overrideContext` need a `contextMenus` compatibility path.
- `browser.pageAction`, `tabs.hide/show`, `tabs.moveInSuccession`, window `titlePreface`, and Firefox proxy behavior need guards or alternatives.
- The Chromium background service worker still contains DOM, `window`, `localStorage`, timer, and in-memory lifetime assumptions.

When merging upstream, preserve these boundaries, route new Firefox-only calls through the relevant compatibility layer, and update this file when another divergence is introduced.
