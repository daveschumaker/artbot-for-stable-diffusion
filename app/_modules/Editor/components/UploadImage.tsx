import Uploader from 'app/_modules/Uploader'
import InteractiveModal from 'components/UI/InteractiveModal/interactiveModal'
import PageTitle from 'app/_components/PageTitle'

const UploadImage = ({
  handleClose = () => {},
  handleSaveImage = () => {}
}: {
  handleClose: () => void
  handleSaveImage: (data: any) => void
}) => {
  return (
    <InteractiveModal
      handleClose={handleClose}
      maxWidth="480px"
      setDynamicHeight={340}
    >
      <div className="px-4">
        <PageTitle>Upload image</PageTitle>
        <Uploader handleSaveImage={handleSaveImage} />
      </div>
    </InteractiveModal>
  )
}

export default UploadImage
