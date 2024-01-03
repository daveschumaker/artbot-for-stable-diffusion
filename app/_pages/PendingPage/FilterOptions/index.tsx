import DropdownOptions from 'app/_modules/DropdownOptions'
import Checkbox from 'app/_components/Checkbox'

export default function FilterOptions({
  filter,
  setFilter,
  jobs,
  setShowFilterDropdown
}: any) {
  const [done = [], processing = [], queued = [], waiting = [], error = []] =
    jobs

  const jobsInProgress = processing + queued

  return (
    <DropdownOptions
      handleClose={() => setShowFilterDropdown(false)}
      title="Filter jobs"
      top="46px"
      maxWidth="320px"
      style={{ left: 'unset', right: '0', width: '100%' }}
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
          label={`All (${done + processing + queued + waiting + error})`}
          checked={filter === 'all'}
          onChange={() => {
            filter === 'all' ? setFilter('all') : setFilter('all')
            setShowFilterDropdown(false)
          }}
        />
        <Checkbox
          label={`Waiting (${waiting})`}
          checked={filter === 'waiting'}
          onChange={() => {
            filter === 'waiting' ? setFilter('all') : setFilter('waiting')
            setShowFilterDropdown(false)
          }}
        />
        <Checkbox
          label={`Processing (${jobsInProgress})`}
          checked={filter === 'processing'}
          onChange={() => {
            filter === 'processing' ? setFilter('all') : setFilter('processing')
            setShowFilterDropdown(false)
          }}
        />
        <Checkbox
          label={`Done (${done})`}
          checked={filter === 'done'}
          onChange={() => {
            filter === 'done' ? setFilter('all') : setFilter('done')
            setShowFilterDropdown(false)
          }}
        />
        <Checkbox
          label={`Error (${error})`}
          checked={filter === 'error'}
          onChange={() => {
            filter === 'error' ? setFilter('all') : setFilter('error')
            setShowFilterDropdown(false)
          }}
        />
      </div>
    </DropdownOptions>
  )
}
