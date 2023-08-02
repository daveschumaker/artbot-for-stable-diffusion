import { baseHost, basePath } from 'BASE_PATH'
import { trackEvent } from '../api/telemetry'

const ServerUpdateComponent = ({}) => {
  const changelogClick = () => {
    trackEvent({
      event: 'SERVER_UPDATE_CHANGELOG_CLICK'
    })
    window.location.assign(`${baseHost}${basePath}/changelog`)
  }

  const reloadPageClick = () => {
    trackEvent({
      event: 'SERVER_UPDATE_RELOAD_CLICK'
    })
    window.location.reload()
  }

  return (
    <>
      <div className="mx-auto my-2 w-full md:w-[480px] relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:w-full sm:max-w-lg">
        <div className="bg-white px-4 pt-2 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3
                className="text-lg font-medium leading-6 text-gray-900"
                id="modal-title"
              >
                ArtBot updated
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Please reload this page at your soonest convenience to ensure
                  that you&apos;re using the latest features and fixes. Thank
                  you!
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button
            type="button"
            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={reloadPageClick}
          >
            Reload page
          </button>
          <button
            type="button"
            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={changelogClick}
          >
            View changelog
          </button>
        </div>
      </div>
    </>
  )
}

export default ServerUpdateComponent
