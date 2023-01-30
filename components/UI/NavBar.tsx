/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useStore } from 'statery'
import styled from 'styled-components'

import {
  appInfoStore,
  setNewImageReady,
  setShowImageReadyToast
} from '../../store/appStore'

import IconCreate from '../icons/CreateIcon'
import HourglassIcon from '../icons/HourglassIcon'
import InfoIcon from '../icons/InfoIcon'
import PhotoIcon from '../icons/PhotoIcon'
import PhotoPlusIcon from '../icons/PhotoPlusIcon'
import SettingsIcon from '../icons/SettingsIcon'
import StarsIcon from '../icons/StarsIcon'
import ZoomQuestionIcon from '../icons/ZoomQuestionIcon'

const StyledNavBar = styled.nav`
  display: none;

  @media (min-width: 640px) {
    border-bottom: 1px solid ${(props) => props.theme.border};
    color: white;
    display: flex;
    font-size: 14px;
    justify-content: flex-start;
    margin-bottom: 16px;
    width: 100%;
  }
`

const StyledUl = styled.ul`
  display: flex;
  flex-direction: row;
`

interface LiProps {
  active: boolean
}

const StyledLi = styled.li<LiProps>`
  border-bottom: 2px solid transparent;
  color: ${(props) => props.theme.navLinkNormal};
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  text-align: left;

  &:hover {
    color: ${(props) => props.theme.navLinkActive};
    border-bottom: 2px solid ${(props) => props.theme.navLinkActive};
  }

  ${(props) =>
    props.active &&
    `
    color: ${props.theme.navLinkActive};
    border-bottom: 2px solid  ${props.theme.navLinkActive};
  `}
`

export default function NavBar() {
  const router = useRouter()
  const { pathname } = router

  const appState = useStore(appInfoStore)
  const { newImageReady } = appState

  const clearNewImageNotification = () => {
    setShowImageReadyToast(false)
    setNewImageReady('')
  }

  const handleForceReload = () => {
    if ('/images' === pathname) {
      window.location.reload()
    }
  }

  const isActiveRoute = (page: string) => {
    if (page === pathname) {
      return true
    }

    return false
  }

  return (
    <StyledNavBar>
      <StyledUl>
        <StyledLi active={isActiveRoute('/')}>
          <Link href="/" passHref>
            <IconCreate className="inline-block mr-1 pb-1" />
            Create
          </Link>
        </StyledLi>
        <StyledLi active={isActiveRoute('/interrogate')}>
          <Link href="/interrogate" passHref>
            <ZoomQuestionIcon className="inline-block mr-1 pb-1" />
            Interrogate
          </Link>
        </StyledLi>
        <StyledLi active={isActiveRoute('/rate')}>
          <Link href="/rate" passHref>
            <StarsIcon className="inline-block mr-1 pb-1" />
            Rate
          </Link>
        </StyledLi>
        <StyledLi active={isActiveRoute('/pending')}>
          <Link href="/pending" passHref>
            <HourglassIcon className="inline-block mr-[2-px] pb-1" />
            Pending
          </Link>
        </StyledLi>

        <StyledLi active={isActiveRoute('/images')}>
          <Link
            href="/images"
            passHref
            onClick={() => {
              clearNewImageNotification()
              handleForceReload()
            }}
          >
            {newImageReady ? (
              <PhotoPlusIcon
                className="inline-block mr-[2-px] pb-1"
                stroke={'red'}
              />
            ) : (
              <PhotoIcon className="inline-block mr-[2-px] pb-1" />
            )}
            Images
          </Link>
        </StyledLi>
        <StyledLi active={isActiveRoute('/info')}>
          <Link href="/info" passHref>
            <InfoIcon className="inline-block mr-1 pb-1" />
            Info
          </Link>
        </StyledLi>
        <StyledLi active={isActiveRoute('/settings')}>
          <Link href="/settings" passHref>
            <SettingsIcon className="inline-block mr-[2-px] pb-1" />
            Settings
          </Link>
        </StyledLi>
      </StyledUl>
    </StyledNavBar>
  )
}
