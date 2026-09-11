import { beforeEach, describe, expect, test, vi } from 'vitest'
import * as TabsApi from 'src/services/tabs-api'

describe('TabsApi.discard()', () => {
  const discard = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    discard.mockClear()
    ;(browser.tabs as any).discard = discard
  })

  test('discards Chromium tabs individually', async () => {
    await TabsApi.discard([1, 2])

    expect(discard).toHaveBeenCalledTimes(2)
    expect(discard).toHaveBeenNthCalledWith(1, 1)
    expect(discard).toHaveBeenNthCalledWith(2, 2)
  })
})
