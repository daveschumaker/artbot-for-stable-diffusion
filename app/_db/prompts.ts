import { setUnsupportedBrowser } from 'app/_store/appStore'
import { db } from './dexie'
import { PromptHistoryDetails, PromptTypes } from '_types/artbot'

export const deletePromptFromHistory = async (id: number) => {
  await db.prompts.bulkDelete([id])
}

export const getDefaultPrompt = async () => {
  try {
    return (
      (await db?.prompts
        ?.where({ promptType: 'default' })
        .limit(1)
        ?.toArray()) || []
    )
  } catch (err: any) {
    if (
      err.message.indexOf(
        'A mutation operation was attempted on a database that did not allow mutations'
      ) >= 0
    ) {
      setUnsupportedBrowser(true)
    }
    return []
  }
}

export const getPrompts = async ({
  promptType,
  promptType2
}: {
  promptType: string
  promptType2?: string
}) => {
  return (
    (await db?.prompts
      ?.orderBy('id')
      ?.filter(function (prompt: { promptType: string }) {
        if (promptType2 && prompt.promptType === promptType2) {
          return true
        }

        return prompt.promptType === promptType
      })
      ?.reverse()
      ?.toArray()) || []
  )
}

export const saveNegativePrompt = async (prompt: string) => {
  if (prompt) {
    await db.prompts.add({
      prompt,
      promptType: PromptTypes.Negative,
      timestamp: Date.now()
    })
  }
}

export const updatePrompt = async (
  id: number,
  updateObject: Partial<PromptHistoryDetails>
) => {
  await db.prompts.update(id, {
    ...updateObject
  })
}
