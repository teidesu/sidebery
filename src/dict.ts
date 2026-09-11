import { commonTranslations } from 'src/_locales/dict.common'

const LANG_REG = browser.i18n.getUILanguage().replace('-', '_')
export const LANG = LANG_REG.slice(0, 2)

// Set dictionary
const dict: Record<string, TranslationFn | string> = {}

function isString(r: string | TranslationFn): r is string {
  if (r.constructor === String) return true
  else return false
}

export function translate(id?: string, ...args: (number | string | undefined)[]): string {
  if (!id) return ''

  let record = dict[id]
  if (record === undefined) {
    const translations = typeof window === 'undefined' ? commonTranslations : window.translations
    const prop = translations?.[id]
    if (!prop) return id
    record = prop[LANG_REG] ?? prop[LANG] ?? prop.en
    dict[id] = record
  }

  if (isString(record)) return record
  else return record(...args)
}
