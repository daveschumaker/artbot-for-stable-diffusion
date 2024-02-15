import { IconRefresh, IconShare } from '@tabler/icons-react'
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu'
import '@szhsin/react-menu/dist/index.css'
import '@szhsin/react-menu/dist/transitions/slide.css'

import clsx from 'clsx'
import { showSuccessToast } from 'app/_utils/notificationUtils'
import styles from './component.module.css'
import useShare from '../../hooks/useShare'
import CreateImageRequestV2 from 'app/_data-models/v2/CreateImageRequestV2'

export default function ShortlinkButton({
  imageDetails
}: {
  imageDetails: CreateImageRequestV2
}) {
  const [shortlinkPending, getShortlink] = useShare()

  return (
    <div
      className={clsx(
        styles['button-icon'],
        shortlinkPending && styles.buttonLoading
      )}
    >
      <Menu
        menuButton={
          <MenuButton>
            {shortlinkPending && (
              <IconRefresh className={styles.spinner} stroke={1.5} />
            )}
            {!shortlinkPending && <IconShare stroke={1.5} />}
          </MenuButton>
        }
        transition
        menuClassName={styles['menu']}
      >
        <MenuItem
          className="text-sm"
          onClick={async () => {
            getShortlink()
          }}
        >
          {imageDetails.shortlink ? 'Copy ' : 'Create '}
          shareable link
        </MenuItem>
        <MenuItem
          className="text-sm"
          disabled={imageDetails.showcaseRequested}
          onClick={async () => {
            if (!imageDetails.showcaseRequested) {
              getShortlink({ showcase: true })
            } else {
              showSuccessToast({
                message: 'Community showcase request sent!'
              })
            }
          }}
        >
          {!imageDetails.showcaseRequested
            ? 'Request showcase consideration'
            : 'Community showcase requested'}
        </MenuItem>
      </Menu>
    </div>
  )
}
