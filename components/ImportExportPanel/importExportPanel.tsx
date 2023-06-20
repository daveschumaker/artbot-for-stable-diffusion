import styled from 'styled-components'
import useComponentState from '../../hooks/useComponentState'
import { useEffectOnce } from '../../hooks/useEffectOnce'
import { initBlob } from '../../utils/blobUtils'
import { countCompletedJobs } from '../../utils/db'
import { downloadImages } from '../../utils/imageUtils'
import PageTitle from '../UI/PageTitle'
import SelectComponent from 'components/UI/Select'
import MaxWidth from 'components/UI/MaxWidth'
import { useState } from 'react'
import SpinnerV2 from 'components/Spinner'
import { IconChevronRight } from '@tabler/icons-react'
import ExportDatabase from 'modules/SettingsPage/ExportDatabase'
import ImportDatabase from 'modules/SettingsPage/ImportDatabase'

const Section = styled.div`
  padding-top: 16px;

  &:first-child {
    padding-top: 0;
  }
`

const SubSectionTitle = styled.div`
  padding-bottom: 8px;
`

const ImportExportPanel = () => {
  const [componentState, setComponentState] = useComponentState({
    filesPerZip: { value: 250, label: 250 },
    totalImages: 0,
    currentImage: 0,
    processingDownloads: false
  })
  const [fileStatus, setFileStatus] = useState<any>({})

  const getImageCount = async () => {
    const count = await countCompletedJobs()
    setComponentState({ totalImages: count })
  }

  const renderImageList = () => {
    const { totalImages, filesPerZip } = componentState
    const bucketSize = filesPerZip.value

    const numBuckets = Math.ceil(totalImages / bucketSize)
    const numberRanges = []

    for (let i = 0; i < numBuckets; i++) {
      const startNum = i * bucketSize + 1
      const endNum = Math.min((i + 1) * bucketSize, totalImages)
      numberRanges.push(
        <li
          key={`files-to-download-${startNum}-${endNum}`}
          className="flex flex-row items-center text-sm font-[700] cursor-pointer mb-2 gap-2"
          style={{
            color:
              componentState.processingDownloads || fileStatus[i] === 'done'
                ? 'gray'
                : '#14b8a6',
            cursor:
              componentState.processingDownloads || fileStatus[i] === 'done'
                ? 'unset'
                : 'pointer'
          }}
        >
          <IconChevronRight />
          <div
            onClick={async () => {
              if (
                fileStatus[i] === 'loading' ||
                fileStatus[i] === 'done' ||
                componentState.processingDownloads
              ) {
                return
              }
              setComponentState({
                processingDownloads: true
              })
              setFileStatus(
                Object.assign({}, fileStatus, {
                  [i]: 'loading'
                })
              )
              await downloadImages({
                offset: startNum,
                limit: bucketSize - 1,
                sort: 'old',
                callback: ({ currentIndex, done }: any) => {
                  if (done) {
                    setComponentState({
                      processingDownloads: false
                    })
                    setFileStatus(
                      Object.assign({}, fileStatus, {
                        [i]: 'done'
                      })
                    )
                    setComponentState({ currentImage: 0 })
                    return
                  }

                  setComponentState({ currentImage: currentIndex })
                }
              })
            }}
          >
            Download images ({startNum} - {endNum})
          </div>
          {fileStatus[i] === 'loading' && <SpinnerV2 size={20} />}
          {fileStatus[i] === 'loading' && (
            <div className="font-[200] text-xs">
              (Processing image... {componentState.currentImage})
            </div>
          )}
          {fileStatus[i] === 'done' && <div>✅</div>}
        </li>
      )
    }

    return numberRanges
  }

  useEffectOnce(() => {
    initBlob()

    getImageCount()
  })

  return (
    <div>
      <PageTitle as="h2">Import / Export Data</PageTitle>
      <ImportDatabase />
      <ExportDatabase />
      <Section>
        <SubSectionTitle>
          <strong>Download all images </strong>
          {componentState.totalImages > 0
            ? `(${componentState.totalImages} images)`
            : null}
          <div className="block text-xs mb-2 mt-2 w-full">
            Create a series of zip files that includes a JSON files with image
            generation parameters, as well as all ArtBot images stored within
            your browser cache. Depending on your device and the number of
            images you&apos;re downloading, this could take a bit of time to
            generate.
          </div>
          <div className="block text-xs mb-2 w-full">
            Due to browser memory limitations when attempting build and stream a
            zip file containing potentially thousands of images at once, ArtBot
            is currently unable to offer a single bulk downloadable file.
            Ideally, this will change in the future (either with native browser
            APIs or third party libraries). If you have some ideas related to
            this, please get in touch!
          </div>
          <div className="block text-xs mb-2 w-full">
            The dropdown below gives you some additional options in instances
            where you encounter browser memory errors when attempting to bulk
            download images.
          </div>
          <Section>
            <MaxWidth width="240px">
              <div className="flex flex-row gap-2 items-center">
                Images per file:
                <SelectComponent
                  options={[
                    { value: 100, label: 100 },
                    { value: 250, label: 250 },
                    { value: 500, label: 500 },
                    { value: 750, label: 750 }
                  ]}
                  onChange={(option: any) => {
                    setComponentState({ filesPerZip: option })
                  }}
                  value={componentState.filesPerZip}
                />
              </div>
            </MaxWidth>
          </Section>
          <Section>
            <div className="text-xs mb-2">(Sorted by oldest images first)</div>
            <ul>{renderImageList()}</ul>
          </Section>
        </SubSectionTitle>
      </Section>
    </div>
  )
}

export default ImportExportPanel
