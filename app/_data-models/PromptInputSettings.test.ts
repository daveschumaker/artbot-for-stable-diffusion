import PromptInputSettings from './PromptInputSettings'
import { getSettingFromDexie, updateSetting } from 'app/_db/settings'
import { hasKeywords } from 'app/_pages/CreatePage/PromptInput/KeywordsDropdown/keywordsController'

jest.mock('app/_db/settings', () => ({
  SettingName: { PromptInput: 'promptInput' },
  getSettingFromDexie: jest.fn(),
  updateSetting: jest.fn()
}))

test('a historical saved prompt with undefined optional fields opens without losing its input', async () => {
  const saved = {
    models: ['Realistic Vision'],
    prompt: 'keep my saved prompt',
    seed: '1431632041',
    width: 1024,
    height: 640,
    karras: false,
    loras: undefined,
    tis: undefined,
    preset: undefined,
    upscaled: undefined,
    workflow: undefined,
    extra_texts: undefined
  }
  jest.mocked(getSettingFromDexie).mockResolvedValue({ setting: saved } as any)
  const input = await PromptInputSettings.load()
  expect(() => hasKeywords(input)).not.toThrow()
  expect(input).toMatchObject({
    models: saved.models,
    prompt: saved.prompt,
    seed: saved.seed,
    width: 1024,
    height: 640,
    karras: false,
    loras: [],
    tis: [],
    preset: [],
    upscaled: false,
    workflow: '',
    extra_texts: null
  })
  expect(saved.loras).toBeUndefined()
  expect(updateSetting).not.toHaveBeenCalled()
})
