import Uploader from 'app/_modules/Uploader'
import PageTitle from 'app/_components/PageTitle'
import InteractiveModal from 'app/_components/InteractiveModal/interactiveModal'

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
