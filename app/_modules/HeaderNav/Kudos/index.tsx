import { IconCoins } from '@tabler/icons-react'
import FlexRow from 'app/_components/FlexRow'
import { userInfoStore } from 'app/_store/userStore'
import { useStore } from 'statery'
import styles from './kudos.module.css'
import TooltipComponent from 'app/_components/TooltipComponent'

export default function Kudos() {
  const userState = useStore(userInfoStore)
  const { kudos, loggedIn } = userState

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

  return (
    <FlexRow
      className={styles.Wrapper}
      gap={6}
      style={{
        cursor: 'pointer',
        width: 'unset'
      }}
      id="kudos-navbar"
    >
      <IconCoins stroke={1} size={20} />
      {formatKudos(kudos)}
      <TooltipComponent hideIcon openOnClick tooltipId="kudos-navbar">
        <p>Currently available kudos associated with your AI Horde account.</p>
        <p>
          Total: <strong>{kudos.toLocaleString()}</strong> kudos
        </p>
        <p>
          <span style={{ fontSize: '10px' }}>
            <em>
              Due to server caching, data may be a few minutes out of date.
            </em>
          </span>
        </p>
      </TooltipComponent>
    </FlexRow>
  )
}
