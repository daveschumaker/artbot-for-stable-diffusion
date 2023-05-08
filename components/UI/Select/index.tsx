import React from 'react'
import dynamic from 'next/dynamic'
import { SelectPropsComponent } from 'types'

// const DynamicSelect = React.lazy(() => import('./select'))

// const Fallback = () => {
//   return (
//     <div
//       className="flex flex-row w-full bg-white h-[38px] items-center px-[12px] rounded"
//       style={{
//         backgroundColor: `var(--input-background)`,
//         border: `1px solid var(--input-text)`,
//         color: `#9299a6`
//       }}
//     >
//       Loading...
//     </div>
//   )
// }

const DynamicDropDownMenuItem = dynamic(() => import('./select'), {
  ssr: false
})

export default function Select(props: SelectPropsComponent) {
  return (
    <div className="grow">
      <DynamicDropDownMenuItem {...props} />
    </div>
  )
}

// function Select(props: SelectPropsComponent) {
//   return (
//     <Suspense fallback={<Fallback />}>
//       <div className="grow">
//         <DynamicSelect {...props} />
//       </div>
//     </Suspense>
//   )
// }

// export default Select
