import { afterEach, describe, expect, test } from 'vitest'
import { MTab } from 'src/defaults/mocks.tabs.fg'
import { TabStatus } from 'src/enums'
import * as Tabs from 'src/services/tabs.fg'
import { TESTING } from 'src/services/tabs.fg.handlers'

const navigation = {
  tabId: 2,
  frameId: 0,
  processId: -1,
  timeStamp: 1,
  url: 'https://example.com/search?keywords=roblox',
}

afterEach(() => {
  TESTING.onNavigationFailed(navigation)
  Tabs.setById({})
})

describe('Chromium pending navigation titles', () => {
  test('shows a form destination before Chrome emits a tab URL update', () => {
    const tab = new MTab()
    tab.url = ''
    tab.title = ''
    tab.titleEl = document.createElement('div')
    Tabs.setById({ 2: tab })

    TESTING.onBeforeNavigate(navigation)

    expect(tab.pendingUrl).toBe(navigation.url)
    expect(tab.url).toBe('')
    expect(tab.title).toBe('')
    expect(tab.titleEl.innerText).toBe(navigation.url)
    expect(tab.reactive.status).toBe(TabStatus.Loading)
  })

  test('does not replace a committed page with its next navigation URL', () => {
    const tab = new MTab({ url: 'https://example.com/current', title: 'Current page' })
    Tabs.setById({ 2: tab })

    TESTING.onBeforeNavigate(navigation)

    expect(tab.pendingUrl).toBeUndefined()
    expect(Tabs.getDisplayTitle(tab)).toBe('Current page')
  })

  test('ignores iframe navigation', () => {
    const tab = new MTab()
    tab.url = ''
    tab.title = ''
    Tabs.setById({ 2: tab })

    TESTING.onBeforeNavigate({ ...navigation, frameId: 1 })

    expect(tab.pendingUrl).toBeUndefined()
    expect(Tabs.getDisplayTitle(tab)).toBe('')
  })

  test('preserves a custom title while the form submits', () => {
    const tab = new MTab({ customTitle: 'Search' })
    tab.url = ''
    tab.title = ''
    tab.titleEl = document.createElement('div')
    Tabs.setById({ 2: tab })

    TESTING.onBeforeNavigate(navigation)

    expect(tab.titleEl.innerText).toBe('Search')
  })

  test('stops loading if the initial navigation fails', () => {
    const tab = new MTab()
    tab.url = ''
    tab.title = ''
    Tabs.setById({ 2: tab })

    TESTING.onBeforeNavigate(navigation)
    TESTING.onNavigationFailed(navigation)

    expect(tab.status).toBe('complete')
    expect(tab.reactive.status).toBe(TabStatus.Complete)
    expect(Tabs.getDisplayTitle(tab)).toBe(navigation.url)
  })
})
