import { useRouter } from 'next/router'

import CreateIcon from '../components/icons/CreateIcon'
import styled from 'styled-components'
import HourglassIcon from './icons/HourglassIcon'
import PhotoIcon from './icons/PhotoIcon'
import SettingsIcon from './icons/SettingsIcon'
import Link from 'next/link'

const StyledFooter = styled.div`
  background-color: black;
  background-color: #282828;
  border-top: 1px solid gray;
  position: fixed;
  bottom: 0;
  display: flex;
  height: 68px;
  left: 0;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
  right: 0;

  @media (min-width: 768px) {
    display: none;
  }
`

const NavIcons = styled.div`
  align-items: center;
  bottom: calc(1rem + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
`

export default function MobileFooter() {
  const router = useRouter()
  const { pathname } = router

  const isActive = (path = '') => {
    return `${path}` === pathname
  }

  return (
    <StyledFooter>
      <NavIcons>
        <Link href="/">
          <a>
            <CreateIcon
              size={32}
              stroke={isActive('/') ? '#14B8A6' : 'white'}
            />
          </a>
        </Link>
        <Link href="/pending">
          <a>
            <HourglassIcon
              size={32}
              stroke={isActive('/pending') ? '#14B8A6' : 'white'}
            />
          </a>
        </Link>
        <Link href="/images">
          <a>
            <PhotoIcon
              size={32}
              stroke={isActive('/images') ? '#14B8A6' : 'white'}
            />
          </a>
        </Link>
        <Link href="/settings">
          <a>
            <SettingsIcon
              size={32}
              stroke={isActive('/settings') ? '#14B8A6' : 'white'}
            />
          </a>
        </Link>
      </NavIcons>
    </StyledFooter>
  )
}
