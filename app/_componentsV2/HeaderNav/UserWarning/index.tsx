import { IconAlertTriangleFilled } from '@tabler/icons-react'
import { useStore } from 'statery'
import NiceModal from '@ebay/nice-modal-react'
import {
  appInfoStore,
  setUseAllowedWorkers,
  setUseBlockedWorkers
} from 'app/_store/appStore'
import InputSwitchV2 from 'app/_modules/AdvancedOptionsPanel/InputSwitchV2'
import AppSettings from 'app/_data-models/AppSettings'
import { useEffect, useState } from 'react'
import Linker from 'app/_components/Linker'

const UserWarningModal = () => {
  const appState = useStore(appInfoStore)
  const [showQuotaExceeded, setShowQuotaExceeded] = useState(false)
  const [showLockedWorkerWarning, setShowLockedWorkerWarning] = useState(false)

  useEffect(() => {
    if (appState.useAllowedWorkers) {
      setShowLockedWorkerWarning(true)
    }

    if (appState.storageQuotaLimit) {
      setShowQuotaExceeded(true)
    }
  }, [appState.storageQuotaLimit, appState.useAllowedWorkers])

  return (
    <div className="flex flex-col gap-2">
      {showQuotaExceeded && (
        <>
          <div>
            <strong>Browser storage quota exceeded</strong>
          </div>
          <div className="text-sm">
            Your browser has reported that the storage quota alloted to ArtBot
            is full, which prevents this web app from writing data to your
            cache. Please remove some images and try again.{' '}
            <Linker
              href="/faq#storage-exceeded"
              passHref
              onClick={() => {
                NiceModal.remove('lockedToWorker-modal')
              }}
            >
              Why am I getting this error?
            </Linker>
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
  const { storageQuotaLimit } = appState

  if (!appState.useAllowedWorkers && !storageQuotaLimit) {
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
          {storageQuotaLimit ? (
            <div style={{ color: 'red' }}>
              <IconAlertTriangleFilled stroke={1} />
            </div>
          ) : (
            <IconAlertTriangleFilled stroke={1} />
          )}
        </button>
      </div>
    </>
  )
}
