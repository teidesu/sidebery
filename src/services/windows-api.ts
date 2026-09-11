import * as Info from 'src/services/info'

export function create(createData: browser.windows.CreateData): Promise<browser.windows.Window> {
  if (Info.isFirefox) return browser.windows.create(createData)

  const supportedData = { ...createData }
  delete supportedData.allowScriptsToClose
  delete supportedData.cookieStoreId
  delete supportedData.titlePreface
  return browser.windows.create(supportedData)
}

export function update(
  windowId: ID,
  updateInfo: browser.windows.UpdateInfo
): Promise<browser.windows.Window> {
  if (Info.isChromium && updateInfo.titlePreface !== undefined) {
    updateInfo = { ...updateInfo }
    delete updateInfo.titlePreface
  }
  return browser.windows.update(windowId, updateInfo)
}
