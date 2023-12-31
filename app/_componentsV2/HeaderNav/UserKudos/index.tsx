import { IconCoins, IconStack } from '@tabler/icons-react'
import { userInfoStore } from 'app/_store/userStore'
import { useStore } from 'statery'
import { useModal } from '@ebay/nice-modal-react'
import Modal from '../../Modal'
import styles from './userKudos.module.css'

export default function UserKudos() {
  const userKudosModal = useModal(Modal)
  const userState = useStore(userInfoStore)
  const { loggedIn, kudos, records = {} } = userState

  if (!loggedIn) {
    return null
  }

  function formatKudos(num: number) {
    if (num === 0) {
      return '...'
    }

    if (num < 1000) {
      return num.toString()
    } else if (num < 1000000) {
      return (num / 1000).toFixed(1) + 'K'
    } else if (num < 1000000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else {
      return (num / 1000000000).toFixed(1) + 'B'
    }
  }

  const UserDetails = () => {
    return (
      <div className="flex flex-col gap-2">
        <div className="stats bg-body-color">
          <div className="stat">
            <div className="stat-title text-input-color">
              Total Available Kudos
            </div>
            <div className="stat-value flex flex-row gap-2 items-center text-input-color">
              {kudos.toLocaleString()}
              <div className="text-secondary">
                <IconCoins />
              </div>
            </div>
          </div>
        </div>
        {records.request && (
          <div className="stats bg-body-color">
            <div className="stat">
              <div className="stat-title text-input-color">
                Images requested
              </div>
              <div className="stat-value flex flex-row gap-2 items-center text-input-color">
                {records.request.image.toLocaleString()}
                <div className=" text-secondary">
                  <IconStack />
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="text-xs italic">
          Due to server caching, data may be a few minutes out of date.
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-none">
        <button
          // className={`btn btn-sm btn-ghost normal-case h-[30px] px-[4px] sm:text-xs`}
          className={styles.UserKudos}
          onClick={() => {
            userKudosModal.show({
              content: <UserDetails />,
              maxWidth: 'max-w-[480px]'
              // title: 'AI Horde Performance'
            })
          }}
        >
          <IconCoins stroke={1} size={20} />
          {formatKudos(kudos)}
        </button>
      </div>
    </>
  )
}
