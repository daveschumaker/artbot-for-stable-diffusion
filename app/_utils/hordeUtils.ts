import AppSettings from 'app/_data-models/AppSettings'
import { setLoggedInState } from 'app/_store/userStore'
import { AiHordeEmbedding } from '_types/artbot'
import { TextualInversion } from '_types/horde'
import { fetchUserDetailsV2 } from 'app/_api/fetchUserDetailsV2'

export const handleApiKeyLogin = async (apikey: string) => {
  if (!apikey) {
    return { success: false }
  }
  try {
    const data = await fetchUserDetailsV2(apikey)

    if (data && data.username) {
      AppSettings.save('apiKey', apikey)
      setLoggedInState(true)
      return { success: true }
    }

    return { success: false }
  } catch (e) {
    console.log(`Unable to load API key`, e)
    return { success: false }
  }
}

export const castTiInject = (
  tis: AiHordeEmbedding[] | TextualInversion[]
): TextualInversion[] => {
  let updatedTis: TextualInversion[] = []
  if (tis && Array.isArray(tis) && tis.length > 0) {
    updatedTis = tis.map((ti) => {
      const obj: TextualInversion = {
        name: String(ti.name)
      }

      if (ti.inject_ti) {
        obj.inject_ti = ti.inject_ti
      }

      if (ti.strength) {
        obj.strength = ti.strength
      }

      return obj
    })
  }

  return updatedTis
}
