async function getWindowId(windowId: ID): Promise<ID> {
  if (windowId !== browser.windows.WINDOW_ID_CURRENT) return windowId
  return (await browser.windows.getCurrent({ populate: false })).id ?? windowId
}

function getStorageArea(): browser.storage.StorageArea {
  return browser.storage.session ?? browser.storage.local
}

export async function getWindowValue<T>(windowId: ID, key: string): Promise<T | undefined> {
  if (typeof browser.sessions.getWindowValue === 'function') {
    return browser.sessions.getWindowValue<T>(windowId, key)
  }

  const storageKey = `session:window:${await getWindowId(windowId)}:${key}`
  const stored = await getStorageArea().get<Record<string, T>>(storageKey)
  return stored[storageKey]
}

export async function setWindowValue<T>(windowId: ID, key: string, value: T): Promise<void> {
  if (typeof browser.sessions.setWindowValue === 'function') {
    return browser.sessions.setWindowValue(windowId, key, value)
  }

  const storageKey = `session:window:${await getWindowId(windowId)}:${key}`
  await getStorageArea().set({ [storageKey]: value })
}

export async function getTabValue<T>(tabId: ID, key: string): Promise<T | undefined> {
  if (typeof browser.sessions.getTabValue === 'function') {
    return browser.sessions.getTabValue<T>(tabId, key)
  }

  const storageKey = `session:tab:${tabId}:${key}`
  const stored = await getStorageArea().get<Record<string, T>>(storageKey)
  return stored[storageKey]
}

export async function setTabValue<T>(tabId: ID, key: string, value: T): Promise<void> {
  if (typeof browser.sessions.setTabValue === 'function') {
    return browser.sessions.setTabValue(tabId, key, value)
  }

  const storageKey = `session:tab:${tabId}:${key}`
  await getStorageArea().set({ [storageKey]: value })
}
