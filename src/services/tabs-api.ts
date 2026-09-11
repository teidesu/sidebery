export function create(
  createProperties: browser.tabs.CreateProperties = {}
): Promise<browser.tabs.Tab> {
  if (typeof browser.runtime.getBrowserInfo === 'function') {
    return browser.tabs.create(createProperties)
  }

  const supportedProperties = { ...createProperties }
  delete supportedProperties.cookieStoreId
  delete supportedProperties.discarded
  delete supportedProperties.openInReaderMode
  delete supportedProperties.title
  return browser.tabs.create(supportedProperties)
}

export function update(
  tabId: ID,
  updateProperties: browser.tabs.UpdateProperties
): Promise<browser.tabs.Tab> {
  if (
    typeof browser.runtime.getBrowserInfo !== 'function' &&
    updateProperties.openerTabId === tabId
  ) {
    updateProperties = { ...updateProperties }
    delete updateProperties.openerTabId
  }
  return browser.tabs.update(tabId, updateProperties)
}

export function moveInSuccession(tabIds: ID[], tabId?: ID): Promise<void> {
  if (typeof browser.tabs.moveInSuccession !== 'function') return Promise.resolve()
  return browser.tabs.moveInSuccession(tabIds, tabId)
}

export function warmup(tabId: ID): Promise<void> {
  if (typeof browser.tabs.warmup !== 'function') return Promise.resolve()
  return browser.tabs.warmup(tabId)
}
