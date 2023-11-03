import { db } from './dexie'

interface SettingId {
  [key: string]: number
}

export enum SettingName {
  PromptInput = 'promptInput'
}

const settingsId: SettingId = {}

export const getSettingFromDexie = async (name: SettingName) => {
  const arr = (await db?.settings?.where({ name }).limit(1).toArray()) || []

  if (arr[0]) {
    return arr[0]
  } else {
    return {}
  }
}

export const updateSetting = async (name: SettingName, updatedObject: any) => {
  const updated = {
    name,
    setting: updatedObject
  }

  if (!settingsId[name]) {
    const res = await getSettingFromDexie(name)
    settingsId[name] = res.id
  }

  if (typeof settingsId[name] === 'undefined') {
    const id = await db.settings.add(updated)
    settingsId[name] = id
  } else if (settingsId[name]) {
    await db.settings.update(settingsId[name], updated)
  }
}
