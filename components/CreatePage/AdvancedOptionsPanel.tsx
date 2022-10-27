import styled from 'styled-components'

import Panel from '../Panel'
import SectionTitle from '../SectionTitle'
import ImageUploadDisplay from './ImageUploadDisplay'
import SelectComponent from '../Select'
import Input from '../Input'
import { useStore } from 'statery'
import { appInfoStore } from '../../store/appStore'
import Tooltip from '../Tooltip'
import { Button } from '../Button'
import TrashIcon from '../icons/TrashIcon'

const Section = styled.div`
  padding-top: 16px;

  &:first-child {
    padding-top: 0;
  }
`

const SubSectionTitle = styled.div`
  padding-bottom: 8px;
`

const FlexRow = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  gap: 8px;
  width: 100%;
`

const MaxWidth = styled.div`
  max-width: ${(props) => props.maxWidth}px;
  width: 100%;
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

const modelerOptions = (models) => {
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

  if (img2img) {
    options.unshift({ value: 'PLMS', label: 'PLMS' })
    options.unshift({ value: 'DDIM', label: 'DDIM' })
  }

  return options
}

const AdvancedOptionsPanel = ({
  handleChangeInput,
  handleImageUpload,
  handleOrientationSelect,
  input,
  setInput
}) => {
  const appState = useStore(appInfoStore)
  const { models } = appState
  const orientationValue = orientationOptions.filter((option) => {
    return input.orientationType === option.value
  })[0]
  const modelsValue = modelerOptions(models).filter((option) => {
    return input.models[0] === option.value
  })[0]
  const samplerValue = samplerOptions(input.img2img).filter((option) => {
    return input.sampler === option.value
  })[0]

  return (
    <Panel>
      <SectionTitle>Advanced options</SectionTitle>
      <div>
        <Section>
          <SubSectionTitle>
            Upload or import and image (img2img)
          </SubSectionTitle>
          <MaxWidth maxWidth="480">
            <FlexRow>
              <span style={{ lineHeight: '40px', marginRight: '16px' }}>
                URL:
              </span>
              <Input
                // @ts-ignore
                className="mb-2"
                type="text"
                name="img-url"
                // onChange={handleChangeInput}
                // @ts-ignore
                // value={input.negative}
                width="100%"
              />
              <Button
                title="Upload image from URL"
                btnType="primary"
                onClick={() => {
                  // return setInput({
                  //   negative: ''
                  // })
                }}
                width="120px"
              >
                Upload
              </Button>
            </FlexRow>
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
          <MaxWidth maxWidth="480">
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
          <MaxWidth maxWidth="240">
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
          <SubSectionTitle>Steps</SubSectionTitle>
          <MaxWidth maxWidth="120">
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
          <MaxWidth maxWidth="120">
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
            <MaxWidth maxWidth="120">
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
          <MaxWidth maxWidth="240">
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
          <MaxWidth maxWidth="240">
            <SelectComponent
              menuPlacement={'top'}
              options={modelerOptions(models)}
              onChange={(obj: { value: string; label: string }) => {
                setInput({ models: [obj.value] })
                // TODO: Fix me
                // localStorage.setItem('sampler', obj.value)
              }}
              value={modelsValue}
            />
          </MaxWidth>
        </Section>
        <Section>
          <SubSectionTitle>Number of images</SubSectionTitle>
          <MaxWidth maxWidth="120">
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
