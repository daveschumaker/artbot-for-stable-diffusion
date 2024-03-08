import { JobStatus } from '_types'

export enum JobType {
  TEXT2IMG = 'text2img',
  IMG2IMG = 'img2img',
  CONTROLNET = 'controlnet',
  INPAINTING = 'inpainting',
  UPSCALING = 'upscaling'
}

class HordeJob {
  // Indexed fields
  jobId: string = ''
  timestamp: number = Date.now()
  jobType: JobType = JobType.TEXT2IMG
  jobStatus: JobStatus = JobStatus.Queued
  promptSearch: string = ''

  // TODO: Do I want to add anything here related to image request params?
  prompt: string = ''
  apiResponse?: any = {}

  constructor(params: HordeJob) {
    Object.assign(this, params, {
      prompt: params.prompt.trim() || '',
      promptSearch: params.prompt.toLocaleLowerCase().trim() || ''
    })
  }
}

export { HordeJob }
