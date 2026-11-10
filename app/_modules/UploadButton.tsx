import React, { useRef } from 'react'
import { Button } from 'app/_components/Button'
import { IconCloudUpload } from '@tabler/icons-react'
import MobileHideText from 'app/_components/MobileHideText'

interface UploadButtonProps {
  accept?: string
  label: string
  disabled?: boolean
  handleFile: (file: File) => void
}

export function UploadButton({
  accept = 'image/*',
  label = '',
  disabled = false,
  handleFile
}: UploadButtonProps) {
  const hiddenFileInput = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    hiddenFileInput?.current?.click()
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileUploaded = event.target.files?.[0]

    // Browsers only fire "change" for a different file, so emptying the input
    // lets the same file be picked again.
    event.target.value = ''

    // A cancelled picker can leave no file.
    if (fileUploaded) {
      handleFile(fileUploaded)
    }
  }

  return (
    <>
      <Button
        disabled={disabled}
        title="Upload source image"
        onClick={handleClick}
      >
        <IconCloudUpload className="mx-auto" />
        {label && <MobileHideText>{label}</MobileHideText>}
      </Button>
      <input
        type="file"
        accept={accept}
        ref={hiddenFileInput}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </>
  )
}
