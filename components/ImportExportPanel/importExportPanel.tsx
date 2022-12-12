import styled from 'styled-components'
import { trackEvent } from '../../api/telemetry'
import useComponentState from '../../hooks/useComponentState'
import { useEffectOnce } from '../../hooks/useEffectOnce'
import { initBlob } from '../../utils/blobUtils'
import { allCompletedJobs, countCompletedJobs } from '../../utils/db'
import { downloadImages } from '../../utils/imageUtils'
import DownloadIcon from '../icons/DownloadIcon'
import { Button } from '../UI/Button'
import PageTitle from '../UI/PageTitle'

initBlob()

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
    imageCount: 0,
    currentImage: 1,
    processingDownloads: false
  })

  const getImageCount = async () => {
    const count = await countCompletedJobs()
    setComponentState({ imageCount: count })
  }

  const handleDownload = async () => {
    setComponentState({ processingDownloads: true, currentImage: 1 })

    const allImages = await allCompletedJobs()
    await downloadImages(allImages, () => {
      setComponentState({ currentImage: ++componentState.currentImage })
    })

    setComponentState({ processingDownloads: false })

    trackEvent({
      event: 'EXPORT_ALL_DATA',
      context: '/settings'
      // data: {
      //   numImages: componentState.deleteSelection.length
      // }
    })
  }

  useEffectOnce(() => {
    getImageCount()
  })

  return (
    <div>
      <Section>
        <PageTitle as="h2">Export Data</PageTitle>
        <SubSectionTitle>
          Download all data{' '}
          {componentState.imageCount > 0
            ? `(${componentState.imageCount} images)`
            : null}
          <div className="block text-xs mb-2 mt-2 w-full">
            Create a zip file that includes a JSON file with image generation
            parameters, as well as all ArtBot images stored within your browser
            cache. Depending on your device and the number of images you&apos;re
            downloading, this could take a bit of time to generate.
          </div>
          {componentState.processingDownloads && (
            <div className="mt-2 mb-2">
              Processing image {componentState.currentImage} of{' '}
              {componentState.imageCount}...
            </div>
          )}
          <Button
            disabled={componentState.processingDownloads}
            onClick={handleDownload}
          >
            {componentState.processingDownloads ? (
              `Processing...`
            ) : (
              <>
                <DownloadIcon />
                Download
              </>
            )}
          </Button>
        </SubSectionTitle>
      </Section>
    </div>
  )
}

export default ImportExportPanel
