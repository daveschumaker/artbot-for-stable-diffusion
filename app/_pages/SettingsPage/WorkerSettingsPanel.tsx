import SpinnerV2 from 'app/_components/Spinner'
import Linker from 'app/_components/Linker'
import PageTitle from 'app/_components/PageTitle'
import Section from 'app/_components/Section'
import { useStore } from 'statery'
import { userInfoStore } from 'app/_store/userStore'
import { IconExternalLink } from '@tabler/icons-react'
import WorkerInfo from 'app/_modules/WorkerInfo'

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
            <Section pb={12}>
              You currently have no active workers on AI Horde.
            </Section>
            <Section>
              You can help contribute to the AI Horde by running your own AI
              Horde worker. Join the Horde using{' '}
              <Linker
                href="https://github.com/Haidra-Org/Simple-AI-Horde-Colab"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex flex-row items-center">
                  this Colab notebook (
                  <IconExternalLink stroke={1.5} size={18} />)
                </div>
              </Linker>{' '}
              or downloading a worker to{' '}
              <Linker
                href="https://github.com/Haidra-Org/AI-Horde-Worker"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex flex-row items-center">
                  run on your GPU (
                  <IconExternalLink stroke={1.5} size={18} />)
                </div>
              </Linker>
              .
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
