import { useRef } from 'react'
import { Button } from './Button'
import UploadIcon from './icons/UploadIcon'

// @ts-ignore
export function UploadButton({ disabled, handleFile = () => {} }) {
  const hiddenFileInput = useRef(null)

  const handleClick = () => {
    // @ts-ignore
    hiddenFileInput?.current?.click()
  }

  const handleChange = (event: { target: { files: any[] } }) => {
    const fileUploaded = event.target.files[0]

    // @ts-ignore
    handleFile(fileUploaded)
  }

  return (
    <>
      <Button
        disabled={disabled}
        title="Upload source image"
        // @ts-ignore
        onClick={handleClick}
      >
        <UploadIcon className="mx-auto" />
      </Button>
      <input
        type="file"
        accept="image/*"
        ref={hiddenFileInput}
        // @ts-ignore
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </>
  )
}
