/**
 * @jest-environment ./test-utils/jsdomWithIndexedDb.js
 *
 * uploadInpaint loads an image, and optionally its saved mask, into the
 * inpainting editor. Fabric can't render without a real canvas, so a stand-in
 * replaces it. e2e/sourceImages.spec.ts covers the real editor.
 */
import 'fake-indexeddb/auto'

jest.mock('fabric', () => {
  class Canvas {
    loadFromJSON = jest.fn(() => Promise.resolve())
    setDimensions = jest.fn()
    toDataURL = () => 'data:image/webp;base64,TUFTSw=='
  }
  return {
    Canvas,
    config: { configure: jest.fn() },
    FabricObject: { ownDefaults: {} },
    filters: {},
    util: {}
  }
})

jest.mock('app/_utils/promptUtils', () => ({
  ...jest.requireActual('app/_utils/promptUtils'),
  savePrompt: jest.fn()
}))

import { uploadInpaint } from './imageDetailsCommon'
import CreateCanvas from 'app/_data-models/CreateCanvas'
import {
  getCanvasStore,
  getI2IString,
  storeCanvas
} from 'app/_store/canvasStore'
import { savePrompt, SourceProcessing } from 'app/_utils/promptUtils'

const saved = {
  prompt: 'a cat',
  imageType: 'image/webp',
  base64String: 'UkVTVUxU',
  source_image: 'U09VUkNF',
  sampler: 'k_euler',
  models: ['Deliberate Inpainting'],
  height: 512,
  width: 512,
  canvasData: null,
  maskData: null
}

const restore = { clone: true, useSourceImg: true, useSourceMask: true }

describe('uploadInpaint', () => {
  beforeEach(() => {
    jest.mocked(savePrompt).mockClear()
    storeCanvas('maskLayer', null)
  })

  it('getMaskForInput resolves with an empty mask when none was saved', async () => {
    await expect(CreateCanvas.getMaskForInput(null, 512, 512)).resolves.toBe('')
  })

  it('loads the image without a mask when none was saved', async () => {
    await uploadInpaint(saved, restore)

    expect(getI2IString().base64String).toBe('data:image/webp;base64,U09VUkNF')
    expect(savePrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: 'a cat',
        source_image: 'U09VUkNF',
        source_processing: SourceProcessing.InPainting,
        source_mask: ''
      })
    )
  })

  it('loads the saved mask', async () => {
    await uploadInpaint({ ...saved, maskData: { objects: [] } }, restore)

    expect(savePrompt).toHaveBeenCalledWith(
      expect.objectContaining({ source_mask: 'TUFTSw==' })
    )
  })

  // The create page restores saved input on every load. Input without a mask,
  // such as img2img, must be left as it is.
  it('only restores the canvas when onlyWithMask is set and there is no mask', async () => {
    const canvasData = { objects: ['drawing'] }
    await uploadInpaint(
      { ...saved, canvasData },
      { ...restore, onlyWithMask: true }
    )

    expect(savePrompt).not.toHaveBeenCalled()
    expect(getCanvasStore().drawLayer).toBe(canvasData)
    expect(getCanvasStore().clonedCanvasObj).toBe(canvasData)
  })

  it('still loads a saved mask when onlyWithMask is set', async () => {
    await uploadInpaint(
      { ...saved, maskData: { objects: [] } },
      { ...restore, onlyWithMask: true }
    )

    expect(savePrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        source_processing: SourceProcessing.InPainting,
        source_mask: 'TUFTSw=='
      })
    )
  })
})
