import styled from 'styled-components'

import Panel from '../../UI/Panel'
import SectionTitle from '../../UI/SectionTitle'
import ImageUploadDisplay from '../ImageUploadDisplay'
import SelectComponent from '../../UI/Select'
import Input from '../../UI/Input'
import { useStore } from 'statery'
import { appInfoStore } from '../../../store/appStore'
import Tooltip from '../../UI/Tooltip'
import { Button } from '../../UI/Button'
import TrashIcon from '../../icons/TrashIcon'
import { ModelDetails } from '../../../types'
import React, { useState } from 'react'
import { getImageFromUrl } from '../../../utils/imageUtils'

const Section = styled.div`
  padding-top: 16px;

  &:first-child {
    padding-top: 0;
  }
`

const SubSectionTitle = styled.div`
  padding-bottom: 8px;
`

interface FlexRowProps {
  bottomPadding?: number
}

const FlexRow = styled.div<FlexRowProps>`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  gap: 8px;
  width: 100%;

  ${(props) =>
    props.bottomPadding &&
    `
    padding-bottom: ${props.bottomPadding}px;
  `}
`

interface MaxWidthProps {
  maxWidth?: number
}

const MaxWidth = styled.div<MaxWidthProps>`
  width: 100%;

  ${(props) =>
    props.maxWidth &&
    `
    max-width: ${props.maxWidth}px;
  `}
`

const orientationOptions = [
  { value: 'landscape-16x9', label: 'Landscape (16 x 9)' },
  { value: 'landscape', label: 'Landscape (3 x 2)' },
  { value: 'portrait', label: 'Portrait (2 x 3)' },
  { value: 'phone-bg', label: 'Phone background (9 x 21)' },
  { value: 'ultrawide', label: 'Ultrawide (21 x 9)' },
  { value: 'square', label: 'Square' },
  { value: 'random', label: 'Random!' }
]

const modelerOptions = (models: Array<ModelDetails>) => {
  return models.map((model) => {
    return { value: model.name, label: `${model.name} (${model.count})` }
  })
}

const samplerOptions = (img2img: boolean) => {
  const options = [
    { value: 'k_dpm_2_a', label: 'k_dpm_2_a' },
    { value: 'k_dpm_2', label: 'k_dpm_2' },
    { value: 'k_euler_a', label: 'k_euler_a' },
    { value: 'k_euler', label: 'k_euler' },
    { value: 'k_heun', label: 'k_heun' },
    { value: 'k_lms', label: 'k_lms' },
    { value: 'random', label: 'random' }
  ]

  if (!img2img) {
    options.unshift({ value: 'PLMS', label: 'PLMS' })
    options.unshift({ value: 'DDIM', label: 'DDIM' })
  }

  return options
}

interface Props {
  handleChangeInput: any
  handleImageUpload: any
  handleOrientationSelect: any
  input: any
  setInput: any
}

