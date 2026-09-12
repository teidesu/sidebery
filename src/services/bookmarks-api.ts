import * as Info from 'src/services/info'

export async function create(
  details: browser.bookmarks.CreateDetails
): Promise<browser.bookmarks.TreeNode> {
  if (Info.isFirefox) return browser.bookmarks.create(details)
  if (details.type === 'separator') {
    throw new Error('Bookmark separators are not supported on Chromium')
  }

  const supportedDetails = { ...details }
  delete supportedDetails.type
  if (details.type === 'folder') delete supportedDetails.url
  return browser.bookmarks.create(supportedDetails)
}
