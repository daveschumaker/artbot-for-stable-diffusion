import ControlNetOptions from 'components/CreatePage/AdvancedOptionsPanel/ControlNetOptions'
import NumericInputSlider from 'components/CreatePage/AdvancedOptionsPanel/NumericInputSlider'
import Samplers from 'components/CreatePage/AdvancedOptionsPanel/Samplers'
import SelectModel from 'components/CreatePage/AdvancedOptionsPanel/SelectModel/selectModel'
import { Button } from 'components/UI/Button'
import FlexRow from 'components/UI/FlexRow'
import Input from 'components/UI/Input'
import MaxWidth from 'components/UI/MaxWidth'
import Section from 'components/UI/Section'
import SubSectionTitle from 'components/UI/SubSectionTitle'
import TextArea from 'components/UI/TextArea'
import TextTooltipRow from 'components/UI/TextTooltipRow'
import ArrowBarLeftIcon from 'components/icons/ArrowBarLeftIcon'
import GrainIcon from 'components/icons/GrainIcon'
import PlaylistXIcon from 'components/icons/PlaylistXIcon'
import { Tooltip } from 'react-tooltip'
import { useStore } from 'statery'
import { userInfoStore } from 'store/userStore'
import { validModelsArray } from 'utils/modelUtils'
import { maxSteps } from 'utils/validationUtils'

export const LivePaintOptions = ({ input, setInput }: any) => {
  const userState = useStore(userInfoStore)
  const { loggedIn } = userState

  const modelerOptions = (imageParams: any) => {
    return validModelsArray({ imageParams }) || []
  }

  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex flex-row items-center gap-2 text-sm font-bold">
        <PlaylistXIcon hideCross />
        Prompt
      </div>
      <FlexRow>
        <TextArea
          name="prompt"
          placeholder="Describe your image..."
          onChange={(e: any) => {
            setInput({ prompt: e.target.value })
          }}
          value={input.prompt}
        />
        <Button
          title="Clear current input"
          theme="secondary"
          onClick={() => {
            setInput({ prompt: '' })
          }}
        >
          <ArrowBarLeftIcon />
        </Button>
      </FlexRow>
      <div className="flex flex-row items-center gap-2 text-sm font-bold">
        <PlaylistXIcon />
        Negative prompt <span className="font-[400] text-xs">(optional)</span>
      </div>
      <FlexRow>
        <TextArea
          name="prompt"
          placeholder="Words and descriptions to de-emphasize from an image..."
          onChange={(e: any) => {
            setInput({ negative: e.target.value })
          }}
          value={input.negative}
        />
        <Button
          title="Clear current input"
          theme="secondary"
          onClick={() => {
            setInput({ negative: '' })
          }}
        >
          <ArrowBarLeftIcon />
        </Button>
      </FlexRow>
      <FlexRow>
        <Samplers
          input={input}
          setInput={setInput}
          hideShowAllSamplers={true}
        />
      </FlexRow>
      <FlexRow>
        <NumericInputSlider
          label="Steps"
          tooltip="Fewer steps generally result in quicker image generations.
              Many models achieve full coherence after a certain number
              of finite steps (60 - 90). Keep your initial queries in
              the 30 - 50 range for best results."
          from={1}
          to={maxSteps({
            sampler: input.sampler,
            loggedIn: loggedIn === true ? true : false,
            isSlider: true
          })}
          step={1}
          input={input}
          setInput={setInput}
          fieldName="steps"
          fullWidth
          enforceStepValue
        />
      </FlexRow>
      <FlexRow>
        <NumericInputSlider
          label="Guidance"
          tooltip="Higher numbers follow the prompt more closely. Lower
                numbers give more creativity."
          from={1}
          to={30}
          step={0.5}
          input={input}
          setInput={setInput}
          fieldName="cfg_scale"
          fullWidth
        />
      </FlexRow>

      <FlexRow>
        <NumericInputSlider
          label="Denoise"
          tooltip="Amount of noise added to input image. Values that
                  approach 1.0 allow for lots of variations but will
                  also produce images that are not semantically
                  consistent with the input. Only available for img2img."
          from={0.0}
          to={1.0}
          step={0.05}
          input={input}
          setInput={setInput}
          fieldName="denoising_strength"
          disabled={
            input.models &&
            input.models[0] &&
            input.models[0].indexOf('_inpainting') >= 0
          }
        />
      </FlexRow>

      <FlexRow>
        <ControlNetOptions
          forceDisplay
          hideControlMap
          input={input}
          setInput={setInput}
        />
      </FlexRow>

      <FlexRow>
        <Section>
          <SubSectionTitle>
            <TextTooltipRow>
              Seed
              <Tooltip
                // @ts-expect-error
                tooltipId="seed-tooltip"
              >
                Leave seed blank for random.
              </Tooltip>
            </TextTooltipRow>
          </SubSectionTitle>
          <MaxWidth
            // @ts-ignore
            maxWidth="240"
          >
            <div className="flex flex-row gap-2">
              <Input
                // @ts-ignore
                className="mb-2"
                type="text"
                name="seed"
                onChange={(e: any) => {
                  setInput({ seed: e.target.value })
                }}
                // @ts-ignore
                value={input.seed}
                width="100%"
              />
              <Button
                title="Insert random seed"
                onClick={() => {
                  const value = Math.abs((Math.random() * 2 ** 32) | 0)
                  setInput({ seed: value })
                }}
              >
                <GrainIcon />
              </Button>
              <Button
                theme="secondary"
                title="Clear"
                onClick={() => {
                  setInput({ seed: '' })
                }}
              >
                <ArrowBarLeftIcon />
              </Button>
            </div>
          </MaxWidth>
        </Section>
      </FlexRow>

      <FlexRow>
        <SelectModel
          input={input}
          modelerOptions={modelerOptions}
          setInput={setInput}
        />
      </FlexRow>

      <FlexRow>
        <NumericInputSlider
          label="CLIP skip"
          tooltip="Determine how early to stop processing a prompt using CLIP. Higher
          values stop processing earlier. Default is 1 (no skip)."
          from={1}
          to={12}
          step={1}
          input={input}
          setInput={setInput}
          fieldName="clipskip"
          enforceStepValue
        />
      </FlexRow>
    </div>
  )
}
