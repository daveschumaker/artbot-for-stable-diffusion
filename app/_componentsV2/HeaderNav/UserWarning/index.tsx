import { IconAlertTriangleFilled, IconTrash } from '@tabler/icons-react'
import { useStore } from 'statery'
import NiceModal from '@ebay/nice-modal-react'
import {
  appInfoStore,
  setForceSelectedWorker,
  setUseAllowedWorkers,
  setUseBlockedWorkers
} from 'app/_store/appStore'
import InputSwitchV2 from 'app/_modules/AdvancedOptionsPanel/InputSwitchV2'
import AppSettings from 'app/_data-models/AppSettings'
import { useEffect, useState } from 'react'
import Linker from 'app/_components/Linker'
import { Button } from 'app/_components/Button'

const UserWarningModal = () => {
  const appState = useStore(appInfoStore)
  const [showLockedWorkerWarning, setShowLockedWorkerWarning] = useState(false)
  const [showForceSelectedWorkerWarning, setShowForceSelectedWorkerWarning] =
    useState(false)

  useEffect(() => {
    if (appState.forceSelectedWorker) {
      setShowForceSelectedWorkerWarning(true)
    } else if (appState.useAllowedWorkers) {
      setShowLockedWorkerWarning(true)
    }
  }, [appState.forceSelectedWorker, appState.useAllowedWorkers])

  return (
    <div className="flex flex-col gap-2">
      {showForceSelectedWorkerWarning && (
        <>
          <div>
            <strong>Your requests are locked to one specific worker</strong>
          </div>
          <div className="text-sm">
            You have locked your image requests to one specific worker on the
            Create Image page. If you wish to remove this preference, you can do
            so below.
          </div>
          <div>
            <Button
              theme="secondary"
              onClick={() => {
                sessionStorage.setItem('forceSelectedWorker', '')
                setForceSelectedWorker(false)
              }}
            >
              <IconTrash stroke={1.5} />
              Clear worker
            </Button>
          </div>
        </>
      )}
      {showLockedWorkerWarning && (
        <>
          <div>
            <strong>Requests locked to specific workers</strong>
          </div>
          <div className="text-sm">
            Your requests are currently locked to specific workers selected in
            your allow list. Requests may be slower, or not possible, depending
            on worker features and availability.{' '}
            <Linker
              // className={styles.LinkWrapper}
              href="/settings#use-specific-workers"
              passHref
              onClick={() => {
                NiceModal.remove('lockedToWorker-modal')
              }}
            >
              Manage your worker preferences here.
            </Linker>
          </div>
          <div>
            <InputSwitchV2
              label="Enable? (only send jobs to specific workers)"
              handleSwitchToggle={() => {
                if (!appState.useAllowedWorkers) {
                  setUseAllowedWorkers(true)
                  setUseBlockedWorkers(false)
                  AppSettings.set('useAllowedWorkers', true)
                  AppSettings.set('useBlockedWorkers', false)
                } else {
                  setUseAllowedWorkers(false)
                  AppSettings.set('useAllowedWorkers', false)
                }
              }}
              checked={appState.useAllowedWorkers}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default function UserWarning() {
  const appState = useStore(appInfoStore)

  if (!appState.useAllowedWorkers && !appState.forceSelectedWorker) {
    return null
  }

  return (
    <>
      <div className="flex-none h-[32px]">
        <button
          className="btn btn-sm btn-ghost normal-case px-[4px]"
          onClick={() => {
            NiceModal.show('lockedToWorker-modal', {
              content: <UserWarningModal />,
              maxWidth: 'max-w-[480px]'
              // title: 'AI Horde Performance'
            })
          }}
        >
          <div style={{ color: 'orange' }}>
            <IconAlertTriangleFilled stroke={1} />
          </div>
        </button>
      </div>
    </>
  )
}
