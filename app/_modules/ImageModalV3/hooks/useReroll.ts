import { useCallback, useContext, useState } from 'react'
import { ImageDetailsContext } from '../ImageDetailsProvider'
import { showErrorToast, showSuccessToast } from 'app/_utils/notificationUtils'
import { rerollImage } from 'app/_controllers/imageDetailsCommon'
import NiceModal from '@ebay/nice-modal-react'

type UseRerollReturnType = [boolean, () => Promise<void>]

export default function useReroll(): UseRerollReturnType {
  const context = useContext(ImageDetailsContext)
  const { imageDetails } = context

  const [rerollPending, setRerollPending] = useState(false)

  const onRerollClick = useCallback(async () => {
    if (rerollPending) {
      return
    }

    setRerollPending(true)

    const reRollStatus = await rerollImage(imageDetails)

    const { success } = reRollStatus

    if (success) {
      setRerollPending(false)
      showSuccessToast({ message: 'Re-rolling and requesting new image' })
      NiceModal.remove('image-modal')
    } else {
      showErrorToast({ message: 'Unable to reroll image' })
      console.log(`Error: Unable to reroll image.`)
      setRerollPending(false)
    }
  }, [imageDetails, rerollPending])

  return [rerollPending, onRerollClick]
}
