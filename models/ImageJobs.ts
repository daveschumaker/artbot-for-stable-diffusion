/**
 * Store recently completed jobs in LocalStorage for easier lookup and access.
 */

import LocalStorageController from '../controllers/LocalStorageController'

const ImageJobs = new LocalStorageController({
  name: 'RecentJobs',
  version: 1
})

ImageJobs.init()

export default ImageJobs
