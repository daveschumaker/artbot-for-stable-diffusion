import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useStore } from 'statery'
import {
  appInfoStore,
  setNewImageReady,
  setShowImageReadyToast
} from '../../../store/appStore'
import ChevronDownIcon from '../../icons/ChevronDownIcon'
import IconCreate from '../../icons/CreateIcon'
import HourglassIcon from '../../icons/HourglassIcon'
import InfoIcon from '../../icons/InfoIcon'
import PhotoIcon from '../../icons/PhotoIcon'
import PhotoPlusIcon from '../../icons/PhotoPlusIcon'
import SettingsIcon from '../../icons/SettingsIcon'
import DropDown from '../DropDownV2/DropDownMenu'
import DropDownItem from '../DropDownV2/DropDownMenuItem'

const NavItem = ({
  active = false,
  children,
  onClick = () => {}
}: {
  active?: boolean
  children: React.ReactNode
  onClick?: () => void
}) => {
  const styles: any = {}

  if (active) {
    styles.color = '#14B8A6'
    styles.borderBottom = `2px solid #14B8A6`
  }

  return (
    <div
      className="flex flex-row relative gap-[2px] pb-[4px] items-center text-[14px] font-[600] cursor-pointer hover:text-[#14B8A6]"
      style={{ ...styles }}
      onClick={onClick}
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

  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [showInfoMenu, setShowInfoMenu] = useState(false)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)

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
      <div className="flex flex-row gap-[0px] relative">
        <Link href="/" passHref tabIndex={0}>
          <NavItem active={isActiveRoute('/')}>
            <IconCreate size={20} />
            Create
          </NavItem>
        </Link>
        <NavItem
          active={isActiveRoute('/')}
          onClick={() => {
            setShowCreateMenu(true)
          }}
        >
          <ChevronDownIcon size={20} />
        </NavItem>
        {showCreateMenu && (
          <DropDown
            handleClose={() => {
              setShowCreateMenu(false)
            }}
          >
            <DropDownItem
              handleClick={() => {
                setShowCreateMenu(false)
                router.push('/controlnet')
              }}
            >
              ControlNet
            </DropDownItem>
            <DropDownItem
              handleClick={() => {
                setShowCreateMenu(false)
                router.push('/draw')
              }}
            >
              Draw
            </DropDownItem>
          </DropDown>
        )}
      </div>
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
      <div className="flex flex-row gap-[0px] relative">
        <Link href="/info" passHref tabIndex={0}>
          <NavItem active={isActiveRoute('/info')}>
            <InfoIcon size={20} />
            Info
          </NavItem>
        </Link>
        <NavItem
          active={isActiveRoute('/info')}
          onClick={() => {
            setShowInfoMenu(true)
          }}
        >
          <ChevronDownIcon size={20} />
        </NavItem>
        {showInfoMenu && (
          <DropDown
            alignRight
            handleClose={() => {
              setShowInfoMenu(false)
            }}
          >
            <DropDownItem
              handleClick={() => {
                setShowInfoMenu(false)
                router.push('/info/models')
              }}
            >
              Model Details
            </DropDownItem>
            <DropDownItem
              handleClick={() => {
                setShowInfoMenu(false)
                router.push('/info/models/updates')
              }}
            >
              Model Updates
            </DropDownItem>
            <DropDownItem
              handleClick={() => {
                setShowInfoMenu(false)
                router.push('/info/models?show=favorite-models')
              }}
            >
              Favorite Models
            </DropDownItem>
            <DropDownItem
              handleClick={() => {
                setShowInfoMenu(false)
                router.push('/info/workers')
              }}
            >
              Worker Details
            </DropDownItem>
          </DropDown>
        )}
      </div>
      <div className="flex flex-row gap-[0px] relative">
        <Link href="/settings" passHref tabIndex={0}>
          <NavItem active={isActiveRoute('/settings')}>
            <SettingsIcon size={20} />
            Settings
          </NavItem>
        </Link>
        <NavItem
          active={isActiveRoute('/settings')}
          onClick={() => {
            setShowSettingsMenu(true)
          }}
        >
          <ChevronDownIcon size={20} />
        </NavItem>
        {showSettingsMenu && (
          <DropDown
            alignRight
            handleClose={() => {
              setShowSettingsMenu(false)
            }}
          >
            <DropDownItem
              handleClick={() => {
                setShowSettingsMenu(false)
                router.push('/profile')
              }}
            >
              User Profile
            </DropDownItem>
          </DropDown>
        )}
      </div>
    </nav>
  )
}

export default NavBar
