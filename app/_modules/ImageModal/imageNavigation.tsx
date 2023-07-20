import ImageNavButton from './ImageNavButton'
import styles from './imageModal.module.css'

const ImageNavigation = ({
  handleLoadNext = () => {},
  handleLoadPrev = () => {}
}: {
  handleLoadNext: () => void
  handleLoadPrev: () => void
}) => {
  return (
    <>
      <div className={styles['left-nav-btn']}>
        {/* Yes, the names make no sense here. Whatever, just go with it. */}
        <ImageNavButton action="PREV" handleOnClick={handleLoadNext} />
      </div>
      <div className={styles['right-nav-btn']}>
        {/* Yes, the names make no sense here. Whatever, just go with it. */}
        <ImageNavButton action="NEXT" handleOnClick={handleLoadPrev} />
      </div>
    </>
  )
}

export default ImageNavigation
