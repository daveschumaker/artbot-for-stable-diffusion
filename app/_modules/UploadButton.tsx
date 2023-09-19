import { useRef } from 'react'
import { Button } from 'app/_components/Button'
import { IconCloudUpload } from '@tabler/icons-react'
import MobileHideText from 'app/_components/MobileHideText'

interface UploadButtonProps {
  accept?: string
  label: string
  disabled?: boolean
  handleFile: () => void
}

// @ts-ignore
export function UploadButton({
  accept = 'image/*',
  label = '',
  disabled = false,
  handleFile
}: UploadButtonProps) {
  // @ts-ignore
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
        <IconCloudUpload className="mx-auto" />
        {label && <MobileHideText>{label}</MobileHideText>}
      </Button>
      <input
        type="file"
        accept={accept}
        ref={hiddenFileInput}
        // @ts-ignore
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </>
  )
}
