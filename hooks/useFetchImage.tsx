import { useCallback, useEffect, useState } from 'react'
import { useDebouncedEffect } from './useDebounce'
import CreateImageRequest from 'models/CreateImageRequest'
import { createImage } from 'api/createImage'
import { checkImageStatus } from 'api/checkImageStatus'
import { getFinishedImage } from 'api/getFinishedImage'
import DefaultPromptInput from 'models/DefaultPromptInput'
import { CheckImage } from 'types'

export const useFetchImage = (input: DefaultPromptInput) => {
  const [jobStatus, setJobStatus] = useState('waiting')
  const [jobId, setJobId] = useState('')
  const [jobDone, setJobDone] = useState(false)
  const [waitTime, setWaitTime] = useState('...')
  const [pending, setPending] = useState(false)
  const [imageResult, setImageResult] = useState('')

  const getImage = useCallback(async () => {
    const data: any = await getFinishedImage(jobId)

    if (data.base64String) {
      setImageResult(data.base64String)
      setPending(false)
      setJobDone(false)
      setJobStatus('waiting')
      setWaitTime('...')
      setJobId('')
    }
  }, [jobId])

  const checkImage = useCallback(async () => {
    if (jobDone || !jobId) {
      return
    }

    const data: CheckImage = await checkImageStatus(jobId)

    if (data.finished === 1) {
      setJobDone(true)
      getImage()
    } else if ((data?.queue_position ?? 0) > 0) {
      setJobStatus('queued')
      // @ts-ignore
      setWaitTime(data.wait_time)
    } else if ((data?.processing ?? 0) === 1) {
      setJobStatus('processing')
      // @ts-ignore
      setWaitTime(data.wait_time)
    }
  }, [getImage, jobDone, jobId])

  useDebouncedEffect(
    async () => {
      if (!input.source_image) {
        return
      }

      if (!pending) {
        // @ts-ignore
        let imageParams = new CreateImageRequest(input)
        setPending(true)

        // @ts-ignore
        const data = (await createImage(imageParams)) || {}

        if (data.jobId) {
          setJobId(data.jobId)
        }
      }
    },
    [input],
    2000
  )

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
