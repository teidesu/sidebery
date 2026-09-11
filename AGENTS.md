# Upstream merge notes

This fork adds Chromium support to upstream Sidebery v5. Keep Firefox behavior unchanged unless a browser-specific implementation is required.

The product branding is Sidechery. Preserve `sidebery` only for upstream references and compatibility-sensitive internal paths, globals, storage keys, and extension identity.

## Intentional divergences

- WXT owns build, dev, zip, entrypoint discovery, manifest generation, SVG inlining, locale generation, and per-browser output. See `wxt.config.ts` and `wxt/`.
- Vue uses `@vitejs/plugin-vue` directly. Do not restore `@wxt-dev/module-vue`; its global Vue auto-import preset pulls the DOM-dependent Vue dev runtime into Chromium's background worker.
- The manifest source is `wxt/manifest.json`. Do not restore `src/manifest.json` or the deleted `build/` pipeline.
- HTML entrypoints reference source `.ts` and `.styl` files. WXT preserves upstream output paths such as `sidebar/sidebar.html`, `sidebery/group.html`, and `styles/sidebar.css`.
- `src/dict.ts` resolves translations lazily because Vite may evaluate the shared dictionary module before page-specific dictionary side effects in production bundles. Do not restore eager `window.translations` snapshotting.
- `transform-vue-template-typescript` in `wxt.config.ts` strips TypeScript assertions left in Pug template modules during dev. Keep it while templates contain expressions such as `value as Type`.
- Chromium manifest generation removes Firefox-only permissions/action fields and normalizes command shortcuts. Firefox keeps the upstream manifest capabilities.
- Chromium maps Firefox's `_execute_sidebar_action` command to `_execute_action`; `src/services/keybindings.fg.ts` translates it back internally so upstream keybinding UI, exports, and sync names stay unchanged. Chromium commands are read-only, so keybinding editing, reset, and import remain Firefox-only; the setup page opens `chrome://extensions/shortcuts` through `tabs.create` because privileged URLs are not directly linkable.
- `src/services/styles.fg.ts` and `src/services/styles.bg.ts` use `browser.theme` only when available. Chromium maps Firefox-theme mode to system light/dark mode.
- `src/services/session-values.ts` is the compatibility boundary for Firefox-only tab/window session values. Firefox uses `browser.sessions`; Chromium uses `browser.storage.session`. Route new `getTabValue`, `setTabValue`, `getWindowValue`, and `setWindowValue` calls through it.
- `src/services/tabs-events.ts` registers filtered `tabs.onUpdated` listeners on Firefox and unfiltered listeners on Chromium, which rejects event filters. Route new filtered tab-update listeners through it.
- Chromium adds `webNavigation`; `src/services/tabs.fg.handlers.ts` uses its top-level lifecycle to distinguish document loads from `history.pushState` and fragment navigation. Only real document navigation may set a tab to loading.
- Chromium configures `sidePanel.setPanelBehavior({ openPanelOnActionClick: true })` instead of handling action clicks itself. This lets toolbar clicks and the `_execute_action` shortcut use Chrome's native open/close toggle.
- `SetupPage.copyDevtoolsUrl` copies Firefox's direct toolbox URL on Firefox and the current extension's `chrome://extensions` details page on Chromium, where live views can be inspected.
- Favicon backup import preserves the five storage shards used by `src/services/favicons.bg.ts`, deduplicates without adding a second copy, and skips only new icons after the cache reaches its limit.
- `src/services/tabs-api.ts` is the required boundary for all tab creation. It strips Firefox-only fields (`cookieStoreId`, `discarded`, `openInReaderMode`, `title`) and self-opener updates on Chromium. Firefox-only succession/warmup calls become no-ops there.
- Route tab discarding through `TabsApi.discard`; Firefox accepts arrays while Chromium requires one `tabs.discard` call per tab ID.
- Foreground and background tab models migrate IDs in place on `tabs.onReplaced`, which Chromium can emit when prerendered/instant content swaps IDs. Do not replace this with full tab reinitialization; it visibly reloads the sidebar. The forced beforeunload discard retry remains Firefox-only.
- Chromium session restore detection matches recently removed tabs by URL, title, and native index because Firefox tab session values do not transfer to Chrome's new restored tab ID. Preserve `RemovedTabInfo.url` for tree restoration.
- Tab rows use `Tab.renderId` as a stable Vue key across native ID replacement, avoiding remove/add animations during Chromium discard.
- Route window creation/update through `src/services/windows-api.ts`; Chromium strips Firefox-only `allowScriptsToClose`, `cookieStoreId`, and `titlePreface` fields.
- Tab screenshots route through `TabsApi.capture`: Firefox uses `captureTab`; Chromium uses `captureVisibleTab` only for an active target and returns no image for inactive tabs. Preview metadata still renders when Chromium cannot capture an image.
- `history.onTitleChanged` is Firefox-only and remains optional in `src/services/history.fg.ts`; Chromium updates history titles on normal reload paths.
- `src/services/sidebar-action.ts` owns Firefox sidebar-action vs Chromium Side Panel behavior. Chromium cannot set the native side-panel title.
- `src/services/info.ts` uses `runtime.getBrowserInfo` on Firefox and derives Chromium version metadata from the user agent. Keep Firefox-version gates disabled outside Firefox and route new browser-info reads through `Info.loadBrowserInfo`.
- Use `Info.isFirefox`/`Info.isChromium` for browser-family branches. Keep direct API feature detection only for capabilities that can vary by browser version or permission.
- `src/services/permissions.ts` filters Firefox-only permission names before calling the permissions API. Route new permission checks/requests through it; Chrome rejects unknown names such as `tabHide` and `webRequestBlocking`.
- `src/services/containers.ts` owns contextual-identity capability detection. Chromium disables native container loading/listeners, and tab normalization supplies `DEFAULT_CONTAINER_ID` when `cookieStoreId` is absent.
- The setup page hides its Containers section and navigation entry when `Containers.isSupported()` is false; direct container-section hashes fall back to General.
- Container-dependent request interception and per-container proxy handlers are disabled when contextual identities are unavailable.
- Context-menu code uses the shared `browser.contextMenus` namespace. Route creation through `src/services/context-menu.ts`, which removes Firefox-only creation fields on Chromium. Firefox-only `onHidden` and `overrideContext` calls remain optional.
- Shared style/favicon/settings helpers and `src/bg/background.ts` guard DOM globals so Chromium's service worker can initialize. Background favicon resizing is skipped without DOM canvas support. Do not add unguarded `window`, `document`, `Image`, or `localStorage` access to background imports/startup.
- Chromium uses the `favicon` permission and `/_favicon/` endpoint for missing or inaccessible native page icons. Live and recently closed Chrome-owned icons are marked with `data-native-favicon` and rendered as `currentColor` masks; `chrome-extension://` page icons retain their colors. Firefox retains upstream favicon handling.
- `BkmNode` infers Chromium bookmark node kinds from `url` because Chrome omits Firefox's `type`; an explicit `separator` remains a Firefox separator and other URL-less nodes are folders.
- Internal group, placeholder, setup, and profile detection uses `browser.runtime.getURL`/parsed hosts. Never restore fixed Firefox UUID offsets; Chromium extension URL prefixes and IDs have different lengths.
- Internal-page IPC always uses BroadcastChannel on Chromium. Firefox keeps the `localStorage` marker to choose BroadcastChannel for the default container and hash messaging for isolated containers.
- Chromium manifest/action icons use supersampled raster `src/assets/logo-{16,20,24,32,40,48,64,128}.png` generated from `logo.svg`; the intermediate sizes cover fractional and HiDPI toolbar scale factors. Chrome falls back to a puzzle icon for SVG manifest icons. Regenerate every PNG when the source logo changes.
- Media injections are passed as functions from `src/injections/` instead of emitted standalone scripts. This keeps `browser.scripting.executeScript` compatible with WXT output.
- Background initialization is wrapped in `defineBackground`; listeners must remain synchronously registered inside that callback.
- pnpm is the package manager. Keep `pnpm-lock.yaml`; do not restore `package-lock.json`.

## Known Chromium gaps

These are not handled by the build migration yet:

- Remaining `browser.sidebarAction.isOpen` call sites need an equivalent Chromium open-state source.
- Container controls outside the main settings section still need to be hidden on Chromium; native contextual identities remain unavailable there.
- `menus.overrideContext` remains Firefox-only and needs guards at call sites.
- `browser.pageAction`, `tabs.hide/show`, window `titlePreface`, and Firefox proxy behavior need guards or alternatives.
- The Chromium background service worker still contains timer and in-memory lifetime assumptions.

When merging upstream, preserve these boundaries, route new Firefox-only calls through the relevant compatibility layer, and update this file when another divergence is introduced.
