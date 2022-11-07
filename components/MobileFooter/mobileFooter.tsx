import { useRouter } from 'next/router'
import styled, { css } from 'styled-components'

import { colors } from '../../styles/variables'
import CreateIcon from '../icons/CreateIcon'
import HourglassIcon from '../icons/HourglassIcon'
import PhotoIcon from '../icons/PhotoIcon'
import SettingsIcon from '../icons/SettingsIcon'
import Link from 'next/link'
import HelpIcon from '../icons/HelpIcon'
import { useEffect, useState } from 'react'
import { isInstalledPwa } from '../../utils/appUtils'
import { useStore } from 'statery'
import {
  appInfoStore,
  setNewImageReady,
  setShowImageReadyToast
} from '../../store/appStore'

interface StyledFooterProps {
  isPwa: boolean
}

interface NavIconWrapperProps {
  active: boolean
}

const StyledFooter = styled.div<StyledFooterProps>`
  background-color: ${(props) => props.theme.body};
  border-top: 1px solid ${(props) => props.theme.text};
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
      height: 76px;
      padding-bottom: calc(24px + env(safe-area-inset-bottom));
    `}

  @media (min-width: 640px) {
    display: none;
  }
`

const NavIcons = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
`

const NavIconWrapper = styled.div<NavIconWrapperProps>`
  align-items: center;
  border-top: 4px solid transparent;
  color: black;
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

interface IconProps {
  active?: boolean
}

const IconCss = css<IconProps>`
  stroke: ${(props) => props.theme.text};

  ${(props) =>
    props.active &&
    `
    stroke: ${props.theme.navLinkActive};
  `}
`

const StyledCreateIcon = styled(CreateIcon)`
  ${IconCss}
`

const StyledHourglassIcon = styled(HourglassIcon)`
  ${IconCss}
`
const StyledPhotoIcon = styled(PhotoIcon)`
  ${IconCss}
`
const StyledHelpIcon = styled(HelpIcon)`
  ${IconCss}
`

const StyledSettingsIcon = styled(SettingsIcon)`
  ${IconCss}
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

  const handleForceReload = () => {
    if ('/images' === pathname) {
      window.location.reload()
    }
  }

  useEffect(() => {
    setIsPwa(isInstalledPwa())
  }, [])

  return (
    <StyledFooter isPwa={isPwa}>
      <NavIcons>
        <Link href="/">
          <NavIconWrapper active={isActive('/')}>
            <StyledCreateIcon size={32} active={isActive('/')} />
          </NavIconWrapper>
        </Link>
        <Link href="/pending">
          <NavIconWrapper active={isActive('/pending')}>
            <StyledHourglassIcon size={32} active={isActive('/pending')} />
          </NavIconWrapper>
        </Link>
        <NavIconWrapper active={isActive('/images')}>
          <Link
            href="/images"
            className="relative"
            onClick={() => {
              handleForceReload()
              setShowImageReadyToast(false)
              setNewImageReady('')
            }}
          >
            {newImageReady && (
              <span className="opacity-1 inline-block w-3 h-3 mr-1 bg-red-600 rounded-full absolute l-[4px]"></span>
            )}
            <StyledPhotoIcon size={32} active={isActive('/images')} />
          </Link>
        </NavIconWrapper>
        <NavIconWrapper active={isActive('/about')}>
          <Link href="/about">
            <StyledHelpIcon size={32} active={isActive('/about')} />
          </Link>
        </NavIconWrapper>
        <NavIconWrapper active={isActive('/settings')}>
          <Link href="/settings">
            <StyledSettingsIcon size={32} active={isActive('/settings')} />
          </Link>
        </NavIconWrapper>
      </NavIcons>
    </StyledFooter>
  )
}
