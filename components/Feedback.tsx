import React, { useState } from 'react'

import { trackEvent } from '../api/telemetry'
import { imageCount } from '../utils/db'
import { Button } from './UI/Button'
import Modal from './Modal'
import SectionTitle from './UI/SectionTitle'
import Text from './UI/Text'
import TextArea from './UI/TextArea'
import { userInfoStore } from '../store/userStore'
import Input from './UI/Input'
import FlexRow from './UI/FlexRow'

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-full space-between relative text-light dark:text-dark">
      {children}
    </div>
  )
}

const FeedbackModal = ({ handleClose }: { handleClose: () => void }) => {
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [contactInput, setContactInput] = useState('')
  const [inputText, setInputText] = useState('')

  const handleSubmit = async () => {
    if (feedbackSent) {
      return
    }
    const totalImages = await imageCount()

    setFeedbackSent(true)
    trackEvent({
      event: 'FEEDBACK_FORM',
      data: {
        contact: contactInput,
        stablehorde_username: userInfoStore.state.username || '',
        kudos: userInfoStore.state.kudos,
        input: inputText,
        totalImages
      }
    })
  }

  return (
    // @ts-ignore
    <Modal handleClose={handleClose}>
      <Wrapper>
        <SectionTitle>Feedback</SectionTitle>
        <Text>Comments, suggestions, bugs?</Text>
        {feedbackSent && (
          <div className="align-center flex justify-center h-[120px] w-full">
            Your message has been sent. Thank you!
          </div>
        )}
        {!feedbackSent && (
          <div className="flex flex-col gap-2">
            <div>
              <span>Contact (optional)</span>
              <Input
                autoFocus
                tabIndex={0}
                placeholder="Email, Discord, etc"
                onChange={(e: any) => {
                  setContactInput(e.target.value)
                }}
                value={contactInput}
              />
            </div>
            <div>
              <span>Feedback:</span>
              <TextArea
                className="p-[8px] mb-[8px] w-full max-h-[120px]"
                maxLength={1024}
                onChange={(e) => setInputText(e.target.value)}
                value={inputText}
              />
            </div>
          </div>
        )}
        <FlexRow justify="flex-end">
          <Button onClick={handleSubmit} disabled={feedbackSent}>
            {feedbackSent ? 'Message sent!' : 'Send Message'}
          </Button>
        </FlexRow>
      </Wrapper>
    </Modal>
  )
}

export default FeedbackModal
