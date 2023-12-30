import { useStore } from 'statery'
import { appInfoStore } from 'app/_store/appStore'
import styles from './alertDropdown.module.css'

const AlertDropdown = () => {
  const { pauseJobQueue } = useStore(appInfoStore)

  return (
    <div className={styles.AlertDropdown}>
      <div className="font-[700] mb-[8px]">Warnings</div>
      <div
        className="font-mono text-[12px] pl-[8px]"
        style={{ display: 'flex', flexDirection: 'column', rowGap: '12px' }}
      >
        {pauseJobQueue && (
          <div
            className="text-amber-400 font-semibold rounded border border-amber-400"
            style={{
              border: '1px solid rgb(251 191 36)',
              fontWeight: 400,
              margin: '8px 0',
              padding: '8px'
            }}
          >
            <strong>Jobs Paused:</strong>
            <br />
            <br />
            Jobs are currently paused. Visit the pending page to re-enable the
            job queue.
          </div>
        )}
      </div>
    </div>
  )
}

export default AlertDropdown
