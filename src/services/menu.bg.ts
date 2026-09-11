import { translate } from 'src/dict'
import * as SnapshotsBg from 'src/services/snapshots.bg'
import * as TabsBg from 'src/services/tabs.bg'
import * as ContextMenu from 'src/services/context-menu'

export function createBrowserActionMenu() {
  createSettingsMenu()
  TabsBg.createOpenFromCacheMenu()
}

export function createSettingsMenu(): void {
  ContextMenu.create({
    id: 'open_settings',
    title: translate('menu.browserAction.open_settings'),
    icons: { '16': 'assets/logo-native.svg' },
    contexts: ['action'],
  })
  ContextMenu.create({
    id: 'create_snapshot',
    title: translate('menu.browserAction.create_snapshot'),
    icons: { '16': 'assets/snapshot-native.svg' },
    contexts: ['action'],
  })
}

function onMenuClicked(info: browser.contextMenus.OnClickData): void {
  if (info.menuItemId === 'open_settings') browser.runtime.openOptionsPage()
  else if (info.menuItemId === 'create_snapshot') SnapshotsBg.createSnapshot()
  else TabsBg.openCachedWindowFromMenu(info.menuItemId)
}

function onMenuHiddenBg(): void {
  browser.contextMenus.removeAll()
  createBrowserActionMenu()
}

export function setupListeners(): void {
  browser.contextMenus.onHidden?.addListener(onMenuHiddenBg)
  browser.contextMenus.onClicked.addListener(onMenuClicked)
}

export function resetListeners(): void {
  browser.contextMenus.onHidden?.removeListener(onMenuHiddenBg)
  browser.contextMenus.onClicked.removeListener(onMenuClicked)
}
