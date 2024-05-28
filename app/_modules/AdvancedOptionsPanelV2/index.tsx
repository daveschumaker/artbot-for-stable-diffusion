import ClipSkip from '../AdvancedOptionsPanel/ClipSkip'
import EmbeddingsSelect from '../AdvancedOptionsPanel/EmbeddingsSelect'
import FlexibleRow from 'app/_components/FlexibleRow'
import FlexibleUnit from 'app/_components/FlexibleUnit'
import Guidance from '../AdvancedOptionsPanel/Guidance'
import ImageCount from '../AdvancedOptionsPanel/ImageCount'
import ImageOrientationOptions from '../AdvancedOptionsPanel/ImageOrientationOptions'
import LoraSelect from '../AdvancedOptionsPanel/LoraSelect'
import MiscOptions from '../AdvancedOptionsPanel/MiscOptions'
import PostProcessors from '../AdvancedOptionsPanel/PostProcessors'
import Seed from '../AdvancedOptionsPanel/Seed'
import SelectModel from '../AdvancedOptionsPanel/SelectModel'
import SelectSampler from '../AdvancedOptionsPanel/SelectSampler'
import Steps from '../AdvancedOptionsPanel/Steps'
import styles from './advancedOptionsPanel.module.css'
import UpscalerOptions from '../AdvancedOptionsPanel/UpscalerOptions'
import { useInput } from '../InputProvider/context'
import ControlNetOptions from '../AdvancedOptionsPanel/ControlNetOptions'
import Denoise from '../AdvancedOptionsPanel/Denoise'
import WorkflowOptions from '../AdvancedOptionsPanel/Workflows'

export default function AdvancedOptionsPanelV2() {
  const { input } = useInput()

  return (
    <div className={styles.AdvancedOptionsPanel}>
      <ImageCount />
      <SelectSampler />
      <SelectModel />
      <ImageOrientationOptions />
      {input.source_image && (
        <>
          <ControlNetOptions />
          <Denoise />
        </>
      )}
      <Steps />
      <Guidance />
      <ClipSkip />
      <Seed />
      <LoraSelect />
      <EmbeddingsSelect />
      <WorkflowOptions />
      <div>
        <FlexibleRow>
          <FlexibleUnit>
            <PostProcessors />
          </FlexibleUnit>
          <FlexibleUnit>
            <UpscalerOptions />
          </FlexibleUnit>
        </FlexibleRow>
      </div>
      <MiscOptions />
    </div>
  )
}
