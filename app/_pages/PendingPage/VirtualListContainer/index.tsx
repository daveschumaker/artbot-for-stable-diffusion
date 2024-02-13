import { useEffect, useState } from 'react'
import styles from './virtualList.module.css'
import { Virtuoso } from 'react-virtuoso'
import Linker from 'app/_components/Linker'
import PendingItem from 'app/_pages/PendingPage/PendingItem'
import usePendingImageModal from '../usePendingImageModal'
import { deletePendingJobFromDb } from 'app/_utils/db'
import { deletePendingJob } from 'app/_controllers/pendingJobsCache'
import { fetchPendingImageJobs } from 'app/_controllers/pendingJobsController'

const FOOTER_HEIGHT_PX = 66
const MOBILE_FOOTER_PX = 66

export default function VirtualListContainer({
  completedJobs = [],
  items = [],
  jobsInProgress = false
}: {
  completedJobs: any[]
  items: any[]
  jobsInProgress: boolean
}) {
  const [showImageModal] = usePendingImageModal()
  const [listHeight, setListHeight] = useState(0)

  const onClosePanel = async (jobId: string) => {
    await deletePendingJobFromDb(jobId)
    deletePendingJob(jobId)
    fetchPendingImageJobs()
  }

  const renderRow = ({ index }: { index: any }) => {
    const job = items[index]

    if (!job || !job.jobId) {
      return null
    }

    return (
      <>
        {jobsInProgress && index === 0 && (
          <div style={{ paddingBottom: '12px' }}>
            Why not <Linker href="/rate">rate some images</Linker> (and earn
            kudos) while you wait?
          </div>
        )}
        <PendingItem
          handleCloseClick={() => {
            onClosePanel(job.jobId)
          }}
          //@ts-ignore
          onImageClick={handleShowModalClick}
          // onHideClick={}
          //@ts-ignore
          jobDetails={job}
          //@ts-ignore
          jobId={job.jobId}
        />
      </>
    )
  }

  const handleShowModalClick = (jobId: string) => {
    showImageModal({ jobId, images: completedJobs })
    return jobId
  }

  useEffect(() => {
    const calcListHeight = () => {
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const container = document.getElementById('pending_virtual_list')
      // @ts-ignore
      const { top } = container?.getBoundingClientRect()
      const absoluteTop = window.pageYOffset + top

      const newHeight = windowHeight - absoluteTop

      let footerPadding = FOOTER_HEIGHT_PX

      if (windowWidth < 640) {
        footerPadding = MOBILE_FOOTER_PX
      }

      setListHeight(newHeight - footerPadding)
    }

    calcListHeight()

    // Call the function on window resize to handle responsive changes
    window.addEventListener('resize', calcListHeight)

    return () => {
      window.removeEventListener('resize', calcListHeight)
    }
  }, [])

  return (
    <div
      id="pending_virtual_list"
      className={styles.VirtualList}
      style={{ height: `${listHeight}px` }}
    >
      <Virtuoso
        className={styles['virtual-list']}
        totalCount={items.length}
        style={{
          overflowY: 'auto',
          position: 'absolute',
          marginTop: '12px',
          top: '0',
          bottom: '0',
          left: '0',
          right: '0'
        }}
        components={{
          Footer: () => {
            return (
              <div
                style={{
                  height: '30px',
                  marginBottom: '30px'
                }}
              >
                {' '}
              </div>
            )
          }
        }}
        itemContent={(index) => <>{renderRow({ index })}</>}
      />
    </div>
  )
}
