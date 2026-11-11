'use client'
import { useEffect, useState } from 'react'
import {
  backupBusy,
  backupWindowId,
  browserStorage,
  OPERATION_KEY,
  pauseRestoredJobs,
  restoredJobsPaused
} from 'app/_backup/platform'
import AppSettings from 'app/_data-models/AppSettings'
import { setPauseJobQueue } from 'app/_store/appStore'

export default function BackupActivityGuard() {
  const [other, setOther] = useState(false),
    [paused, setPaused] = useState(false)
  useEffect(() => {
    const update = () => {
      let operation
      try {
        operation = JSON.parse(
          browserStorage()?.getItem(OPERATION_KEY) || 'null'
        )
      } catch {
        operation = null
      }
      setOther(backupBusy() && operation?.owner !== backupWindowId())
      setPaused(restoredJobsPaused())
    }
    update()
    const timer = setInterval(update, 500)
    return () => clearInterval(timer)
  }, [])
  if (other)
    return (
      <div
        role="status"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100000,
          background: '#111e',
          display: 'grid',
          placeContent: 'center',
          padding: 32,
          color: 'white'
        }}
      >
        <p>
          A backup or restore is running in another window. This library is
          temporarily read-only.
        </p>
        <p>
          Leave that window open. This window will reload if the selected
          library changes.
        </p>
      </div>
    )
  if (!paused) return null
  return (
    <div
      role="status"
      style={{ padding: 12, background: '#493c17', color: 'white' }}
    >
      Restored image requests are paused. Check existing requests before
      resuming to avoid duplicate submissions.
      <button
        type="button"
        style={{ textDecoration: 'underline', marginLeft: 12 }}
        onClick={() => {
          pauseRestoredJobs(false)
          AppSettings.set('pauseJobQueue', false)
          setPauseJobQueue(false)
          setPaused(false)
        }}
      >
        Resume restored requests
      </button>
    </div>
  )
}
