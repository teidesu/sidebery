import * as Info from 'src/services/info'

export function addUpdatedListener(
  listener: browser.tabs.UpdatedListener,
  properties: browser.tabs.UpdateProp[]
): void {
  if (Info.isFirefox) {
    browser.tabs.onUpdated.addListener(listener, { properties })
  } else {
    browser.tabs.onUpdated.addListener(listener)
  }
}
