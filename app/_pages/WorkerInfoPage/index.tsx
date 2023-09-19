import styled from 'styled-components'
import useComponentState from 'app/_hooks/useComponentState'
import { useEffectOnce } from 'app/_hooks/useEffectOnce'
import { clientHeader } from 'app/_utils/appUtils'
import Select from 'app/_components/Select'
import Row from 'app/_modules/Row'
import WorkerInfo from 'app/_modules/WorkerInfo'

const WorkersList = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 12px;
`

const WorkerInfoPage = () => {
  const [componentState, setComponentState] = useComponentState({
    isLoading: true,
    sort: 'uptime',
    workers: []
  })

  const fetchWorkers = async () => {
    const resp = await fetch(`https://aihorde.net/api/v2/workers`, {
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': clientHeader()
      }
    })
    const workers = await resp.json()

    setComponentState({ workers })
  }

  useEffectOnce(() => {
    fetchWorkers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })

  const sortedWorkers = componentState.workers.sort((a: any, b: any) => {
    if (componentState.sort === 'models') {
      const aCount = a.models.length
      const bCount = b.models.length

      if (aCount < bCount) {
        return 1
      }
      if (aCount > bCount) {
        return -1
      }

      return 0
    }

    if (componentState.sort === 'speed_per') {
      const aSpeed =
        a.requests_fulfilled > 0
          ? Number(a.uptime / a.requests_fulfilled)
          : Infinity
      const bSpeed =
        b.requests_fulfilled > 0
          ? Number(b.uptime / b.requests_fulfilled)
          : Infinity

      if (aSpeed < bSpeed) {
        return -1
      }
      if (aSpeed > bSpeed) {
        return 1
      }

      return 0
    }

    if (componentState.sort === 'name') {
      if (a[componentState.sort] < b[componentState.sort]) {
        return -1
      }
      if (a[componentState.sort] > b[componentState.sort]) {
        return 1
      }

      return 0
    } else {
      if (a[componentState.sort] < b[componentState.sort]) {
        return 1
      }
      if (a[componentState.sort] > b[componentState.sort]) {
        return -1
      }

      return 0
    }
  })

  return (
    <>
      <Row className="mb-2 justify-between">
        Workers online: {componentState.workers.length}
        <div className="flex flex-row gap-2 items-center">
          Sort:
          <Select
            options={[
              { value: 'name', label: 'Name' },
              { value: 'requests_fulfilled', label: 'Completed' },
              { value: 'kudos_rewards', label: 'Kudos' },
              { value: 'models', label: 'Models' },
              { value: 'speed_per', label: 'Speed' },
              { value: 'uptime', label: 'Uptime' }
            ]}
            onChange={(obj: { value: string; label: string }) => {
              setComponentState({ sort: obj.value })
            }}
          />
        </div>
      </Row>
      <WorkersList>
        {sortedWorkers?.map((worker: any) => {
          return <WorkerInfo editable={false} key={worker.id} worker={worker} />
        })}
      </WorkersList>
    </>
  )
}

export default WorkerInfoPage
