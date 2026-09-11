export function addUpdatedListener(
  listener: browser.tabs.UpdatedListener,
  properties: browser.tabs.UpdateProp[]
): void {
  if (typeof browser.runtime.getBrowserInfo === 'function') {
    browser.tabs.onUpdated.addListener(listener, { properties })
  } else {
    browser.tabs.onUpdated.addListener(listener)
  }
}
