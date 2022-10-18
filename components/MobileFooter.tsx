import { useRouter } from 'next/router'

import CreateIcon from '../components/icons/CreateIcon'
import styled from 'styled-components'
import HourglassIcon from './icons/HourglassIcon'
import PhotoIcon from './icons/PhotoIcon'
import SettingsIcon from './icons/SettingsIcon'
import Link from 'next/link'
import HelpIcon from './icons/HelpIcon'
import { useEffect, useState } from 'react'
import { isInstalledPwa } from '../utils/appUtils'
import { useStore } from 'statery'
import {
  appInfoStore,
  setNewImageReady,
  setShowImageReadyToast
} from '../store/appStore'

const StyledFooter = styled.div`
  background-color: black;
  background-color: #282828;
  border-top: 1px solid gray;
  position: fixed;
  bottom: 0;
  display: flex;
  height: 100px;
  left: 0;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
  right: 0;

  @media (min-width: 640px) {
    display: none;
  }
`

const NavIcons = styled.div`
  align-items: start;
  /* bottom: calc(1rem + env(safe-area-inset-bottom)); */
  display: flex;
  flex-direction: row;
  padding-top: 16px;
  justify-content: space-around;
  width: 100%;
`

export default function MobileFooter() {
  const router = useRouter()
  const { pathname } = router

  const appState = useStore(appInfoStore)
  const { newImageReady } = appState

  const [isPwa, setIsPwa] = useState(false)

  const isActive = (path = '') => {
    return `${path}` === pathname
  }

  useEffect(() => {
    setIsPwa(isInstalledPwa())
  }, [])

  if (!isPwa) {
    return null
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
          <a
            className="relative"
            onClick={() => {
              setShowImageReadyToast(false)
              setNewImageReady('')
            }}
          >
            {newImageReady && (
              <span className="opacity-1 inline-block w-3 h-3 mr-1 bg-red-600 rounded-full absolute l-[4px]"></span>
            )}
            <PhotoIcon
              size={32}
              stroke={isActive('/images') ? '#14B8A6' : 'white'}
            />
          </a>
        </Link>
        <Link href="/faq">
          <a>
            <HelpIcon
              size={32}
              stroke={isActive('/faq') ? '#14B8A6' : 'white'}
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
