export function setTitle(details: browser.sidebarAction.SetTitleDetails): void {
  browser.sidebarAction?.setTitle(details)
}

export function toggle(windowId?: ID): void {
  if (browser.sidebarAction?.toggle) {
    browser.sidebarAction.toggle()
  } else if (browser.sidePanel?.open) {
    browser.sidePanel.open({ windowId })
  }
}
