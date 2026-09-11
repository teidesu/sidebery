import { describe, expect, test } from 'vitest'
import { translate } from 'src/dict'

describe('translate()', () => {
  test('resolves translations registered after module initialization', () => {
    window.translations ??= {}
    window.translations.late_translation = { en: 'Loaded late' }

    expect(translate('late_translation')).toBe('Loaded late')
  })
})
