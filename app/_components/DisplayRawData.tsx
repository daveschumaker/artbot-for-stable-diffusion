import clsx from 'clsx'
import { useState } from 'react'
import ImageParamsForApi from 'app/_data-models/ImageParamsForApi'
import { Button } from 'app/_components/Button'
import { showSuccessToast } from 'app/_utils/notificationUtils'
import { IconCopy, IconEye } from '@tabler/icons-react'

const DisplayRawData = ({ data }: { data: any }) => {
  const [expandJson, setExpandJson] = useState(false)
  const [display, setDisplay] = useState('apiParams')

  const classes = [
    'bg-slate-800',
    'font-mono',
    'text-white',
    'text-sm',
    'overflow-x-auto',
    'p-2',
    'w-full'
  ]

  const cleanData = () => {
    const obj = Object.assign({}, data)

    if (obj.canvasData) {
      obj.canvasData = '[true] (removed for logging error)'
    } else {
      delete obj.canvasData
    }

    if (obj.maskData) {
      obj.maskData = '[true] (removed for logging error)'
    } else {
      delete obj.maskData
    }

    if (obj.base64String) {
      delete obj.base64String
      delete obj.thumbnail
    }

    if (obj.source_image) {
      obj.source_image = '[true] (string removed for logging error)'
    }

    if (obj.source_mask) {
      obj.source_mask = '[true] (string removed for logging error)'
    }

    return obj
  }

  const handleCopyData = () => {
    const dataToCopy =
      display === 'apiParams'
        ? JSON.stringify(
            new ImageParamsForApi(data, { hasError: true }),
            null,
            2
          )
        : JSON.stringify(cleanData(), null, 2)
    navigator?.clipboard?.writeText(dataToCopy).then(() => {
      showSuccessToast({ message: 'Data copied' })
    })
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="mt-4">
        <div
          className="font-bold text-sm cursor-pointer text-[#14B8A6]"
          onClick={() => {
            if (expandJson) {
              setExpandJson(false)
            } else {
              setExpandJson(true)
            }
          }}
        >
          [ {expandJson ? 'Hide' : 'View'} request parameters ]
        </div>
      </div>
      {expandJson && (
        <>
          <div className={clsx(classes)}>
            <pre>
              {display === 'apiParams' && (
                <>
                  {JSON.stringify(
                    new ImageParamsForApi(data, { hasError: true }),
                    null,
                    2
                  )}
                </>
              )}
              {display === 'rawInput' && (
                <>{JSON.stringify(cleanData(), null, 2)}</>
              )}
            </pre>
          </div>
          <div className="text-sm">
            <strong>Tip:</strong> Request parameters are useful for potentially
            debugging what went wrong during an image request.
          </div>
          <div className="flex flex-row gap-2">
            <Button
              title="View data"
              onClick={() => {
                if (display === 'apiParams') {
                  setDisplay('rawInput')
                } else {
                  setDisplay('apiParams')
                }
              }}
            >
              <IconEye />
              {display === 'apiParams' && <>View raw input</>}
              {display === 'rawInput' && <>View request params</>}
            </Button>
            <Button title="Copy data" onClick={() => handleCopyData()}>
              <IconCopy />
              Copy JSON
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default DisplayRawData