const AdvancedOptionsPanel = ({
  handleChangeInput,
  handleImageUpload,
  handleOrientationSelect,
  input,
  setInput
}: Props) => {
  const appState = useStore(appInfoStore)
  const { models } = appState

  const [imgUrl, setImgUrl] = useState('')
  const [imgUrlError, setImgUrlError] = useState('')

  const orientationValue = orientationOptions.filter((option) => {
    return input.orientationType === option.value
  })[0]
  // @ts-ignore
  const modelsValue = modelerOptions(models).filter((option) => {
    return input.models[0] === option.value
  })[0]
  const samplerValue = samplerOptions(input.img2img).filter((option) => {
    return input.sampler === option.value
  })[0]

  const handleImportFromUrl = async () => {
    if (!imgUrl) {
      return
    }

    const data = await getImageFromUrl(imgUrl)
    const { success, message, imageType, imgBase64String } = data

    if (!success) {
      setImgUrlError(message || '')
      return
    }

    setImgUrlError('')
    handleImageUpload(imageType, imgBase64String)
  }

  return (
    <Panel>
      <SectionTitle>Advanced options</SectionTitle>
      <div>
        <Section>
          <SubSectionTitle>
            Upload or import and image (img2img)
          </SubSectionTitle>
          <MaxWidth
            // @ts-ignore
            maxWidth="480"
          >
            <FlexRow bottomPadding={8}>
              <span style={{ lineHeight: '40px', marginRight: '16px' }}>
                URL:
              </span>
              <Input
                className="mb-2"
                type="text"
                name="img-url"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setImgUrl(e.target.value)
                }
                value={imgUrl}
                width="100%"
              />
              <Button
                title="Upload image from URL"
                btnType="primary"
                onClick={handleImportFromUrl}
                width="120px"
              >
                Upload
              </Button>
            </FlexRow>
            {imgUrlError && (
              <div className="mb-2 text-red-500 text-sm">{imgUrlError}</div>
            )}
          </MaxWidth>
          <ImageUploadDisplay
            handleUpload={handleImageUpload}
            imageType={input.imageType}
            sourceImage={input.source_image}
            resetImage={() => {
              setInput({
                img2img: false,
                imgType: '',
                source_image: ''
              })
            }}
          />
        </Section>
        <Section>
          <SubSectionTitle>Image orientation</SubSectionTitle>
          <MaxWidth
            // @ts-ignore
            maxWidth="480"
          >
            <SelectComponent
              options={orientationOptions}
              onChange={(obj: { value: string; label: string }) => {
                handleOrientationSelect(obj.value)
                setInput({ orientationType: obj.value })
              }}
              value={orientationValue}
            />
          </MaxWidth>
        </Section>
        <Section>
          <SubSectionTitle>
            Negative prompt
            <Tooltip width="180px">
              Add words or phrases to demphasize from your desired image
            </Tooltip>
          </SubSectionTitle>
          <FlexRow>
            <Input
              // @ts-ignore
              className="mb-2"
              type="text"
              name="negative"
              onChange={handleChangeInput}
              // @ts-ignore
              value={input.negative}
              width="100%"
            />
            <Button
              title="Clear current input"
              btnType="secondary"
              onClick={() => {
                return setInput({
                  negative: ''
                })
              }}
            >
              <TrashIcon />
            </Button>
          </FlexRow>
        </Section>
        <Section>
          <SubSectionTitle>Sampler</SubSectionTitle>
          <MaxWidth
            // @ts-ignore
            maxWidth="240"
          >
            <SelectComponent
              options={samplerOptions(input.img2img)}
              onChange={(obj: { value: string; label: string }) => {
                setInput({ sampler: obj.value })
                localStorage.setItem('sampler', obj.value)
              }}
              value={samplerValue}
            />
          </MaxWidth>
        </Section>
        <Section>
          <SubSectionTitle>
            Steps
            <Tooltip width="200px">
              Fewer steps generally result in quicker image generations. Many
              models achieve full coherence after a certain number of finite
              steps (60 - 90). Keep your initial queries in the 30 - 50 range
              for best results.
            </Tooltip>
          </SubSectionTitle>
          <MaxWidth
            // @ts-ignore
            maxWidth="120"
          >
            <Input
              // @ts-ignore
              className="mb-2"
              type="text"
              name="steps"
              onChange={handleChangeInput}
              // @ts-ignore
              value={input.steps}
              width="100%"
            />
          </MaxWidth>
        </Section>
        <Section>
          <SubSectionTitle>
            Guidance
            <Tooltip width="200px">
              Higher numbers follow the prompt more closely. Lower numbers give
              more creativity.
            </Tooltip>
          </SubSectionTitle>
          <MaxWidth
            // @ts-ignore
            maxWidth="120"
          >
            <Input
              // @ts-ignore
              className="mb-2"
              type="text"
              name="cfg_scale"
              onChange={handleChangeInput}
              // @ts-ignore
              value={input.cfg_scale}
              width="100%"
            />
          </MaxWidth>
        </Section>
        {input.img2img && (
          <Section>
            <SubSectionTitle>Denoise</SubSectionTitle>
            <MaxWidth
              // @ts-ignore
              maxWidth="120"
            >
              <Input
                // @ts-ignore
                className="mb-2"
                type="text"
                name="denoising_strength"
                onChange={handleChangeInput}
                // @ts-ignore
                value={input.denoising_strength}
                width="100%"
              />
            </MaxWidth>
          </Section>
        )}
        <Section>
          <SubSectionTitle>
            Seed
            <Tooltip width="140px">Leave seed blank for random.</Tooltip>
          </SubSectionTitle>
          <MaxWidth
            // @ts-ignore
            maxWidth="240"
          >
            <Input
              // @ts-ignore
              className="mb-2"
              type="text"
              name="seed"
              onChange={handleChangeInput}
              // @ts-ignore
              value={input.seed}
              width="100%"
            />
          </MaxWidth>
        </Section>
        <Section>
          <SubSectionTitle>
            Model
            <Tooltip width="240px">
              Models currently available within the horde. Numbers in
              paranthesis indicate number of works. Generally, these models will
              generate images quicker.
            </Tooltip>
          </SubSectionTitle>
          <MaxWidth
            // @ts-ignore
            maxWidth="240"
          >
            <SelectComponent
              menuPlacement={'top'}
              //@ts-ignore
              options={modelerOptions(models)}
              onChange={(obj: { value: string; label: string }) => {
                setInput({ models: [obj.value] })
              }}
              value={modelsValue}
            />
          </MaxWidth>
        </Section>
        <Section>
          <SubSectionTitle>Number of images</SubSectionTitle>
          <MaxWidth
            // @ts-ignore
            maxWidth="120"
          >
            <Input
              // @ts-ignore
              className="mb-2"
              type="text"
              name="numImages"
              onChange={handleChangeInput}
              // @ts-ignore
              value={input.numImages}
              width="100%"
            />
          </MaxWidth>
        </Section>
      </div>
    </Panel>
  )
}

export default AdvancedOptionsPanel
