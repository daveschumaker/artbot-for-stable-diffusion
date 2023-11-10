/* eslint-disable @next/next/no-img-element */
import PageTitle from 'app/_components/PageTitle'
import FixedMenu from '../FixedMenu'
import ContentWrapper from 'app/_components/ContentWrapper'
import MaxWidth from 'app/_components/MaxWidth'
import ImageModal from 'app/_pages/ShowcasePage/ImageModal'

export default function SharedImageView({ imageDetails = {}, imageId }: any) {
  const { params = {} } = imageDetails

  return (
    <>
      <FixedMenu />
      <ContentWrapper>
        <MaxWidth max="1024px" style={{ margin: '0 auto' }}>
          <div style={{ paddingBottom: '8px' }}>
            <PageTitle>Shared image {params.tiling ? ' tile' : ''}</PageTitle>
          </div>
          <ImageModal
            imageDetails={{
              image_params: imageDetails,
              shortlink: imageId
            }}
          />
        </MaxWidth>
      </ContentWrapper>
    </>
  )
}
