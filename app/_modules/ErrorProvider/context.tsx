'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useInput } from '../InputProvider/context'
import { MAX_IMAGE_PIXELS } from '_constants'
import {
  promptSafetyExclusions,
  validatePromptSafety
} from 'app/_utils/validationUtils'
import { modelStore } from 'app/_store/modelStore'
import { useStore } from 'statery'
import AppSettings from 'app/_data-models/AppSettings'
import { countImagesToGenerate } from 'app/_utils/imageUtils'

interface InputErrors {
  fixedSeed?: string
  flaggedPrompt?: string
  inpaintingNoSource?: string
  maxPixels?: string
  promptReplacementLength?: string
  sdxlControlNet?: string
  sdxlHires?: string
  sdxlInpainting?: string
  sdxlMinDimensions?: string
}

type InputError = {
  [key: string]: string
}

type InputErrorsContextType = {
  blockJobs: boolean
  inputErrors: InputError | boolean
  setInputErrors: React.Dispatch<any>
}

interface InputErrorsProviderProps {
  children: React.ReactNode
}

const defaultInputErrorsContext: InputErrorsContextType = {
  blockJobs: false,
  inputErrors: {} as InputError,
  setInputErrors: () => {}
}

const InputErrorsContext = createContext<InputErrorsContextType>(
  defaultInputErrorsContext
)

export const useInputErrors = () => {
  return useContext(InputErrorsContext)
}

export const InputErrorsProvider: React.FC<InputErrorsProviderProps> = ({
  children
}) => {
  const { input } = useInput()
  const { modelDetails } = useStore(modelStore)

  const [blockJobs, setBlockJobs] = useState(false)
  const [inputErrors, setInputErrors] = useState({})

  useEffect(() => {
    let updateBlockJobs = false
    const updateErrors = {} as InputErrors

    const pixels = input.height * input.width
    if (pixels > MAX_IMAGE_PIXELS) {
      updateBlockJobs = true
      updateErrors.maxPixels = `Resolution error: Please adjust image resolution before submitting this request. ${
        input.width
      }w x ${
        input.height
      }h (${pixels.toLocaleString()} px) is more than the max supported value: ${MAX_IMAGE_PIXELS.toLocaleString()} px`
    }

    const filteredSdxlModels = input.models.filter((model) =>
      model.toLowerCase().includes('sdxl')
    )
    const hasSdxl = filteredSdxlModels.length > 0

    if (hasSdxl) {
      if (input.hires) {
        updateBlockJobs = true
        updateErrors.sdxlHires =
          'SDXL Error: Currently unable to use hi-res fix with SDXL image models. Please disable hi-res fix in order to continue.'
      }

      if (input.control_type && input.source_image) {
        updateBlockJobs = true
        updateErrors.sdxlControlNet =
          'SDXL Error: Currently unable to use ControlNet with SDXL image models. Please disable ControlNet in order to continue.'
      }

      if (input.source_mask) {
        updateBlockJobs = true
        updateErrors.sdxlInpainting =
          'SDXL Error: Currently unable to use inpainting with SDXL image models. Please remove the inpainting mask in order to continue.'
      }

      if (input.width < 1024 && input.height < 1024) {
        updateBlockJobs = true
        updateErrors.sdxlMinDimensions = `SDXL Error: Please adjust image resolution so that one side is at least 1024 px. Current size: ${input.width}w x ${input.height}`
      }
    }

    const modifiedPrompt = promptSafetyExclusions(input.prompt, input.models[0])
    const promptFlagged = validatePromptSafety(modifiedPrompt)
    const hasNsfwModel =
      input?.models?.filter((model: string) => {
        if (!model) {
          return false
        }

        return modelDetails[model] && modelDetails[model].nsfw === true
      }) || []

    const promptReplacement =
      AppSettings.get('useReplacementFilter') !== false &&
      input.prompt.length < 1000

    if (!promptReplacement && promptFlagged && hasNsfwModel.length > 0) {
      updateErrors.flaggedPrompt = `You are about to send a prompt that likely violates the AI Horde terms of use and may be rejected by the API. Please edit your prompt, choose a non-NSFW model, or enable the prompt replacement filter and try again. You can still submit this request, but it may fail.`
    }

    if (input.prompt.length >= 1000 && promptReplacement) {
      updateErrors.promptReplacementLength =
        'Prompt length: Your prompt is longer than 1,000 characters. Please disable the prompt replacement filter in order to use this prompt.'
    }

    const totalImagesRequested = countImagesToGenerate(input)
    if (Boolean(totalImagesRequested > 1 && input.seed)) {
      updateErrors.fixedSeed = `Fixed seed: You are using a fixed seed with multiple images. If this is intended, ignore this warning. (You can still continue).`
    }

    const hasInpaintingModels = input.models.filter(
      (model: string = '') => model && model.indexOf('_inpainting') >= 0
    ).length
    const hasSourceMask = input.source_mask

    if (hasInpaintingModels > 0 && !hasSourceMask) {
      updateBlockJobs = true
      updateErrors.inpaintingNoSource = `You've selected inpainting model, but did not provide source image and/or mask. Please upload an image and add paint an area you'd like to change, or change your model to non-inpainting one.`
    }

    setInputErrors(updateErrors)
    setBlockJobs(updateBlockJobs)
  }, [input, modelDetails])

  console.log(`XYZ?`, inputErrors)

  return (
    <InputErrorsContext.Provider
      value={{
        blockJobs,
        inputErrors:
          Object.keys(inputErrors).length === 0 ? false : inputErrors,
        setInputErrors
      }}
    >
      {children}
    </InputErrorsContext.Provider>
  )
}
