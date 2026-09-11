import * as Info from 'src/services/info'

export function create(createProperties: browser.contextMenus.CreateProperties): string {
  if (Info.isFirefox) {
    return browser.contextMenus.create(createProperties)
  }

  const supportedProperties = { ...createProperties }
  delete supportedProperties.icons
  delete supportedProperties.viewTypes
  return browser.contextMenus.create(supportedProperties)
}
