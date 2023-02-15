import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { useStore } from 'statery'
import {
  appInfoStore,
  setNewImageReady,
  setShowImageReadyToast
} from '../../../store/appStore'
import IconCreate from '../../icons/CreateIcon'
import HourglassIcon from '../../icons/HourglassIcon'
import InfoIcon from '../../icons/InfoIcon'
import PhotoIcon from '../../icons/PhotoIcon'
import PhotoPlusIcon from '../../icons/PhotoPlusIcon'
import SettingsIcon from '../../icons/SettingsIcon'

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

const NavBar = () => {
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
    <nav
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
    </nav>
  )
}

export default NavBar
