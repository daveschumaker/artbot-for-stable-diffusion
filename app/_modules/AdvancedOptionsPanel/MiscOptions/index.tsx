import FlexibleRow from 'app/_components/FlexibleRow'
import FlexibleUnit from 'app/_components/FlexibleUnit'
import Section from 'app/_components/Section'
import { GetSetPromptInput } from 'types'
import HiresFix from '../HiresFix'
import AllowNsfwImages from '../AllowNsfwImages'
import ReplacementFilterToggle from '../ReplacementFilterToggle'
import Panel from 'app/_components/Panel'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import InputSwitchV2 from '../InputSwitchV2'
import SlowWorkers from '../SlowWorkers'

export default function MiscOptions({ input, setInput }: GetSetPromptInput) {
  return (
    <Section>
      <Panel style={{ borderWidth: '1px', padding: '8px' }}>
        <SubSectionTitle>Additional Options</SubSectionTitle>
        <FlexibleRow>
          <FlexibleUnit style={{ rowGap: '8px' }}>
            <InputSwitchV2
              label="Karras"
              tooltip="Denoising magic. Dramatically improves image generation using fewer steps."
              // @ts-ignore
              moreInfoLink={
                input.source_image &&
                input.control_type && (
                  <div className="mt-[-4px] text-xs text-slate-500 dark:text-slate-400 font-[600]">
                    <strong>Note:</strong> Cannot be used for ControlNet
                    requests
                  </div>
                )
              }
              disabled={input.source_image && input.control_type ? true : false}
              handleSwitchToggle={() => {
                if (!input.karras) {
                  setInput({ karras: true })
                } else {
                  setInput({ karras: false })
                }
              }}
              checked={input.karras}
            />
            <HiresFix input={input} setInput={setInput} />
            <SlowWorkers />
          </FlexibleUnit>
          <FlexibleUnit style={{ rowGap: '8px' }}>
            <AllowNsfwImages />
            <ReplacementFilterToggle />
          </FlexibleUnit>
        </FlexibleRow>
      </Panel>
    </Section>
  )
}
