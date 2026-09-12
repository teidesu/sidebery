import { describe, expect, test } from 'vitest'
import { getNativeFavicon, isNativeFavicon } from 'src/services/favicons'

describe('getNativeFavicon()', () => {
  test('does not request an icon before the tab has a URL', () => {
    expect(getNativeFavicon('')).toBe('')
  })
})

describe('isNativeFavicon()', () => {
  test('marks Chrome-owned page icons as native', () => {
    expect(isNativeFavicon(getNativeFavicon('chrome://extensions'))).toBe(true)
  })

  test('keeps extension page icons colored', () => {
    expect(isNativeFavicon(getNativeFavicon('chrome-extension://example/options.html'))).toBe(false)
  })
})
