import { db } from './dexie'

interface SettingId {
  [key: string]: number
}

const settingsId: SettingId = {}

export const getSettingFromDexie = async (name: string) => {
  return (await db?.settings?.where({ name }).limit(1)?.toArray()) || []
}

export const updateSetting = async (name: string, updatedObject: any) => {
  if (!settingsId[name]) {
    const res = await getSettingFromDexie(name)
    const [settingObject = {}] = res
    settingsId[name] = settingObject.id
  }

  if (typeof settingsId[name] === 'undefined') {
    const id = await db.settings.add({
      name,
      setting: updatedObject
    })
    settingsId[name] = id
  } else if (settingsId[name]) {
    await db.settings.update(settingsId[name], updatedObject)
  }
}
