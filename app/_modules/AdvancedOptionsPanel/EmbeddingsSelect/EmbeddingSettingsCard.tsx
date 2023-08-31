import { IconExternalLink, IconTrash } from '@tabler/icons-react'
import FlexCol from 'app/_components/FlexCol'
import FlexRow from 'app/_components/FlexRow'
import MaxWidth from 'app/_components/MaxWidth'
import NumberInput from 'app/_components/NumberInput'
import Panel from 'app/_components/Panel'
import Section from 'app/_components/Section'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import { Button } from 'app/_components/Button'
import Linker from 'components/UI/Linker'
import Slider from 'components/UI/Slider'
import { AiHordeEmbedding } from 'types/artbot'
import InputSwitchV2 from '../InputSwitchV2'
import { InjectTi } from 'types/horde'

export default function EmbeddingSettingsCard({
  embedding,
  handleDelete = () => {},
  handleUpdate = () => {}
}: {
  embedding: AiHordeEmbedding
  handleDelete: () => any
  handleUpdate: (key: string, value: number | string) => any
}) {
  return (
    <Panel style={{ borderWidth: '1px', padding: '8px' }}>
      <FlexRow
        style={{
          alignItems: 'flex-start',
          columnGap: '8px',
          justifyContent: 'space-between',
          position: 'relative',
          width: '100%'
        }}
      >
        <FlexCol>
          <div style={{ fontWeight: 700 }}>{embedding.name}</div>
          <div
            className="flex flex-row gap-1 items-center"
            style={{
              fontSize: '12px'
              // marginTop: '-10px'
            }}
          >
            <Linker
              href={`https://civitai.com/models/${embedding.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              [ View on Civitai]
            </Linker>
            <IconExternalLink size={18} stroke={1.5} />
          </div>
        </FlexCol>
        <Button theme="secondary" onClick={handleDelete}>
          <IconTrash stroke={1.5} />
        </Button>
      </FlexRow>
      <div className="w-full">
        <Section>
          <div
            className="flex flex-row items-center justify-between"
            style={{ justifyContent: 'space-between' }}
          >
            <SubSectionTitle>
              Strength
              <div className="block text-xs w-full" style={{ fontWeight: 400 }}>
                ({0.05} - {1})
              </div>
            </SubSectionTitle>
            <MaxWidth max={'160px'} style={{ margin: 0 }}>
              <NumberInput
                min={0.05}
                max={1}
                onMinusClick={() => {
                  handleUpdate(
                    'strength',
                    Number((embedding.strength - 0.05).toFixed(2))
                  )
                }}
                onPlusClick={() => {
                  handleUpdate(
                    'strength',
                    Number((embedding.strength + 0.05).toFixed(2))
                  )
                }}
                onInputChange={(e: any) => {
                  handleUpdate('strength', Number(e.target.value))
                }}
                onBlur={(e: any) => {
                  handleUpdate('strength', Number(e.target.value))
                }}
                value={embedding.strength}
                width="auto"
              />
            </MaxWidth>
          </div>
          <Slider
            value={embedding.strength}
            min={0.05}
            max={1}
            step={0.05}
            onChange={(e: any) => {
              handleUpdate('strength', Number(e.target.value))
            }}
          />
          <InputSwitchV2
            label="Apply to negative prompt?"
            tooltip="When enabled, this will automatically apply to the negative prompt, instead of the positive prompt."
            checked={embedding.inject_ti === InjectTi.NegPrompt}
            handleSwitchToggle={() => {
              if (embedding.inject_ti === InjectTi.NegPrompt) {
                handleUpdate('inject_ti', InjectTi.Prompt)
              } else {
                handleUpdate('inject_ti', InjectTi.NegPrompt)
              }
            }}
          />
        </Section>
      </div>
    </Panel>
  )
}
