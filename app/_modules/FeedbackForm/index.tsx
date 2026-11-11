import React, { useState } from 'react'

import { sendFeedback } from 'app/_api/telemetry'
import { imageCount } from 'app/_utils/db'
import { Button } from 'app/_components/Button'
import SectionTitle from 'app/_components/SectionTitle'
import { userInfoStore } from 'app/_store/userStore'
import FlexRow from 'app/_components/FlexRow'
import PageTitle from 'app/_components/PageTitle'
import Input from 'app/_components/Input'
import Text from 'app/_components/Text'
import TextArea from 'app/_components/TextArea'

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
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>(
    'idle'
  )
  const feedbackSent = status === 'sent'
  const [contactInput, setContactInput] = useState('')
  const [inputText, setInputText] = useState('')

  const handleSubmit = async () => {
    if (status === 'sending' || status === 'sent') {
      return
    }

    setStatus('sending')
    const totalImages = await imageCount()

    const sent = await sendFeedback({
      contact: contactInput,
      stablehorde_username: userInfoStore.state.username || '',
      kudos: userInfoStore.state.kudos,
      input: inputText,
      totalImages
    })

    // On failure the message stays in the form, so it can be sent again.
    setStatus(sent ? 'sent' : 'failed')
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
        {status === 'failed' && (
          <div role="alert" className="text-red-500 mb-[8px]">
            Your message couldn&apos;t be sent. Please try again.
          </div>
        )}
        <FlexRow style={{ justifyContent: 'flex-end' }}>
          <Button
            onClick={handleSubmit}
            disabled={status === 'sending' || status === 'sent'}
          >
            {status === 'sent'
              ? 'Message sent!'
              : status === 'sending'
                ? 'Sending...'
                : 'Send Message'}
          </Button>
        </FlexRow>
      </Wrapper>
    </>
  )
}

export default FeedbackForm
