'use client'

import { useState } from 'react'
import FeedbackForm from 'app/_modules/FeedbackForm'
import Modal from 'app/_modules/Modal'
import styles from './changelog.module.css'

export default function ChangelogContact() {
  const [showFeedback, setShowFeedback] = useState(false)

  return (
    <>
      {showFeedback && (
        <Modal
          handleClose={() => setShowFeedback(false)}
          style={{ height: '520px' }}
          visible={showFeedback}
        >
          <FeedbackForm />
        </Modal>
      )}
      <button
        className={styles['link-btn']}
        onClick={() => setShowFeedback(true)}
        type="button"
      >
        Contact me!
      </button>
    </>
  )
}
