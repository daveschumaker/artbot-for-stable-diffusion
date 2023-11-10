'use client'

import { IconDeviceDesktopAnalytics, IconMenu } from '@tabler/icons-react'
import { basePath } from 'BASE_PATH'
import Link from 'next/link'
import { useState } from 'react'
import Modal from '../Modal'
import HordeInfo from './HordeInfo'
import { useModal } from '@ebay/nice-modal-react'
import UserKudos from './UserKudos'

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
    <li>
      <Link
        className="flex flex-col items-start"
        href={href}
        onClick={() => {
          onClose()
        }}
      >
        <div className="font-bold">{title}</div>
        <div>{description}</div>
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
    <div className="navbar bg-base-100 sticky top-0 z-10">
      <div className="flex-none">
        <button className="btn btn-sm btn-square btn-ghost">
          <IconMenu />
        </button>
      </div>
      <div className="flex-1">
        <Link
          className="btn btn-sm btn-ghost normal-case text-xl font-bold text-main hover:bg-base-100"
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
      <div className="flex-none hidden sm:flex">
        <div
          className="dropdown dropdown-open"
          onMouseEnter={() => openDropdown('createDropdown')}
          onMouseLeave={closeDropdown}
        >
          <label
            tabIndex={0}
            className="btn btn-sm btn-ghost rounded-btn normal-case"
          >
            <Link href="/create">Create</Link>
          </label>
          {visibleDropdown === 'createDropdown' && (
            <ul
              tabIndex={0}
              className="menu dropdown-content z-[1] p-2 shadow rounded-box w-80 bg-base-200"
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
        <button className="btn btn-sm btn-ghost normal-case">
          <Link href="/pending">Pending</Link>
        </button>
        <button className="btn btn-sm btn-ghost normal-case">
          <Link href="/images">Images</Link>
        </button>
        <div
          className="dropdown dropdown-open dropdown-end"
          onMouseEnter={() => openDropdown('infoDropdown')}
          onMouseLeave={closeDropdown}
        >
          <label
            tabIndex={0}
            className="btn btn-sm btn-ghost rounded-btn normal-case"
          >
            <Link href="/info">Info</Link>
          </label>
          {visibleDropdown === 'infoDropdown' && (
            <ul
              tabIndex={0}
              className="menu dropdown-content z-[1] p-2 shadow bg-base-200 rounded-box w-80"
            >
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
          onMouseEnter={() => openDropdown('settingsDropdown')}
          onMouseLeave={closeDropdown}
        >
          <label
            tabIndex={0}
            className="btn btn-sm btn-ghost rounded-btn normal-case"
          >
            <Link href="/settings">Settings</Link>
          </label>
          {visibleDropdown === 'settingsDropdown' && (
            <ul
              tabIndex={0}
              className="menu dropdown-content z-[1] p-2 shadow bg-base-200 rounded-box w-80"
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
      <UserKudos />
      <div className="flex-none">
        <button
          className="btn btn-sm btn-ghost normal-case"
          onClick={() => {
            hordeInfoModal.show({
              content: <HordeInfo handleClose={hordeInfoModal.remove} />,
              title: 'AI Horde Performance'
            })
          }}
        >
          <IconDeviceDesktopAnalytics />
        </button>
      </div>
      {/* {showHordeInfo && (
        <Modal
          content={<HordeInfo />}
          handleClose={() => setShowHordeInfo(false)}
          title={'AI Horde Performance'}
        />
      )} */}
    </div>
  )
}
