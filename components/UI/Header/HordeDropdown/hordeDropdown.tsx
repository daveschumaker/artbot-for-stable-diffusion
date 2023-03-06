import { useStore } from 'statery'
import { appInfoStore } from '../../../../store/appStore'

const HordeDropdown = () => {
  const appStore = useStore(appInfoStore)
  const {
    hordePerformance = {
      queued_requests: 0,
      queued_megapixelsteps: 0
    }
  }: { hordePerformance: any } = appStore
  let stepsPerRequest: number = 0
  let requestsPerMinute: number = 0
  let minutesToClear: number = 0

  if (hordePerformance.queued_requests) {
    stepsPerRequest =
      hordePerformance.queued_megapixelsteps / hordePerformance.queued_requests
    requestsPerMinute =
      hordePerformance.past_minute_megapixelsteps / stepsPerRequest
    minutesToClear =
      hordePerformance.queued_megapixelsteps /
      hordePerformance.past_minute_megapixelsteps
  }

  return (
    <div className="p-[12px] w-[400px] text-[14px]">
      <div className="font-[700] mb-[8px]">Stable Horde Performance</div>
      <div>
        <strong>{hordePerformance.queued_requests.toLocaleString()}</strong>{' '}
        pending image requests (
        <strong>
          {Math.floor(hordePerformance.queued_megapixelsteps).toLocaleString()}{' '}
          megapixelsteps
        </strong>
        )
      </div>
      <div>
        <strong>{hordePerformance.worker_count}</strong> workers online, running{' '}
        <strong>{hordePerformance.thread_count}</strong> threads
      </div>
      <div className="mt-[8px]">
        <strong>
          {Math.floor(hordePerformance.queued_forms.toLocaleString())}
        </strong>{' '}
        pending interrogation requests
      </div>
      <div>
        <strong>{hordePerformance.interrogator_count}</strong> interrogation
        workers online, running{' '}
        <strong>{hordePerformance.interrogator_thread_count}</strong> threads
      </div>
      <div className="mt-[8px]">
        Currently processing about{' '}
        <strong>{Math.floor(requestsPerMinute)}</strong> image requests per
        minute (
        <strong>
          {Math.floor(
            hordePerformance.past_minute_megapixelsteps
          ).toLocaleString()}{' '}
          megapixelsteps
        </strong>
        ). At this rate, it will take approximately{' '}
        <strong>{Math.floor(minutesToClear)}</strong> minutes to clear the
        queue.
      </div>
    </div>
  )
}

export default HordeDropdown
