'use client'

import {
  IconChevronDown,
  IconDeviceDesktopAnalytics
} from '@tabler/icons-react'
import { basePath } from 'BASE_PATH'
import Link from 'next/link'
import { useState } from 'react'
import Modal from '../Modal'
import HordeInfo from './HordeInfo'
import { useModal } from '@ebay/nice-modal-react'
import UserKudos from './UserKudos'
import MenuButton from './MenuButton'
import styles from './headerNav.module.css'
import UserWarning from './UserWarning'

function ListItem({
  href,
  title,
  description,
  onClose
}: {
  href: string
  title: string
  description: string
  onClose: () => void
}) {
  return (
    <li className="hover:bg-highlight rounded-md cursor-pointer">
      <Link
        className="flex flex-col items-start gap-[0px]"
        href={href}
        onClick={() => {
          onClose()
        }}
      >
        <div className="font-bold">{title}</div>
        <div className="text-xs">{description}</div>
      </Link>
    </li>
  )
}

/* eslint-disable @next/next/no-img-element */
export function HeaderNav() {
  const hordeInfoModal = useModal(Modal)
  const [visibleDropdown, setVisibleDropdown] = useState<string | null>(null)

  const openDropdown = (name: string) => {
    setVisibleDropdown(name)
  }

  const closeDropdown = () => {
    setVisibleDropdown(null)
  }

  return (
    <header
      className={styles.HeaderNav}
      // className="navbar sticky top-0 z-10 py-0 min-h-[48px] bg-body-color"
    >
      <div className="flex flex-row gap-2">
        <MenuButton />
        {/* <div className="flex-none">
        <button className="btn btn-sm btn-square btn-ghost">
          <IconMenu />
        </button>
      </div> */}
        <div className="flex-1">
          <Link
            className="flex flex-row gap-2 normal-case text-xl font-bold text-main"
            href="/"
          >
            <img
              src={`${basePath}/artbot-logo.png`}
              height={30}
              width={30}
              alt="AI ArtBot logo"
              className="min-w-[30px] max-w-[30px]"
            />
            ArtBot
          </Link>
        </div>
      </div>

      <div className="flex flew-row gap-2">
        <div className="flex-none hidden sm:flex">
          <div
            className="dropdown dropdown-open"
            onClick={closeDropdown}
            onMouseEnter={() => openDropdown('createDropdown')}
            onMouseLeave={closeDropdown}
          >
            <label
              tabIndex={0}
              className="btn btn-sm btn-ghost rounded-btn normal-case flex-row gap-[2px] px-[6px] sm:text-xs hover:bg-[#d8d8d8] dark:hover:bg-[#7d7c7c]"
            >
              <Link className="hover:text-main" href="/create">
                Create
              </Link>
              <IconChevronDown stroke={1} size={18} />
            </label>
            {visibleDropdown === 'createDropdown' && (
              <ul
                tabIndex={0}
                className="menu dropdown-content z-[1] p-2 shadow rounded-box w-80 bg-body-solid-color"
              >
                <ListItem
                  href="/create"
                  title="Create"
                  description="Create a new image using a prompt, image, or painting."
                  onClose={closeDropdown}
                />
                <ListItem
                  href="/controlnet"
                  title="ControlNet"
                  description="Easily get started with ControlNet by uploading your own image."
                  onClose={closeDropdown}
                />
                <ListItem
                  href="/live-paint"
                  title="Live paint"
                  description="Draw your own image and see Stable Diffusion process results
                  in near realtime (dependent on queue length)"
                  onClose={closeDropdown}
                />
                <ListItem
                  href="/draw"
                  title="Draw"
                  description="Draw and paint your own image and use it as source material
                  for Stable Diffusion."
                  onClose={closeDropdown}
                />
              </ul>
            )}
          </div>
          <button className="btn btn-sm btn-ghost normal-case px-[6px] sm:text-xs hover:bg-[#d8d8d8] dark:hover:bg-[#7d7c7c]">
            <Link className="hover:text-main" href="/pending">
              Pending
            </Link>
          </button>
          <button className="btn btn-sm btn-ghost normal-case px-[6px] sm:text-xs hover:bg-[#d8d8d8] dark:hover:bg-[#7d7c7c]">
            <Link className="hover:text-main" href="/images">
              Images
            </Link>
          </button>
          <div
            className="dropdown dropdown-open dropdown-end"
            onClick={closeDropdown}
            onMouseEnter={() => openDropdown('infoDropdown')}
            onMouseLeave={closeDropdown}
          >
            <label
              tabIndex={0}
              className="btn btn-sm btn-ghost rounded-btn normal-case flex-row gap-[2px] px-[6px] sm:text-xs hover:bg-[#d8d8d8] dark:hover:bg-[#7d7c7c]"
            >
              <Link className="hover:text-main" href="/info">
                Info
              </Link>
              <IconChevronDown stroke={1} size={18} />
            </label>
            {visibleDropdown === 'infoDropdown' && (
              <ul
                tabIndex={0}
                className="menu dropdown-content z-[1] p-2 shadow rounded-box w-80 bg-body-solid-color"
              >
                <ListItem
                  href="/faq"
                  title="FAQ"
                  description="Find answers to common questions and maybe even learn a thing or two."
                  onClose={closeDropdown}
                />
                <ListItem
                  href="/info/models"
                  title="Model details"
                  description="Detailed information about all models currently available on
                  the Stable Horde."
                  onClose={closeDropdown}
                />
                <ListItem
                  href="/info/models/updates"
                  title="Model updates"
                  description="The latest information on new models and updated models."
                  onClose={closeDropdown}
                />
                <ListItem
                  href="/info/models?show=favorite-models"
                  title="Favorite models"
                  description="A list of your favorite models."
                  onClose={closeDropdown}
                />
                <ListItem
                  href="/profile"
                  title="Profile"
                  description="Information about images you've requested and / or
                  generated on the Stable Horde."
                  onClose={closeDropdown}
                />
                <ListItem
                  href="/info/workers"
                  title="Worker details"
                  description="Information about various GPU workers provided by volunteers
                  of the Stable Horde."
                  onClose={closeDropdown}
                />
              </ul>
            )}
          </div>
          <div
            className="dropdown dropdown-open dropdown-end"
            onClick={closeDropdown}
            onMouseEnter={() => openDropdown('settingsDropdown')}
            onMouseLeave={closeDropdown}
          >
            <label
              tabIndex={0}
              className="btn btn-sm btn-ghost rounded-btn normal-case flex-row gap-[2px] px-[6px] sm:text-xs hover:bg-[#d8d8d8] dark:hover:bg-[#7d7c7c]"
            >
              <Link className="hover:text-main" href="/settings">
                Settings
              </Link>
              <IconChevronDown stroke={1} size={18} />
            </label>
            {visibleDropdown === 'settingsDropdown' && (
              <ul
                tabIndex={0}
                className="menu dropdown-content z-[1] p-2 shadow rounded-box w-80 bg-body-solid-color"
              >
                <ListItem
                  href="/settings"
                  title="AI Horde settings"
                  description="Settings specifically related to your AI Horde account."
                  onClose={closeDropdown}
                />
                <ListItem
                  href="/settings?panel=prefs"
                  title="ArtBot settings"
                  description="Preferences related to ArtBot."
                  onClose={closeDropdown}
                />
                <ListItem
                  href="/settings?panel=workers"
                  title="Manage workers"
                  description="View statistics and manage any workers you are running on the
                  Stable Horde."
                  onClose={closeDropdown}
                />
              </ul>
            )}
          </div>
        </div>
        <div className="flex gap-2 align-middle h-[32px]">
          <UserKudos />
          <UserWarning />
          <div className="flex-none h-[32px]">
            <button
              className="btn btn-sm btn-ghost normal-case px-[4px]"
              onClick={() => {
                hordeInfoModal.show({
                  content: <HordeInfo handleClose={hordeInfoModal.remove} />,
                  title: 'AI Horde Performance',
                  maxWidth: 'max-w-[640px]'
                })
              }}
            >
              <IconDeviceDesktopAnalytics stroke={1} />
            </button>
          </div>
        </div>
        {/* {showHordeInfo && (
        <Modal
          content={<HordeInfo />}
          handleClose={() => setShowHordeInfo(false)}
          title={'AI Horde Performance'}
        />
      )} */}
      </div>
    </header>
  )
}
