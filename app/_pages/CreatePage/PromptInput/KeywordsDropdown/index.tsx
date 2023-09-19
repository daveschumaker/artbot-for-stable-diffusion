import { GetSetPromptInput } from '_types/artbot'
import styles from './component.module.css'
import { useEffect, useRef, useState } from 'react'
import { useStore } from 'statery'
import { modelStore } from 'app/_store/modelStore'
import { IconX } from '@tabler/icons-react'

interface Props extends GetSetPromptInput {
  handleChildSizeChange?: (value: any) => any
}

const removeString = (originalString: string, stringToRemove: string) => {
  const regex = new RegExp(stringToRemove, 'g')
  return originalString.replace(regex, '')
}

export default function KeywordsDropdown({
  input,
  setInput,
  handleChildSizeChange = () => {}
}: Props) {
  const ref = useRef(null)

  const { modelDetails } = useStore(modelStore)
  const [validLoras, setValidLoras] = useState<string[]>([])
  const [loraKeywords, setLoraKeywords] = useState<{
    [key: string]: string[]
  }>({})

  const [validModels, setValidModels] = useState<string[]>([])
  const [modelKeywords, setModelKeywords] = useState<{
    [key: string]: string[]
  }>({})
  const [usedKeywords, setUsedKeywords] = useState<string[]>([])

  const addTagClick = (tag: string) => {
    setInput({ prompt: `${input.prompt}, ${tag}` })
  }

  const removeTag = (tag: string) => {
    const updatedPrompt = removeString(input.prompt, `, ${tag}`)
    setInput({ prompt: updatedPrompt })
  }

  useEffect(() => {
    if (input.models.length >= 1) {
      let foundModels: string[] = []
      let keywords: any = {}
      input.models.forEach((model) => {
        const details = modelDetails[model]
        if (!details) return

        if (details.trigger && details.trigger.length >= 1) {
          foundModels.push(model)
          keywords[model] = [...details.trigger]
        }
      })
      setValidModels(foundModels)
      setModelKeywords(keywords)
    }
  }, [input.models, modelDetails])

  useEffect(() => {
    if (input.loras.length >= 1) {
      let foundLoras: string[] = []
      let keywords: any = {}

      input.loras.forEach((obj: any) => {
        foundLoras.push(obj.label)
        keywords[obj.label] = [...obj.trainedWords]
      })

      setValidLoras(foundLoras)
      setLoraKeywords(keywords)
    }
  }, [input.loras])

  useEffect(() => {
    const matchingTags: string[] = []
    validModels.forEach((model: any) => {
      modelKeywords[model].forEach((tag: string) => {
        if (input.prompt.includes(`, ${tag}`)) {
          matchingTags.push(tag)
        }
      })
    })

    validLoras.forEach((lora: any) => {
      loraKeywords[lora].forEach((tag: string) => {
        if (input.prompt.includes(`, ${tag}`)) {
          matchingTags.push(tag)
        }
      })
    })

    setUsedKeywords(matchingTags)

    if (ref.current) {
      // @ts-ignore
      const { height, width } = ref?.current?.getBoundingClientRect()
      handleChildSizeChange({ height, width })
    }

    // NOTE: adding 'handleChildSizeChange' here causes an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.prompt, loraKeywords, modelKeywords, validLoras, validModels])

  return (
    <div className={styles['style-tags-wrapper']}>
      <div id="content-height-wrapper" ref={ref}>
        {usedKeywords.length > 0 && (
          <div className="mb-2 px-2">
            <h2 className="font-[700] mb-2">Used keywords</h2>
            <div style={{ wordBreak: 'break-all' }}>
              {usedKeywords.map((element) => (
                <div
                  className={styles['tag']}
                  key={element}
                  onClick={() => {
                    removeTag(element)
                  }}
                >
                  <span className="flex flex-row gap-1">
                    <IconX size={18} stroke={1.5} />
                    {element}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {validModels.map((model) => (
          <div
            // @ts-ignore
            key={model}
            className="mb-2 px-2"
          >
            <h2 className="font-[700] mb-2">{model}</h2>
            <div style={{ wordBreak: 'break-all' }}>
              {
                // @ts-ignore
                modelKeywords[model].length >= 1 &&
                  modelKeywords[model].map((element) => (
                    <div
                      className={styles['tag']}
                      key={element}
                      onClick={() => {
                        addTagClick(element)
                      }}
                    >
                      {element}
                    </div>
                  ))
              }
            </div>
          </div>
        ))}
        {validLoras.map((lora) => (
          <div
            // @ts-ignore
            key={lora}
            className="mb-2 px-2"
          >
            <h2 className="font-[700] mb-2">{lora}</h2>
            <div style={{ wordBreak: 'break-all' }}>
              {
                // @ts-ignore
                loraKeywords[lora].length >= 1 &&
                  loraKeywords[lora].map((element) => (
                    <div
                      className={styles['tag']}
                      key={element}
                      onClick={() => {
                        addTagClick(element)
                      }}
                    >
                      {element}
                    </div>
                  ))
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
