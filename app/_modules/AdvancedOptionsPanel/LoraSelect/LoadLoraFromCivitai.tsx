/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import * as DOMPurify from 'dompurify'
import { useState } from 'react'

import Input from 'components/UI/Input'
import { Button } from 'app/_components/Button'
import Linker from 'app/_components/Linker'
import styles from './loraSelect.module.css'
import LoraDetails from './LoraDetails'
import { basePath } from 'BASE_PATH'
import FlexRow from 'app/_components/FlexRow'
import { IconAlertTriangle, IconArrowBarLeft } from '@tabler/icons-react'

const extractModelNumber = (url: string) => {
  const regex = /\/models\/(\d+)/
  const match = url.match(regex)
  if (match && match.length > 1) {
    return match[1]
  }
  return null // Return null if no model number is found
}

// TODO: Dynamic import
// https://raw.githubusercontent.com/Haidra-Org/AI-Horde-image-model-reference/main/lora.json
const curatedLoras = [
  48139, 25995, 16014, 51686, 51145, 44960, 60724, 47085, 7016, 20830, 14605,
  53493, 55543, 5529, 4982, 42260, 10679, 48356, 62700, 39760, 24150, 43229,
  77121, 22462, 26580, 58410, 15246, 54798, 45892, 60132, 59338, 38414, 31988,
  57933, 49374, 23433, 45713, 43944, 46994, 47489, 56336, 13910, 73756, 13941,
  82098, 58390
]

const LoadLora = ({
  cacheLoaded = (lora: any) => lora,
  tempCache = null,
  handleAddLora = (lora: any) => lora,
  handleClose = () => {},
  handleSaveRecent = (lora: any) => lora
}) => {
  const [errorMsg, setErrorMsg] = useState('')
  const [loraId, setLoraId] = useState('')
  const [loraDetails, setLoraDetails] = useState<any>(tempCache)

  const loadLoraFromCivitai = async () => {
    try {
      // @ts-ignore
      if (!loraId) {
        return
      }

      setErrorMsg('')

      // @ts-ignore
      let validLoraId = !isNaN(loraId) ? loraId : null

      // @ts-ignore
      if (isNaN(loraId) && extractModelNumber(loraId)) {
        validLoraId = extractModelNumber(loraId)
      }

      if (!validLoraId) {
        setErrorMsg('Unable to load: Check LORA ID or URL and try again.')
        return
      }

      if (loraDetails && loraDetails.id === validLoraId) {
        return
      }

      const res = await fetch(
        `https://civitai.com/api/v1/models/${validLoraId}`
      )
      const data = await res.json()

      if (data.type !== 'LORA' && data.type !== 'LoCon') {
        setErrorMsg('Unable to load: Not a valid LORA.')
        return
      }

      const { modelVersions = [] } = data
      const { files = [], images = [] } = modelVersions[0]

      if (
        files[0]?.sizeKB &&
        files[0]?.sizeKB > 220000 &&
        !curatedLoras.includes(data.id)
      ) {
        setErrorMsg('Unable to load: LORA size is over 220MB.')
        return
      }

      const lora = {
        name: data.id,
        label: data.name,
        description: DOMPurify.sanitize(data.description || ''),
        baseModel: modelVersions[0].baseModel,
        trainedWords: modelVersions[0].trainedWords,
        image: images[0] && images[0].url ? images[0].url : '',
        sizeKb: files[0].sizeKB
      }

      setLoraDetails({
        ...lora
      })
      cacheLoaded({ ...lora })
    } catch (err) {
      console.log(`An error occurred...`)
      console.log(err)
    }
  }

  return (
    <div className={styles['filter-preset']}>
      <div
        style={{
          columnGap: '8px',
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        <Input
          className="mb-2"
          type="text"
          name="filterLoras"
          placeholder="Civitai LoRA ID or URL"
          inputMode="numeric"
          onChange={(e: any) => {
            setLoraId(e.target.value)
          }}
          value={loraId}
          width="100%"
        />
        <Button
          onClick={() => {
            setLoraId('')
          }}
          theme="secondary"
        >
          <IconArrowBarLeft />
        </Button>
        <Button
          style={{
            width: '100px'
          }}
          onClick={loadLoraFromCivitai}
        >
          Search
        </Button>
      </div>
      {errorMsg && (
        <FlexRow gap={4} pb={8} style={{ color: 'red' }}>
          <IconAlertTriangle stroke={1.5} />
          {errorMsg}
        </FlexRow>
      )}
      {!loraDetails && (
        <div className="mt-2">
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>
            Use nearly any LoRA found on{' '}
            <Linker
              href="https://civitai.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Civitai
            </Linker>
            ! Visit Civitai&apos;s and use their search tools to find the
            perfect LoRA, copy the model ID or Civitai URL and paste it into the
            search box here.
          </div>
          <div>
            <img
              src={`${basePath}/civitai-modelid.png`}
              style={{ maxWidth: '480px', width: '100%' }}
            />
          </div>
        </div>
      )}
      {loraDetails && (
        <div
          style={{
            height: '230px',
            overflow: 'scroll',
            position: 'relative'
          }}
        >
          <LoraDetails
            loraDetails={loraDetails}
            handleAddLora={handleAddLora}
            handleClose={handleClose}
            handleSaveRecent={handleSaveRecent}
          />
        </div>
      )}
    </div>
  )
}

export default LoadLora
