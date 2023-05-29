import { useState } from 'react'

export let loraCache: Array<any> | null = null

const useLoraCache = () => {
  const [lorasArray, setLorasArray] = useState<any>([])
  const [lorasDetails, setLorasDetails] = useState<any>({})

  const fetchLoras = async () => {
    let loraObj: any = {}
    if (loraCache !== null) {
      setLorasArray(loraCache)

      loraCache.forEach((lora: any) => {
        loraObj[lora.id] = { ...lora }
      })

      setLorasDetails(loraObj)
      return
    }

    const res = await fetch('/artbot/api/get-lora-models')
    const json = await res.json()

    const { data } = json

    if (data) {
      loraCache = [...data]
      setLorasArray(data)

      data.forEach((lora: any) => {
        loraObj[lora.id] = { ...lora }
      })

      setLorasDetails(loraObj)
    }
  }

  return [fetchLoras, lorasArray, lorasDetails]
}

export default useLoraCache
