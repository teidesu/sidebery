import { describe, expect, test, vi } from 'vitest'
import { MTab } from 'src/defaults/mocks.tabs.fg'
import * as Tabs from 'src/services/tabs.fg'

describe('Tabs.renderFaviconInto()', () => {
  test('renders a placeholder while the new tab URL is empty', () => {
    const tab = new MTab()
    tab.url = ''
    tab.favIconUrl = undefined
    const img = document.createElement('img')
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
    svg.append(use)

    Tabs.renderFaviconInto(tab, img, use)

    expect(img.getAttribute('src')).toBeNull()
    expect(img.style.display).toBe('none')
    expect(use.getAttribute('href')).toBe('#icon_ff')
    expect(svg.style.display).toBe('block')
  })

  test.each([false, true])('does not retry a failed favicon (sticky: %s)', sticky => {
    const tab = new MTab({ url: 'https://example.com' })
    const img = document.createElement('img')
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
    svg.append(use)
    Tabs.renderFaviconInto(tab, img, use)
    const failedSrc = img.src
    const setSrc = vi.spyOn(img, 'src', 'set')
    if (!sticky) tab.favIconUrl = undefined

    Tabs.renderFaviconInto(tab, img, use, true)

    expect(setSrc).not.toHaveBeenCalled()
    expect(img.style.display).toBe('none')
    expect(svg.style.display).toBe('block')
    expect(tab.favIconUrl).toBe(sticky ? failedSrc : undefined)

    tab.favIconUrl = 'https://example.com/favicon.ico'
    Tabs.renderFaviconInto(tab, img, use)
    expect(img.src).toBe(tab.favIconUrl)
    expect(img.style.display).toBe('block')
    expect(svg.style.display).toBe('none')
    setSrc.mockRestore()
  })
})
