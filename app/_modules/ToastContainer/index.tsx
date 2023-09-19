'use client'

// Handle isse with newer versions of NextJS (v13.4+)
// Via: https://github.com/fkhadra/react-toastify/issues/951

import dynamic from 'next/dynamic'
import 'react-toastify/dist/ReactToastify.css'

const DynamicToastContainer = dynamic(
  () => import('react-toastify').then((module) => module.ToastContainer),
  {
    ssr: false
  }
)

const ToastContainer = (props: any) => <DynamicToastContainer {...props} />

export default ToastContainer
