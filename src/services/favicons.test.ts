import { describe, expect, test } from 'vitest'
import { getNativeFavicon, isNativeFavicon } from 'src/services/favicons'

describe('isNativeFavicon()', () => {
  test('marks Chrome-owned page icons as native', () => {
    expect(isNativeFavicon(getNativeFavicon('chrome://extensions'))).toBe(true)
  })

  test('keeps extension page icons colored', () => {
    expect(isNativeFavicon(getNativeFavicon('chrome-extension://example/options.html'))).toBe(false)
  })
})
