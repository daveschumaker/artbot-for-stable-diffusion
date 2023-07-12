import React from 'react'

const Loader = () => <div></div>

export default function ModelDetails({ models }: { models: Array<string> }) {
  // set the initial state to something that can be rendered on server
  const [Component, setComponent] = React.useState(() => Loader)

  // once on the browser, dynamically import the component
  React.useEffect(() => {
    // @ts-ignore
    setComponent(() => React.lazy(() => import('./modelDetails')))
  }, [])

  // Suspense is necessary for rendering async/dynamically improrted components
  return (
    <React.Suspense fallback={<Loader />}>
      <Component
        // @ts-ignore
        models={models}
      />
    </React.Suspense>
  )
}
