import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type EntrypointInfo } from 'wxt'
import { transformWithOxc } from 'vite'
import vue from '@vitejs/plugin-vue'

const sourceManifest = JSON.parse(fs.readFileSync('wxt/manifest.json', 'utf8'))
const svgInjectRe = /<inject>svg:\/\/(.+?)(#(.+))?<\/inject>/g

export default defineConfig({
  srcDir: 'src',
  entrypointsDir: '../wxt/entrypoints',
  zip: {
    excludeSources: ['addon/**', 'build/**', 'coverage/**', 'dist/**'],
  },
  manifest: ({ browser }) => {
    const manifest = structuredClone(sourceManifest)
    delete manifest.manifest_version
    delete manifest.background
    delete manifest.options_ui
    delete manifest.sidebar_action

    if (browser !== 'firefox') {
      delete manifest.browser_specific_settings
      delete manifest.page_action
      manifest.permissions = manifest.permissions.filter(
        (permission: string) =>
          ![
            'contextualIdentities',
            'menus',
            'menus.overrideContext',
            'publicSuffix',
            'theme',
          ].includes(permission)
      )
      manifest.permissions.push('contextMenus')
      manifest.optional_permissions = manifest.optional_permissions.filter(
        (permission: string) => !['proxy', 'tabHide', 'webRequestBlocking'].includes(permission)
      )
      manifest.permissions.push('proxy')
      delete manifest.action.default_area
      delete manifest.action.theme_icons

      for (const [name, command] of Object.entries(
        manifest.commands as Record<string, { suggested_key?: Record<string, string> }>
      )) {
        if (name === '_execute_sidebar_action' && command.suggested_key?.default) {
          command.suggested_key.windows = command.suggested_key.default
        } else {
          delete command.suggested_key
        }
      }
    }

    return manifest
  },
  hooks: {
    'entrypoints:found'(_, entrypoints) {
      const addEntrypoint = (
        name: string,
        type: EntrypointInfo['type'],
        inputPath: string
      ): void => {
        entrypoints.push({ name, type, inputPath: path.resolve(inputPath) })
      }

      addEntrypoint('background', 'background', 'src/bg/background.ts')
      addEntrypoint('sidepanel', 'sidepanel', 'src/sidebar/sidebar.html')
      addEntrypoint('options', 'options', 'src/page.setup/setup.html')
      addEntrypoint('group', 'unlisted-page', 'src/page.group/group.html')
      addEntrypoint('url', 'unlisted-page', 'src/page.url/url.html')
      addEntrypoint('editing', 'unlisted-page', 'src/popup.editing/editing.html')
      addEntrypoint('panel-config', 'unlisted-page', 'src/popup.panel-config/panel-config.html')
      addEntrypoint('proxy', 'unlisted-page', 'src/popup.proxy/proxy.html')
      addEntrypoint('search', 'unlisted-page', 'src/popup.search/search.html')
      addEntrypoint('sync', 'unlisted-page', 'src/popup.sync/sync.html')
    },
    'entrypoints:resolved'(wxt, entrypoints) {
      const outputDirs: Record<string, string> = {
        background: 'bg',
        editing: 'popup.editing',
        group: 'sidebery',
        options: 'page.setup',
        'panel-config': 'popup.panel-config',
        proxy: 'popup.proxy',
        search: 'popup.search',
        sidepanel: 'sidebar',
        sync: 'popup.sync',
        'tab-preview': 'injections',
        url: 'sidebery',
      }
      for (const entrypoint of entrypoints) {
        const outputDir = outputDirs[entrypoint.name]
        if (outputDir) entrypoint.outputDir = path.resolve(wxt.config.outDir, outputDir)
        if (entrypoint.name === 'sidepanel') entrypoint.name = 'sidebar'
        else if (entrypoint.name === 'options') entrypoint.name = 'setup'
      }
    },
    'build:manifestGenerated'(wxt, manifest) {
      if (wxt.config.browser === 'firefox') {
        manifest.sidebar_action = {
          default_icon: 'assets/logo-native.svg',
          default_title: 'Sidebery',
          default_panel: 'sidebar/sidebar.html',
        }
      }
      if (manifest.options_ui) manifest.options_ui.open_in_tab = true
    },
    'build:publicAssets'(_, files) {
      for (const name of [
        'group-page-favicon.svg',
        'logo-native-dark.svg',
        'logo-native-light.svg',
        'logo-native.svg',
        'logo.svg',
        'proxy-native.svg',
        'snapshot-native.svg',
        'window-native.svg',
      ]) {
        files.push({
          absoluteSrc: path.resolve('src/assets', name),
          relativeDest: `assets/${name}`,
        })
      }

      const source = JSON.parse(fs.readFileSync('src/_locales/dict.browser.json', 'utf8'))
      const locales: Record<string, Record<string, { message: string }>> = {}
      for (const [key, translations] of Object.entries(source)) {
        for (const [locale, message] of Object.entries(translations as Record<string, string>)) {
          ;(locales[locale] ??= {})[key] = { message }
        }
      }
      for (const [locale, messages] of Object.entries(locales)) {
        files.push({
          contents: JSON.stringify(messages),
          relativeDest: `_locales/${locale}/messages.json`,
        })
      }
    },
    'vite:build:extendConfig'(_, config) {
      const output = config.build?.rollupOptions?.output
      if (output && !Array.isArray(output)) output.assetFileNames = 'styles/[name].[ext]'
    },
  },
  vite: () => ({
    resolve: { alias: { src: path.resolve('src') } },
    plugins: [
      vue(),
      {
        name: 'inline-sidebery-svg',
        enforce: 'pre',
        async transformIndexHtml(html) {
          const replacements = await Promise.all(
            Array.from(html.matchAll(svgInjectRe), async match => {
              const svgPath = match[1]
              if (!svgPath) return [match[0], match[0]] as const
              let svg = await fs.promises.readFile(path.resolve(svgPath), 'utf8')
              const id = match[3]
              if (id) {
                if (/<svg([^<]*?)id="([^<]*?)"/.test(svg)) {
                  svg = svg.replace(/<svg([^<]*?)id="([^<]*?)"/, (_, attrs) => {
                    return `<svg${attrs}id="${id}"`
                  })
                } else {
                  svg = svg.replace('<svg ', `<svg id="${id}" `)
                }
              }
              return [match[0], svg] as const
            })
          )
          return replacements.reduce(
            (result, [source, svg]) => result.replaceAll(source, svg),
            html
          )
        },
      },
      {
        name: 'transform-vue-template-typescript',
        enforce: 'post',
        transform(code, id) {
          if (!id.includes('?vue&type=template')) return
          return transformWithOxc(code, id, { lang: 'ts', sourcemap: true })
        },
      },
    ],
    build: { cssMinify: 'esbuild' },
  }),
})
