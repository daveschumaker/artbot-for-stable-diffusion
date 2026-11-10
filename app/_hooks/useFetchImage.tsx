import { useCallback, useEffect, useState } from 'react'
import { useDebouncedEffect } from './useDebounce'
import CreateImageRequest from 'app/_data-models/CreateImageRequest'
import { createImage } from 'app/_api/createImage'
import { checkImageStatus } from 'app/_api/checkImageStatus'
import { getFinishedImage } from 'app/_api/getFinishedImage'
import DefaultPromptInput from 'app/_data-models/DefaultPromptInput'
import { IArtBotImageDetails } from 'app/_data-models/ImageParamsForApi'
import { CheckImage } from '_types'

export const useFetchImage = (input: DefaultPromptInput) => {
  const [jobStatus, setJobStatus] = useState('requesting')
  const [jobId, setJobId] = useState('')
  const [jobDone, setJobDone] = useState(false)
  const [waitTime, setWaitTime] = useState<string | number | undefined>('...')
  const [pending, setPending] = useState(false)
  const [imageResult, setImageResult] = useState('')

  const getImage = useCallback(async () => {
    const data: any = (await getFinishedImage(jobId)) || {}
    const { generations = [] } = data
    const [image = {}] = generations

    if (image.base64String) {
      setImageResult(image.base64String)
      setPending(false)
      setJobDone(false)
      setJobStatus('requesting')
      setWaitTime('...')
      setJobId('')
    }
  }, [jobId])

  const checkImage = useCallback(async () => {
    if (jobDone || !jobId) {
      return
    }

    const data: CheckImage = await checkImageStatus(jobId)

    if (data.status === 'NOT_FOUND') {
      setJobStatus('error')
      setJobDone(true)
      setPending(false)
    } else if (data.finished === 1) {
      setJobDone(true)
      getImage()
    } else if ((data?.queue_position ?? 0) > 0) {
      setJobStatus('queued')
      setWaitTime(data.wait_time)
    } else if ((data?.processing ?? 0) === 1) {
      setJobStatus('processing')
      setWaitTime(data.wait_time)
    }
  }, [getImage, jobDone, jobId])

  const newImageRequest = useCallback(async () => {
    if (!input.source_image || !input.prompt) {
      return
    }

    if (!pending) {
      let imageParams = new CreateImageRequest(input)
      setPending(true)

      // CreateImageRequest has no stylePreset, which ImageParamsForApi
      // defaults to 'none'. IArtBotImageDetails marks it as required, so
      // a direct cast is rejected. Making it optional there removes the cast.
      const data =
        (await createImage(imageParams as unknown as IArtBotImageDetails)) || {}

      if (!data.success) {
        console.log(`Error: Unable to complete this image request.`)
        setPending(false)
        return
      }

      if (data.jobId) {
        setJobId(data.jobId)
      }
    }
  }, [input, pending])

  useDebouncedEffect(newImageRequest, [input], 1500)

  useEffect(() => {
    let interval: any
    if (pending) {
      interval = setInterval(() => {
        checkImage()
      }, 1500)
    } else if (!pending && interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [checkImage, pending, waitTime])

  return [imageResult, pending, jobStatus, waitTime]
}
