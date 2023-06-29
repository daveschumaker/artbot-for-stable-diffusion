'use client'

import { useEffect } from 'react'
import fetchImageModels from './fetchImageModels'

export default function AppInit() {
  useEffect(() => {
    fetchImageModels()
  }, [])
  return null
}
