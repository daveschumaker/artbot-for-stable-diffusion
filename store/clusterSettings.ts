export interface IClusterSettings {
  forceReloadOnServerUpdate: boolean
  serverMessage?: {
    title: string
    content: string
    type: string
  }
}

export const clusterSettings: IClusterSettings = {
  forceReloadOnServerUpdate: true
}
