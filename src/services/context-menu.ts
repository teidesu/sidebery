export function create(createProperties: browser.contextMenus.CreateProperties): string {
  if (typeof browser.runtime.getBrowserInfo === 'function') {
    return browser.contextMenus.create(createProperties)
  }

  const supportedProperties = { ...createProperties }
  delete supportedProperties.icons
  delete supportedProperties.viewTypes
  return browser.contextMenus.create(supportedProperties)
}
