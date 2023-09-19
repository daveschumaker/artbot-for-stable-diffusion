export interface IStableDiffusionModel {
  name: string
  count: number
  eta?: number
  queued?: number
}

class StableDiffusionModel {
  name: string
  count: number
  eta: number
  queued: number

  constructor({
    name = '',
    count = 0,
    eta = 0,
    queued = 0
  }: IStableDiffusionModel) {
    this.name = String(name)
    this.count = Number(count)
    this.eta = Number(eta)
    this.queued = Number(queued)
  }
}

export default StableDiffusionModel
