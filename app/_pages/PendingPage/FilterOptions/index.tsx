import DropdownOptions from 'app/_modules/DropdownOptions'
import Checkbox from 'components/UI/Checkbox'

export default function FilterOptions({
  filter,
  setFilter,
  jobs,
  jobCount,
  setShowFilterDropdown
}: any) {
  const [done = [], processing = [], queued = [], waiting = [], error = []] =
    jobs

  const jobsInProgress = processing.length + queued.length

  return (
    <DropdownOptions
      handleClose={() => setShowFilterDropdown(false)}
      title="Filter jobs"
      top="46px"
      maxWidth="320px"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          rowGap: '8px',
          padding: '8px 0'
        }}
      >
        <Checkbox
          label={`All (${jobCount})`}
          checked={filter === 'all'}
          onChange={() =>
            filter === 'all' ? setFilter('all') : setFilter('all')
          }
        />
        <Checkbox
          label={`Waiting (${waiting.length})`}
          checked={filter === 'waiting'}
          onChange={() =>
            filter === 'waiting' ? setFilter('all') : setFilter('waiting')
          }
        />
        <Checkbox
          label={`Processing (${jobsInProgress})`}
          checked={filter === 'processing'}
          onChange={() =>
            filter === 'processing' ? setFilter('all') : setFilter('processing')
          }
        />
        <Checkbox
          label={`Done (${done.length})`}
          checked={filter === 'done'}
          onChange={() =>
            filter === 'done' ? setFilter('all') : setFilter('done')
          }
        />
        <Checkbox
          label={`Error (${error.length})`}
          checked={filter === 'error'}
          onChange={() =>
            filter === 'error' ? setFilter('all') : setFilter('error')
          }
        />
      </div>
    </DropdownOptions>
  )
}
