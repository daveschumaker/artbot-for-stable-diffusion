import { useState } from 'react'
import styled from 'styled-components'

import { trackEvent } from '../api/telemetry'
import { imageCount } from '../utils/db'
import { Button } from './UI/Button'
import Modal from './Modal'
import SectionTitle from './UI/SectionTitle'
import Text from './UI/Text'
import TextArea from './UI/TextArea'

const FlexRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`

const Wrapper = styled.div`
  color: ${(props) => props.theme.text};
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  position: relative;
`

const StyledTextArea = styled(TextArea)`
  padding: 8px;
  margin-bottom: 8px;
  max-height: 120px;
  width: 100%;
`

const FeedbackSuccess = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  height: 120px;
  width: 100%;
`

const FeedbackModal = ({ handleClose }: { handleClose: () => void }) => {
  const [feedbackSent, setFeedbackSent] = useState(false)
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
          <FeedbackSuccess>
            Your message has been sent. Thank you!
          </FeedbackSuccess>
        )}
        {!feedbackSent && (
          <StyledTextArea
            maxLength={1024}
            onChange={(e) => setInputText(e.target.value)}
            value={inputText}
          />
        )}
        <FlexRow>
          <Button onClick={handleSubmit} disabled={feedbackSent}>
            {feedbackSent ? 'Message sent!' : 'Send Message'}
          </Button>
        </FlexRow>
      </Wrapper>
    </Modal>
  )
}

export default FeedbackModal
