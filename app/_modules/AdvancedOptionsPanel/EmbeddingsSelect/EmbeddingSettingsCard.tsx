import { IconExternalLink, IconTrash } from '@tabler/icons-react'
import NumberInput from 'app/_components/NumberInput'
import Section from 'app/_components/Section'
import { Button } from 'app/_components/Button'
import Linker from 'app/_components/Linker'
import { AiHordeEmbedding } from '_types/artbot'
import InputSwitchV2 from '../InputSwitchV2'
import { InjectTi } from '_types/horde'
import Slider from 'app/_components/Slider'
import styles from './component.module.css'
import FlexRow from 'app/_components/FlexRow'

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
    <div className={styles['ti-details-box']}>
      <div className={styles['ti-name']}>
        <div className="flex flex-col">
          <div className="font-bold text-[14px] flex flex-row gap-2 items-center">
            {embedding.name}
            <Linker
              href={`https://civitai.com/models/${embedding.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div title="View embedding on CivitAI">
                <IconExternalLink size={18} />
              </div>
            </Linker>
          </div>
        </div>

        <Button
          className={styles['embedding-btn']}
          theme="secondary"
          onClick={handleDelete}
        >
          <IconTrash stroke={1.5} />
        </Button>
      </div>
      <div className="w-full">
        <Section>
          <div className="flex flex-row items-center justify-between">
            <div
              style={{
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                minWidth: 'var(--options-label-width)',
                width: 'var(--options-label-width)'
              }}
            >
              Strength
            </div>
            <FlexRow gap={4} justifyContent="space-between">
              <div className={styles['slider-wrapper']}>
                <Slider
                  value={embedding.strength}
                  min={0.05}
                  max={1}
                  step={0.05}
                  onChange={(e: any) => {
                    handleUpdate('strength', Number(e.target.value))
                  }}
                />
              </div>
              <NumberInput
                className={styles['input-width']}
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
            </FlexRow>
          </div>
          <div className="flex flex-row items-center justify-between">
            <div
              style={{
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                minWidth: 'var(--options-label-width)',
                width: 'var(--options-label-width)'
              }}
            >
              Is negative prompt?
            </div>
            <FlexRow gap={4} justifyContent="flex-start">
              <InputSwitchV2
                label=""
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
            </FlexRow>
          </div>
        </Section>
      </div>
    </div>
  )
}
