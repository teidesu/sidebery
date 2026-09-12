import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import * as BookmarksApi from 'src/services/bookmarks-api'

const browserFamily = vi.hoisted(() => ({ firefox: false }))
vi.mock('src/services/info', async importOriginal => ({
  ...(await importOriginal<typeof import('src/services/info')>()),
  get isFirefox() {
    return browserFamily.firefox
  },
}))

describe('BookmarksApi.create()', () => {
  const create = vi.fn().mockResolvedValue({ id: 'new' })
  const originalCreate = browser.bookmarks.create

  beforeEach(() => {
    browserFamily.firefox = false
    create.mockClear()
    browser.bookmarks.create = create
  })

  afterEach(() => {
    browser.bookmarks.create = originalCreate
  })

  test('strips the Firefox type while preserving bookmark data', async () => {
    const details: browser.bookmarks.CreateDetails = {
      type: 'bookmark',
      title: 'Example',
      url: 'https://example.com',
      parentId: '1',
      index: 2,
    }
    expect(await BookmarksApi.create(details)).toEqual({ id: 'new' })
    expect(create).toHaveBeenCalledWith({
      title: 'Example',
      url: 'https://example.com',
      parentId: '1',
      index: 2,
    })
    expect(details.type).toBe('bookmark')
  })

  test('omits the popup URL field when creating a folder', async () => {
    const details: browser.bookmarks.CreateDetails = { type: 'folder', title: 'Folder', url: '' }
    await BookmarksApi.create(details)
    expect(create).toHaveBeenCalledWith({ title: 'Folder' })
    expect(details).toEqual({ type: 'folder', title: 'Folder', url: '' })
  })

  test('rejects separators instead of turning them into empty folders', async () => {
    await expect(BookmarksApi.create({ type: 'separator' })).rejects.toThrow('not supported')
    expect(create).not.toHaveBeenCalled()
  })

  test.each(['bookmark', 'folder', 'separator'] as const)(
    'preserves Firefox %s creation',
    async type => {
      browserFamily.firefox = true
      const details = { type, title: 'Example' }
      await BookmarksApi.create(details)
      expect(create).toHaveBeenCalledWith(details)
      expect(create.mock.calls[0][0]).toBe(details)
    }
  )
})
