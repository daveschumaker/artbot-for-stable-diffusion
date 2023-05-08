import React, { useState } from 'react'

import { trackEvent } from '../api/telemetry'
import { imageCount } from '../utils/db'
import { Button } from './UI/Button'
import SectionTitle from './UI/SectionTitle'
import Text from './UI/Text'
import TextArea from './UI/TextArea'
import { userInfoStore } from '../store/userStore'
import Input from './UI/Input'
import FlexRow from './UI/FlexRow'
import PageTitle from './UI/PageTitle'

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-full space-between relative text-light dark:text-dark">
      {children}
    </div>
  )
}

const FeedbackForm = ({
  isContactPage = false
}: {
  isContactPage?: boolean
}) => {
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
    <>
      <Wrapper>
        {isContactPage && <PageTitle>Send feedback</PageTitle>}

        {!isContactPage && <SectionTitle>Feedback</SectionTitle>}
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
            <div className="mb-[8px]">
              <span>Feedback:</span>
              <TextArea
                maxLength={2048}
                onChange={(e: any) => setInputText(e.target.value)}
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
    </>
  )
}

export default FeedbackForm
