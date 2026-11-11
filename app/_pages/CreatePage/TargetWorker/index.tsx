import { useModal } from '@ebay/nice-modal-react'
import { IconDevicesPc } from '@tabler/icons-react'
import { Button } from 'app/_components/Button'
import Modal from 'app/_componentsV2/Modal'
import SelectTargetWorker from './SelectTargetWorker'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { imageWorkersQuery } from 'app/_api/horde/workers'
import { setForceSelectedWorker } from 'app/_store/appStore'

export default function TargetWorker() {
  const targetWorkerModal = useModal(Modal)
  const queryClient = useQueryClient()

  useEffect(() => {
    // Load the worker list early, so the picker opens with it ready.
    queryClient.prefetchQuery(imageWorkersQuery)
  }, [queryClient])

  useEffect(() => {
    const worker = sessionStorage.getItem('forceSelectedWorker')

    if (worker) {
      setForceSelectedWorker(true)
    }
  }, [])

  return (
    <>
      <div style={{ paddingTop: '8px', position: 'relative' }}>
        <Button
          onClick={() => {
            targetWorkerModal.show({
              buttons: (
                <div className="flex flex-row justify-end gap-4">
                  <button
                    className="btn"
                    onClick={() => {
                      targetWorkerModal.remove()
                    }}
                  >
                    Close
                  </button>
                </div>
              ),
              content: <SelectTargetWorker />,
              id: 'worker-target-modal',
              // handleClose: fetchAllWorkersDetails,
              maxWidth: 'max-w-[480px]',
              title: 'Target Specific Worker'
            })
          }}
          size="square-small"
        >
          <IconDevicesPc stroke={1.5} />
        </Button>
      </div>
    </>
  )
}
