/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import * as DOMPurify from 'dompurify'
import { useState } from 'react'

import Input from 'components/UI/Input'
import { Button } from 'components/UI/Button'
import Linker from 'components/UI/Linker'
import styles from './loraSelect.module.css'
import LoraDetails from './LoraDetails'

const extractModelNumber = (url: string) => {
  const regex = /\/models\/(\d+)/
  const match = url.match(regex)
  if (match && match.length > 1) {
    return match[1]
  }
  return null // Return null if no model number is found
}

const LoadLora = ({
  cacheLoaded = (lora: any) => lora,
  tempCache = null,
  handleAddLora = (lora: any) => lora,
  handleClose = () => {},
  handleSaveRecent = (lora: any) => lora
}) => {
  const [loraId, setLoraId] = useState('')
  const [loraDetails, setLoraDetails] = useState<any>(tempCache)

  const loadLoraFromCivitai = async () => {
    try {
      // @ts-ignore
      if (!loraId) {
        return
      }

      // @ts-ignore
      let validLoraId = !isNaN(loraId) ? loraId : null

      // @ts-ignore
      if (isNaN(loraId) && extractModelNumber(loraId)) {
        validLoraId = extractModelNumber(loraId)
      }

      if (!validLoraId) {
        return
      }

      if (loraDetails && loraDetails.id === validLoraId) {
        return
      }

      const res = await fetch(
        `https://civitai.com/api/v1/models/${validLoraId}`
      )
      const data = await res.json()

      if (data.type !== 'LORA') {
        return
      }

      const { modelVersions = [] } = data
      const { images = [] } = modelVersions[0]

      const lora = {
        name: data.id,
        label: data.name,
        description: DOMPurify.sanitize(data.description || ''),
        baseModel: modelVersions[0].baseModel,
        trainedWords: modelVersions[0].trainedWords,
        image: images[0].url
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
          style={{
            width: '100px'
          }}
          onClick={loadLoraFromCivitai}
        >
          Search
        </Button>
      </div>
      {!loraDetails && (
        <div className="mt-2">
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>
            Use any LoRA found on{' '}
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
            <img src="/artbot/civitai-modelid.png" style={{ width: '100%' }} />
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
