'use client'
import FeedbackForm from 'app/_modules/FeedbackForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - ArtBot for Stable Diffusion',
  openGraph: {
    type: 'website',
    url: 'https://tinybots.net/artbot',
    title: 'ArtBot - Contact Form',
    images: [
      {
        url: '/artbot/robots_communicating.jpg'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@davely',
    images: '/artbot/robots_communicating.jpg'
  }
}

const ContactPage = () => {
  return (
    <>
      <div className="max-w-[512px]">
        <FeedbackForm isContactPage />
      </div>
    </>
  )
}

export default ContactPage
