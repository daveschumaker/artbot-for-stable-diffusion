import { IconLock, IconLockOpen } from '@tabler/icons-react'
import { Button } from 'app/_components/Button'
import React from 'react'

const AspectRatioToggler = ({
  disabled,
  keepAspectRatio,
  toggleKeepAspectRatio
}: {
  disabled: boolean
  keepAspectRatio: boolean
  toggleKeepAspectRatio: any
}) => {
  return (
    <div>
      <Button
        title={keepAspectRatio ? 'Free aspect ratio' : 'Lock aspect ratio'}
        disabled={disabled}
        onClick={toggleKeepAspectRatio}
        style={{ width: '125px' }}
      >
        {keepAspectRatio ? (
          <>
            <IconLock stroke={1.5} />
            Unlock ratio
          </>
        ) : (
          <>
            <IconLockOpen stroke={1.5} />
            Lock ratio
          </>
        )}
      </Button>
    </div>
  )
}

export default AspectRatioToggler
