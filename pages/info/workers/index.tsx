import Head from 'next/head'

import SelectComponent from '../../../components/UI/Select'
import WorkerInfo from '../../../components/WorkerInfo'
import Row from '../../../components/Row'
import PageTitle from '../../../components/UI/PageTitle'
import useComponentState from '../../../hooks/useComponentState'
import { useEffectOnce } from '../../../hooks/useEffectOnce'
import SpinnerV2 from '../../../components/Spinner'
import InfoPageMenuButton from '../../../components/InfoPage/Menu'
import styles from './workers.module.css'
import { useForceUpdate } from '../../../hooks/useForceUpdate'
import Linker from '../../../components/UI/Linker'

const WorkerModelDetails = ({
  className,
  id,
  models
}: {
  className: any
  id: string
  models: any
}) => {
  const sortedModels =
    models?.sort((a: string = '', b: string = '') => {
      if (a.toLowerCase() < b.toLowerCase()) {
        return -1
      }
      if (a.toLowerCase() > b.toLowerCase()) {
        return 1
      }
      return 0
    }) ?? []

  return (
    <div className={className}>
      <div className={styles.ModalList}>
        {sortedModels.map((model: string) => {
          return (
            <li key={`${id}_${model}`}>
              <Linker href={`/info/models#${model}`} passHref>
                {model}
              </Linker>
            </li>
          )
        })}
      </div>
    </div>
  )
}

const WorkerInfoPage = () => {
  const forceUpdate = useForceUpdate()
  const [componentState, setComponentState] = useComponentState({
    showModelsForWorkerId: '',
    isLoading: true,
    showOptionsMenu: false,
    sort: 'requests_fulfilled',
    workers: []
  })

  const fetchWorkers = async () => {
    const resp = await fetch(`/artbot/api/worker-details`)
    const data = (await resp.json()) || {}
    const { workers = [] } = data

    const filteredWorkers = workers.filter((worker: any) => {
      return worker.type === 'image'
    })

    setComponentState({ workers: filteredWorkers, isLoading: false })
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

  return (
    <div className="mb-4">
      <Head>
        <title>
          Distributed Worker Details for Stable Horde - ArtBot for Stable
          Diffusion
        </title>
        <meta name="robots" content="noindex"></meta>
      </Head>
      <Row>
        <div className="inline-block w-1/2">
          <PageTitle>Worker Details</PageTitle>
        </div>
        <div className="flex flex-row justify-end w-1/2 items-start h-[38px] relative gap-2">
          <InfoPageMenuButton title="All workers" />
        </div>
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
          <div className={styles.wrapper}>
            {sortedWorkers?.map((worker: any) => {
              return (
                <>
                  <WorkerInfo
                    showModels={
                      componentState.showModelsForWorkerId === worker.id
                    }
                    showModelClick={() => {
                      if (componentState.showModelsForWorkerId !== worker.id) {
                        setComponentState({ showModelsForWorkerId: worker.id })
                        window.location.href = `#${worker.id}`
                      } else {
                        setComponentState({ showModelsForWorkerId: '' })
                      }
                    }}
                    editable={false}
                    key={worker.id}
                    worker={worker}
                    forceUpdate={forceUpdate}
                  />
                  {componentState.showModelsForWorkerId === worker.id && (
                    <WorkerModelDetails
                      className={styles['worker-details']}
                      id={worker.id}
                      models={worker.models}
                    />
                  )}
                </>
              )
            })}
          </div>
        )}
      </>
    </div>
  )
}

export default WorkerInfoPage
