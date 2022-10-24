import { useRouter } from 'next/router'
import styled from 'styled-components'

import { colors } from '../styles/colors'
import CreateIcon from '../components/icons/CreateIcon'
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

interface StyledFooterProps {
  isPwa: boolean
}

interface NavIconWrapperProps {
  active: boolean
}

const StyledFooter = styled.div<StyledFooterProps>`
  background-color: black;
  background-color: #282828;
  border-top: 1px solid gray;
  position: fixed;
  bottom: 0;
  display: flex;
  height: 68px;
  left: 0;
  padding-bottom: 16px;
  right: 0;
  z-index: 10;

  ${(props) =>
    props.isPwa &&
    `
      height: 100px;
      padding-bottom: calc(1rem + env(safe-area-inset-bottom));
    `}

  @media (min-width: 640px) {
    display: none;
  }
`

const NavIcons = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  /* padding-top: 16px; */
  justify-content: space-around;
  width: 100%;
`

const NavIconWrapper = styled.div<NavIconWrapperProps>`
  align-items: center;
  border-top: 4px solid ${colors['background']};
  display: flex;
  justify-content: center;
  height: 51px;
  padding-top: 8px;
  width: 40px;

  ${(props) =>
    props.active &&
    `
      border-top: 4px solid ${colors['teal']};
    `}
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

  // if (!isPwa) {
  //   return null
  // }

  return (
    <StyledFooter isPwa={isPwa}>
      <NavIcons>
        <NavIconWrapper active={isActive('/')}>
          <Link href="/">
            <a>
              <CreateIcon
                size={32}
                stroke={isActive('/') ? '#14B8A6' : 'white'}
              />
            </a>
          </Link>
        </NavIconWrapper>
        <NavIconWrapper active={isActive('/pending')}>
          <Link href="/pending">
            <a>
              <HourglassIcon
                size={32}
                stroke={isActive('/pending') ? '#14B8A6' : 'white'}
              />
            </a>
          </Link>
        </NavIconWrapper>
        <NavIconWrapper active={isActive('/images')}>
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
        </NavIconWrapper>
        <NavIconWrapper active={isActive('/about')}>
          <Link href="/about">
            <a>
              <HelpIcon
                size={32}
                stroke={isActive('/about') ? '#14B8A6' : 'white'}
              />
            </a>
          </Link>
        </NavIconWrapper>
        <NavIconWrapper active={isActive('/settings')}>
          <Link href="/settings">
            <a>
              <SettingsIcon
                size={32}
                stroke={isActive('/settings') ? '#14B8A6' : 'white'}
              />
            </a>
          </Link>
        </NavIconWrapper>
      </NavIcons>
    </StyledFooter>
  )
}
