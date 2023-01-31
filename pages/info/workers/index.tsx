import Head from 'next/head'
import styled from 'styled-components'

import SelectComponent from '../../../components/UI/Select'
import WorkerInfo from '../../../components/WorkerInfo'
import Row from '../../../components/Row'
import ServerMessage from '../../../components/ServerMessage'
import PageTitle from '../../../components/UI/PageTitle'
import useComponentState from '../../../hooks/useComponentState'
import { useEffectOnce } from '../../../hooks/useEffectOnce'
import SpinnerV2 from '../../../components/Spinner'
import { clientHeader } from '../../../utils/appUtils'
import InfoPageMenuButton from '../../../components/InfoPage/Menu'

const WorkersList = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 12px;
`
const WorkerInfoPage = () => {
  const [componentState, setComponentState] = useComponentState({
    isLoading: true,
    showOptionsMenu: false,
    sort: 'requests_fulfilled',
    workers: []
  })

  const fetchWorkers = async () => {
    const resp = await fetch(`https://stablehorde.net/api/v2/workers`, {
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': clientHeader()
      }
    })
    const workers = await resp.json()

    setComponentState({ workers, isLoading: false })
  }

  useEffectOnce(() => {
    fetchWorkers()
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

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'requests_fulfilled', label: 'Completed' },
    { value: 'kudos_rewards', label: 'Kudos' },
    { value: 'models', label: 'Models' },
    { value: 'speed_per', label: 'Speed' },
    { value: 'uptime', label: 'Uptime' }
  ]

  const getSortOption = () => {
    return sortOptions.filter((option) => {
      return option.value === componentState.sort
    })[0]
  }

  console.log(`getSort`, getSortOption())

  return (
    <div className="mb-4">
      <Head>
        <title>
          Distributed Worker Details for Stable Horde - ArtBot for Stable
          Diffusion
        </title>
      </Head>
      <Row>
        <div className="inline-block w-1/2">
          <PageTitle>Worker Details</PageTitle>
        </div>
        <div className="flex flex-row justify-end w-1/2 items-start h-[38px] relative gap-2">
          <InfoPageMenuButton title="All workers" />
        </div>
        <ServerMessage />
      </Row>

      <>
        <Row className="mb-2 justify-between">
          Workers online:{' '}
          {componentState.isLoading ? '...' : componentState.workers.length}
          <div className="flex flex-row gap-2 items-center">
            Sort:
            <SelectComponent
              options={[...sortOptions]}
              onChange={(obj: { value: string; label: string }) => {
                setComponentState({ sort: obj.value })
              }}
              value={getSortOption()}
            />
          </div>
        </Row>
        {componentState.isLoading && <SpinnerV2 />}
        {!componentState.isLoading && (
          <WorkersList>
            {sortedWorkers?.map((worker: any) => {
              return (
                <WorkerInfo editable={false} key={worker.id} worker={worker} />
              )
            })}
          </WorkersList>
        )}
      </>
    </div>
  )
}

export default WorkerInfoPage
