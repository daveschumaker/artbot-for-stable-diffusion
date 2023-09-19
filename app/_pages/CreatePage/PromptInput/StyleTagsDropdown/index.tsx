import { GetSetPromptInput } from '_types/artbot'
import tags from './tags'
import styles from './component.module.css'
import { useEffect, useState } from 'react'
import { IconX } from '@tabler/icons-react'

const removeString = (originalString: string, stringToRemove: string) => {
  const regex = new RegExp(stringToRemove, 'g')
  return originalString.replace(regex, '')
}

export default function StyleTagsDropdown({
  input,
  setInput
}: GetSetPromptInput) {
  const [usedTags, setUsedTags] = useState<string[]>([])

  const addTagClick = (tag: string) => {
    setInput({ prompt: `${input.prompt}, ${tag}` })
  }

  const removeTag = (tag: string) => {
    const updatedPrompt = removeString(input.prompt, `, ${tag}`)
    setInput({ prompt: updatedPrompt })
  }

  useEffect(() => {
    const matchingTags: string[] = []
    tags.forEach((category: any) => {
      const [, categoryTags] = category
      categoryTags.forEach((tag: string) => {
        if (input.prompt.includes(`, ${tag}`)) {
          matchingTags.push(tag)
        }
      })
    })

    setUsedTags(matchingTags)
  }, [input.prompt])

  return (
    <div className={styles['style-tags-wrapper']}>
      {usedTags.length > 0 && (
        <div className="mb-2 px-2">
          <h2 className="font-[700] mb-2">Used tags</h2>
          <div style={{ wordBreak: 'break-all' }}>
            {usedTags.map((element) => (
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
      {tags.map(([section, elements]) => (
        <div
          // @ts-ignore
          key={section}
          className="mb-2 px-2"
        >
          <h2 className="font-[700] mb-2">{section}</h2>
          <div style={{ wordBreak: 'break-all' }}>
            {
              // @ts-ignore
              elements.map((element) => (
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
  )
}
