import Panel from 'app/_components/Panel'
import { useInput } from 'app/_modules/InputProvider/context'
import styles from './component.module.css'
import OptionsRow from 'app/_modules/AdvancedOptionsPanelV2/OptionsRow'
import OptionsRowLabel from 'app/_modules/AdvancedOptionsPanelV2/OptionsRowLabel'
import FlexRow from 'app/_components/FlexRow'
import Select from 'app/_components/Select'
import Input from 'app/_components/Input'

export default function WorkflowOptions() {
  const { input, setInput } = useInput()

  const dropdownOptions = [
    { label: 'None', value: '' },
    { label: 'QR Code', value: 'qr_code' }
  ]

  return (
    <div>
      <Panel
        style={{
          borderWidth: '1px',
          padding: '8px',
          overflowX: 'unset'
        }}
      >
        <div
          className={styles.label}
          style={{
            marginBottom: '8px'
          }}
        >
          Workflows
        </div>
        <OptionsRow style={{ marginBottom: '8px' }}>
          <OptionsRowLabel>Type</OptionsRowLabel>
          <FlexRow gap={4} style={{ position: 'relative' }}>
            <>
              <Select
                options={dropdownOptions}
                onChange={(obj: { value: string; label: string }) => {
                  if (obj.value === '') {
                    setInput({ workflow: '', extra_texts: null })
                  } else {
                    setInput({ workflow: obj.value })
                  }
                }}
                value={
                  dropdownOptions.filter(
                    (option) => option.value === input.workflow
                  )[0]
                }
              />
            </>
          </FlexRow>
        </OptionsRow>
        {input.workflow === 'qr_code' && (
          <OptionsRow>
            <OptionsRowLabel>Text</OptionsRowLabel>
            <Input
              placeholder="URL or string to embed in QR code"
              onChange={(e: any) =>
                setInput({
                  extra_texts: [
                    {
                      text: e.target.value,
                      reference: 'qr_code'
                    }
                  ]
                })
              }
              value={(input?.extra_texts && input?.extra_texts[0]?.text) ?? ''}
            />
          </OptionsRow>
        )}
      </Panel>
    </div>
  )
}
