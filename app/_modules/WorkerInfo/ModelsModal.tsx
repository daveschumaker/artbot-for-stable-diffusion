import InteractiveModal from 'app/_components/InteractiveModal/interactiveModal'
import Linker from 'app/_components/Linker'
import PageTitle from 'app/_components/PageTitle'

const ModelsModal = ({
  handleClose = () => {},
  models = [],
  workerName
}: {
  handleClose: () => any
  models: Array<any>
  workerName: string
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
    <InteractiveModal handleClose={handleClose} maxWidth="512px">
      <PageTitle>Available models</PageTitle>
      <div style={{ fontSize: '14px', marginTop: '-8px', marginBottom: '8px' }}>
        Models served by {workerName}
      </div>
      <div>
        <ul
          style={{
            position: 'absolute',
            bottom: '6px',
            overflowY: 'auto',
            top: '58px',
            width: '100%'
          }}
        >
          {sortedModels.map((model: string) => {
            return (
              <li key={`${model}`}>
                <Linker href={`/info/models#${model}`} passHref>
                  {model}
                </Linker>
              </li>
            )
          })}
        </ul>
      </div>
    </InteractiveModal>
  )
}

export default ModelsModal
