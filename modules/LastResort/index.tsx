import PageTitle from 'components/UI/PageTitle'
import LastResortImport from './FirefoxDb/LastResortImport'
import LastResortExport from './FirefoxDb/LastResortExport'
import { useState } from 'react'
import Select from 'components/UI/Select'
import SubSectionTitle from 'components/UI/SubSectionTitle'
import Section from 'components/UI/Section'

export default function LastResort() {
  const [chunkSize, setChunkSize] = useState({ value: 250, label: 250 })

  return (
    <div>
      <PageTitle>Raw Import / Export</PageTitle>
      <Section>
        <SubSectionTitle>
          Limit images per JSON file
          <div className="text-xs font-[400]">
            Adjust this to a smaller value if you encounter errors.
          </div>
        </SubSectionTitle>
        <Select
          options={[
            { value: 25, label: 25 },
            { value: 50, label: 50 },
            { value: 100, label: 100 },
            { value: 250, label: 250 },
            { value: 500, label: 500 },
            { value: 750, label: 750 }
          ]}
          onChange={(option: any) => {
            setChunkSize(option)
          }}
          inputMode="none"
          // @ts-ignore
          value={chunkSize}
          width="180px"
        />
      </Section>
      <Section>
        <LastResortExport chunkSize={chunkSize.value} />
      </Section>
      <Section>
        <LastResortImport />
      </Section>
    </div>
  )
}
