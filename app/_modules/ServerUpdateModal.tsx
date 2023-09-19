import { baseHost, basePath } from 'BASE_PATH'
import { trackEvent } from 'app/_api/telemetry'

const ServerUpdateModal = ({}) => {
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
      <div
        className="relative z-[100] opacity-100"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="fixed inset-0 z-20 overflow-y-auto">
          <div className="mx-auto mt-4 w-[320px] md:w-[480px] relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3
                    className="text-lg font-medium leading-6 text-gray-900"
                    id="modal-title"
                  >
                    Server updated
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Please reload this page to ensure that you&apos;re using
                      the latest features and fixes. Thank you!
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
        </div>
      </div>
    </>
  )
}

export default ServerUpdateModal
