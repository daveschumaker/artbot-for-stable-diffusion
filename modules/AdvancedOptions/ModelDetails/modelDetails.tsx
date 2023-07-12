/* eslint-disable @next/next/no-img-element */
import { useStore } from 'statery'
import Section from 'components/UI/Section'
import { modelStore } from 'store/modelStore'
import SubSectionTitle from 'components/UI/SubSectionTitle'
import { useEffect, useState } from 'react'
import { ModelDetails } from 'types/artbot'
import { isEmptyObject } from 'utils/helperUtils'
import ModelDetailsLoader from './ModelDetailsLoader'
import FlexCol from 'components/FlexCol'

// TODO: Need to split into some sort of wrapper so we don't collide with hook,
// which cannot be used on server side render
// async function fetchModelDetails() {
//   const data = await fetch(`/artbot/api/model-details`)
//   console.log(`data?`, data)
//   return data
// }

const SelectModelDetails = ({
  models = [],
  multiModels = false
}: {
  models: Array<string>
  multiModels: boolean
}) => {
  // const data = await fetchModelDetails()
  const { modelDetails } = useStore(modelStore)
  const [modelInfo, setModelInfo] = useState<ModelDetails | null>(null)

  useEffect(() => {
    if (models && models.length === 1) {
      const canUpdate =
        !modelInfo || (modelInfo && modelInfo.name !== models[0])

      if (!canUpdate) return

      const model = modelDetails[models[0]]

      if (model) {
        setModelInfo(model)
      } else {
        setModelInfo(null)
      }
    } else {
      setModelInfo(null)
    }

    if (multiModels) {
      setModelInfo(null)
    }
  }, [models, modelDetails, modelInfo, multiModels])

  if (isEmptyObject(modelDetails)) {
    return <ModelDetailsLoader />
  }

  const hasTrigger =
    modelInfo && modelInfo.trigger && Array.isArray(modelInfo.trigger)
  const hasShowcase =
    modelInfo &&
    modelInfo.showcases &&
    Array.isArray(modelInfo.showcases) &&
    modelInfo.showcases.length >= 1

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
          border: '1px solid rgb(126, 90, 108)',
          padding: '8px 16px',
          borderRadius: '4px',
          flexGrow: 1
        }}
      >
        <FlexCol style={{ rowGap: '4px' }}>
          <SubSectionTitle>Model details</SubSectionTitle>
          {models.length === 0 && (
            <div style={{ fontSize: '14px', marginBottom: '4px' }}>
              Please choose a model.
            </div>
          )}
          {(models.length > 1 || multiModels) && (
            <div style={{ fontSize: '14px', marginBottom: '4px' }}>
              Panel disabled when using multiple models
            </div>
          )}
          {!modelInfo && models.length === 1 && !multiModels && (
            <div style={{ fontSize: '14px', marginBottom: '4px' }}>
              There is currently no information available for {models[0]}.
            </div>
          )}
          {hasShowcase && (
            <>
              <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                Example output using {models[0]}
              </div>
              <img
                src={modelInfo.showcases[0]}
                alt={`Example image output for model: ${models[0]}`}
                width="280"
                height="280"
                style={{ borderRadius: '4px', marginBottom: '4px' }}
              />
            </>
          )}
          {modelInfo && modelInfo.description && !multiModels && (
            <div style={{ fontSize: '12px', marginBottom: '8px' }}>
              {modelInfo.description}
            </div>
          )}
          {modelInfo && !modelInfo.description && (
            <div style={{ fontSize: '12px', marginBottom: '8px' }}>
              No description available for this model
            </div>
          )}
          {modelInfo && !multiModels && (
            <div style={{ fontSize: '12px', marginBottom: '8px' }}>
              <strong>Style:</strong> {modelInfo.style}{' '}
              {modelInfo.nsfw ? '(nsfw)' : ''}
            </div>
          )}
          {hasTrigger && (
            <div style={{ fontSize: '12px', marginBottom: '8px' }}>
              <strong>Trigger words: </strong>
              {modelInfo?.trigger?.map((word) => {
                return <div key={`trigger_${word}`}>&quot;{word}&quot;</div>
              })}
            </div>
          )}
        </FlexCol>
      </div>
    </Section>
  )
}

export default SelectModelDetails
