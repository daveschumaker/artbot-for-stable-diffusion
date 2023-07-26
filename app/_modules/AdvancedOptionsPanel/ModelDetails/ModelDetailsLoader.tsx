'use client'

import SpinnerV2 from 'components/Spinner'
import Section from 'app/_components/Section'

export default function ModelDetailsLoader() {
  return (
    <Section
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        marginBottom: 0,
        paddingTop: 0
      }}
    >
      <div
        style={{
          alignItems: 'center',
          border: '1px solid rgb(126, 90, 108)',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          justifyContent: 'center',
          padding: '8px 16px',
          rowGap: '8px'
        }}
      >
        <SpinnerV2 />
        Loading model details...
      </div>
    </Section>
  )
}
