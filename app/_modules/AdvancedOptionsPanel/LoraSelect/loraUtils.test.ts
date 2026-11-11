/**
 * @jest-environment jsdom
 *
 * LoRA descriptions come from CivitAI as HTML and are shown with
 * dangerouslySetInnerHTML, so saving one must strip anything that can run.
 */
import { Embedding, ModelVersion } from '_types/civitai'
import { handleConvertLora } from './loraUtils'

const version = (description: string) =>
  ({
    id: 2,
    modelId: 1,
    name: 'v1',
    description,
    baseModel: 'SDXL 1.0',
    trainedWords: [],
    files: [{ sizeKB: 1024 }],
    images: []
  }) as unknown as ModelVersion

const lora = { id: 1, name: 'A LoRA', description: '' } as unknown as Embedding

describe('handleConvertLora', () => {
  it('removes scripts and event handlers from the description', () => {
    const { description } = handleConvertLora(
      lora,
      version(
        '<p onclick="steal()">Nice <b>style</b></p>' +
          '<img src="x" onerror="steal()"><script>steal()</script>'
      )
    )

    expect(description).toBe('<p>Nice <b>style</b></p><img src="x">')
  })

  it("uses the LoRA's description when the version has none", () => {
    const { description } = handleConvertLora(
      { ...lora, description: '<i>from the model</i>' } as Embedding,
      version('')
    )

    expect(description).toBe('<i>from the model</i>')
  })
})
