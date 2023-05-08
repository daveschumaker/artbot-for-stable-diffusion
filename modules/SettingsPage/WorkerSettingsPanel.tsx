import SpinnerV2 from 'components/Spinner'
import Linker from 'components/UI/Linker'
import PageTitle from 'components/UI/PageTitle'
import Section from 'components/UI/Section'
import WorkerInfo from 'components/WorkerInfo'
import ExternalLinkIcon from 'components/icons/ExternalLinkIcon'
import { useStore } from 'statery'
import { userInfoStore } from 'store/userStore'

const WorkerSettingsPanel = ({ componentState, setComponentState }: any) => {
  const userStore = useStore(userInfoStore)
  const { workers, worker_ids = [] } = userStore

  return (
    <>
      <Section>
        <PageTitle as="h2">Manage Workers</PageTitle>
        {componentState.apiKey && worker_ids === null ? <SpinnerV2 /> : null}
        {(Array.isArray(worker_ids) && worker_ids.length === 0) ||
        !componentState.apiKey ? (
          <>
            <Section>
              You currently have no active workers on Stable Horde.
            </Section>
            <Section>
              <Linker
                href="https://bit.ly/SimpleHordeColab"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex flex-row items-center gap-2">
                  Create your own Stable Horde worker using Google Colab.{' '}
                  <ExternalLinkIcon />
                </div>
              </Linker>
            </Section>
          </>
        ) : null}
        <Section className="flex flex-col gap-2">
          {Object.keys(workers).map((key) => {
            const worker = workers[key]

            return (
              <WorkerInfo
                key={worker.id}
                loadingWorkerStatus={componentState.loadingWorkerStatus}
                setComponentState={setComponentState}
                worker={worker}
                workers={workers}
              />
            )
          })}
        </Section>
      </Section>
    </>
  )
}

export default WorkerSettingsPanel
