/* eslint-disable @next/next/no-img-element */
import styled from 'styled-components'
import Link from 'next/link'
import MenuIcon from '../icons/MenuIcon'
import Menu from '../Menu'
import React, { useState } from 'react'
import { lockScroll, unlockScroll } from '../../utils/appUtils'
import Image from 'next/image'
import IconCreate from '../icons/CreateIcon'
import HourglassIcon from '../icons/HourglassIcon'
import PhotoIcon from '../icons/PhotoIcon'
import InfoIcon from '../icons/InfoIcon'
import SettingsIcon from '../icons/SettingsIcon'
import { useRouter } from 'next/router'
import { useStore } from 'statery'
import {
  appInfoStore,
  setNewImageReady,
  setShowImageReadyToast
} from '../../store/appStore'
import PhotoPlusIcon from '../icons/PhotoPlusIcon'

const Wrapper = styled.div`
  background-color: ${(props) => props.theme.body};
  align-items: center;
  display: flex;
  flex-direction: row;
  left: 0;
  padding-top: env(safe-area-inset-top);
  padding-left: 8px;
  padding-bottom: 8px;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 25;

  @media (min-width: 640px) {
    margin: auto auto 0 auto;
    max-width: 768px;
    padding-top: 8px;
    padding-bottom: 8px;
    width: calc(100% - 32px);
  }

  @media (min-width: 1280px) {
    margin: auto auto 0 auto;
    max-width: 1024px;
  }
`

const MenuWrapper = styled.div`
  cursor: pointer;
  margin-right: 8px;

  &:hover {
    color: rgb(20, 184, 166);
  }
`

const NavItem = ({
  active = false,
  children
}: {
  active?: boolean
  children: React.ReactNode
}) => {
  const styles: any = {}

  if (active) {
    styles.color = '#14B8A6'
    styles.borderBottom = `2px solid #14B8A6`
  }

  return (
    <div
      className="flex flex-row gap-[2px] pb-[4px] items-center text-[14px] font-[600] cursor-pointer hover:text-[#14B8A6]"
      style={{ ...styles }}
    >
      {children}
    </div>
  )
}

export default function Header() {
  const router = useRouter()
  const { pathname } = router
  const appState = useStore(appInfoStore)
  const { newImageReady } = appState
  const [showMenu, setShowMenu] = useState(false)

  const closeMenu = () => {
    unlockScroll()
    setShowMenu(false)
  }

  const openMenu = () => {
    lockScroll()
    setShowMenu(true)
  }

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
    <Wrapper>
      <Menu handleClose={() => closeMenu()} show={showMenu} />
      <MenuWrapper
        onClick={() => {
          if (showMenu) {
            closeMenu()
          } else {
            openMenu()
          }
        }}
      >
        <MenuIcon size={28} />
      </MenuWrapper>
      <div className="mt-[8px] tablet:mt-0 w-full flex flex-row items-center">
        <Link href="/">
          <div className="inline-block">
            <Image
              src="/artbot/artbot-logo.png"
              height={30}
              width={30}
              alt="AI ArtBot logo"
            />
          </div>
          <div className="inline-block">
            <h1 className="ml-2 pt-1 inline-block h-8 text-[24px] md:text-[28px] font-bold leading-7 text-teal-500">
              ArtBot
            </h1>
          </div>
        </Link>
        <div
          className="hidden tablet:flex flex-row grow justify-end gap-2"
          role="navigation"
        >
          <Link href="/" passHref tabIndex={0}>
            <NavItem active={isActiveRoute('/')}>
              <IconCreate size={20} />
              Create
            </NavItem>
          </Link>
          <Link href="/pending" passHref tabIndex={0}>
            <NavItem active={isActiveRoute('/pending')}>
              <HourglassIcon size={20} />
              Pending
            </NavItem>
          </Link>
          <Link
            href="/images"
            passHref
            onClick={() => {
              clearNewImageNotification()
              handleForceReload()
            }}
            tabIndex={0}
          >
            <NavItem active={isActiveRoute('/images')}>
              {newImageReady ? (
                <PhotoPlusIcon size={20} stroke={'red'} />
              ) : (
                <PhotoIcon size={20} />
              )}
              Images
            </NavItem>
          </Link>
          <Link href="/info" passHref tabIndex={0}>
            <NavItem active={isActiveRoute('/info')}>
              <InfoIcon size={20} />
              Info
            </NavItem>
          </Link>
          <Link href="/settings" passHref tabIndex={0}>
            <NavItem active={isActiveRoute('/settings')}>
              <SettingsIcon size={20} />
              Settings
            </NavItem>
          </Link>
        </div>
      </div>
    </Wrapper>
  )
}
