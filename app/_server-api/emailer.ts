require('dotenv').config()
import nodemailer from 'nodemailer'

interface EmailOptions {
  from?: string
  to?: string
  subject: string
  text?: string
  html?: string
}

export const sendEmail = async (options: EmailOptions) => {
  if (
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PW ||
    !process.env.EMAIL_TO ||
    !process.env.EMAIL_HOST
  ) {
    return
  }

  try {
    // Create a transporter object using SMTP transport
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // replace with your SMTP host
      port: 587, // replace with your SMTP port, common ones are 587, 465, 25
      secure: false, // true for 465 (SSL), false for other ports
      auth: {
        user: process.env.EMAIL_USER, // replace with your SMTP username/email
        pass: process.env.EMAIL_PW // replace with your SMTP password
      }
    })

    options.from = process.env.EMAIL_USER as string
    options.to = process.env.EMAIL_TO as string

    // Send mail with defined transport object
    await transporter.sendMail(options)
  } catch (error) {
    console.error('Error occurred while sending email', error)
  }
}
