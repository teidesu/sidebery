import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { NOID } from 'src/defaults'
import { MTab } from 'src/defaults/mocks.tabs.fg'
import * as Tabs from 'src/services/tabs.fg'
import type { TabCache } from 'src/types'

const browserFamily = vi.hoisted(() => ({ firefox: false }))
vi.mock('src/services/info', async importOriginal => ({
  ...(await importOriginal<typeof import('src/services/info')>()),
  get isFirefox() {
    return browserFamily.firefox
  },
  get isChromium() {
    return !browserFamily.firefox
  },
}))

describe('Tabs.restoreTab()', () => {
  beforeEach(() => {
    browserFamily.firefox = false
    Tabs.setById({ 1: new MTab({ id: 1 }) })
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    Tabs.setById({})
    vi.restoreAllMocks()
  })

  test.each<[string, TabCache | undefined]>([
    ['missing saved data', undefined],
    ['cached root', { id: 2, url: 'https://example.com' }],
    ['explicit root', { id: 2, url: 'https://example.com', parentId: NOID }],
    ['missing saved parent', { id: 2, url: 'https://example.com', parentId: 99 }],
  ])('does not resurrect opener nesting for %s on Chromium', (_, data) => {
    const tab = Tabs.TESTING.restoreTab(new MTab({ id: 2, openerTabId: 1 }), { 1: 1 }, NOID, data)
    expect(tab.parentId).toBe(NOID)
  })

  test('restores the saved parent instead of the historical opener', () => {
    const tab = Tabs.TESTING.restoreTab(new MTab({ id: 2, openerTabId: 1 }), { 99: 3 }, NOID, {
      id: 2,
      url: 'https://example.com',
      parentId: 99,
    })
    expect(tab.parentId).toBe(3)
  })

  test('preserves the Firefox opener fallback', () => {
    browserFamily.firefox = true
    const tab = Tabs.TESTING.restoreTab(new MTab({ id: 2, openerTabId: 1 }), {}, NOID)
    expect(tab.parentId).toBe(1)
  })
})
