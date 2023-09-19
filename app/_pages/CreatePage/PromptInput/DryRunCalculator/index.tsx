import { createImage } from 'app/_api/createImage'
import SpinnerV2 from 'app/_components/Spinner'
import { useEffect, useState } from 'react'

export default function DryRunCalculator({
  input,
  totalImagesRequested
}: {
  input: any
  totalImagesRequested: number
}) {
  const [kudos, setKudos] = useState(0)
  const [loading, setLoading] = useState(true)

  const requestCalculation = async (params: any) => {
    const data = await createImage(params)

    if (data && data.kudos) {
      setKudos(data.kudos)
      setLoading(false)
    }
  }

  useEffect(() => {
    const imageParams = Object.assign({}, input, { dry_run: true })
    requestCalculation(imageParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ fontSize: '12px', padding: '4px 0' }}>
      {loading && <SpinnerV2 size={24} />}
      {!loading && (
        <>
          <div style={{ paddingBottom: '8px' }}>
            <div>
              Estimated cost per image: <strong>{kudos} kudos</strong>
            </div>
            <div>
              Total cost: <strong>{kudos * totalImagesRequested} kudos</strong>
            </div>
          </div>
          <div style={{ fontSize: '12px' }}>(Cost fetched via AI Horde)</div>
        </>
      )}
    </div>
  )
}
