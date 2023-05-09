import { IconBoxMargin, IconSend } from '@tabler/icons-react'
import SpinnerV2 from 'components/Spinner'
import { Button } from 'components/UI/Button'
import Select from 'components/UI/Select'
import BasePromptTextArea from 'modules/BasePromptTextArea'
import { useCallback, useEffect, useState } from 'react'
import {
  checkTextJobStatus,
  createTextJob,
  fetchTextModels
} from './controller'

interface TextModel {
  name: string
  count: number
  eta: number
}

const ChatPageComponent = () => {
  const [activeModel, setActiveModel] = useState('')
  const [prompt, setPrompt] = useState('')
  const [textModels, setTextModels] = useState([])
  const [output, setOutput] = useState<Array<string>>([])

  const [jobId, setJobId] = useState('')
  const [jobPending, setJobPending] = useState(false)
  const [jobEta, setJobEta] = useState(0)

  const modelOptions = () => {
    return textModels.map((model: TextModel) => {
      return {
        value: model.name,
        label: `${model.name} - (ETA: ${model.eta}s / Workers: ${model.count})`
      }
    })
  }

  const initLoadModels = async () => {
    const data = await fetchTextModels()
    setTextModels(data)
  }

  const handleSendClick = useCallback(async () => {
    let promptForApi
    const updateOutput = [...output]

    if (prompt) {
      updateOutput.push(prompt)
      setOutput(updateOutput)
    }

    if (output.length > 0) {
      promptForApi = updateOutput.join(' ')
      promptForApi = promptForApi.slice(-6000)
    } else {
      return
    }

    const payload = {
      models: [activeModel],
      prompt: promptForApi,
      params: {
        n: 1,
        max_context_length: 1024,
        max_length: 80,
        rep_pen: 1.08,
        temperature: 0.62,
        top_p: 0.9,
        top_k: 0,
        top_a: 0,
        typical: 1,
        tfs: 1,
        rep_pen_range: 1024,
        rep_pen_slope: 0.7,
        sampler_order: [0, 1, 2, 3, 4, 5, 6]
      },
      workers: []
    }

    const jobDetails = await createTextJob(payload)

    if (jobDetails.id) {
      setJobId(jobDetails.id)
      setJobPending(true)
      setPrompt('')
    }
    // console.log(`jobDetails`, jobDetails)
    // setOutput(output + ' ' + prompt)
  }, [activeModel, output, prompt])

  useEffect(() => {
    if (!jobId) {
      return
    }

    const checkJobStatus = async () => {
      // Replace this with your API call to check the job status
      const status = await checkTextJobStatus(jobId)
      console.log(`status?`, status)

      if (status.wait_time) {
        setJobEta(status.wait_time)
      }

      if (status.finished === 1) {
        setJobPending(false)
        setJobId('')

        const updateOutput = [...output]
        updateOutput.push(status.generations[0].text)
        setOutput(updateOutput)
      }
    }

    const intervalId = setInterval(async () => {
      await checkJobStatus()
    }, 2500) // Check every 5 seconds

    if (jobPending === false) {
      clearInterval(intervalId)
    }

    return () => {
      clearInterval(intervalId)
    }
  }, [jobId, jobPending, output])

  useEffect(() => {
    initLoadModels()
  }, [])

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
      <div className="flex grow flex-col">
        {output.length === 0 && <div>Hey, enter something below!</div>}
        {output.length > 0 &&
          output.map((text, i) => {
            return (
              <div key={`text_${i}`} className="mb-2">
                {text}
              </div>
            )
          })}
        {jobPending && (
          <div className="flex flex-row gap-2 items-center">
            <SpinnerV2 size={20} />
            processing...
            {jobEta > 0 && <div>(ETA: ~{jobEta}s)</div>}
          </div>
        )}
      </div>
      <div
        className="flex flex-col w-full gap-2 rounded"
        style={{
          color: '#ffffff',
          backgroundColor: 'var(--accent-color)',
          padding: '8px 12px',
          marginBottom: '16px'
        }}
      >
        <BasePromptTextArea
          handleChangeValue={(e: any) => setPrompt(e.target.value)}
          handleClear={() => setPrompt('')}
          placeholder="Enter your initial prompt here..."
          optionalButton={
            <Button onClick={handleSendClick} size="small">
              <IconSend stroke={1.5} />
            </Button>
          }
          value={prompt}
        />

        <div className="flex flex-row gap-2 items-center">
          <IconBoxMargin stroke={1.5} />
          Model:
          <Select
            menuPlacement="top"
            onChange={(obj: { value: string; label: string }) => {
              setActiveModel(obj.value)
            }}
            options={modelOptions()}
          />
        </div>
      </div>
    </div>
  )
}

export default ChatPageComponent
