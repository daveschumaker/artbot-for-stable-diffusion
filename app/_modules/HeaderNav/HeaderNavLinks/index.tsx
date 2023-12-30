'use client'

import React from 'react'
import clsx from 'clsx'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import styles from './navBar.module.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import HordeDropdown from '../HordeDropdown'
import { useStore } from 'statery'
import ErrorDropdown from '../ErrorDropdown'
import {
  appInfoStore,
  setNewImageReady,
  setShowImageReadyToast
} from 'app/_store/appStore'
import {
  IconAlertTriangle,
  IconChevronDown,
  IconDeviceDesktopAnalytics
} from '@tabler/icons-react'
import FlexRow from 'app/_components/FlexRow'
import EscapedNavDropdown from '../EscapedNavDropdown'
import NotificationDisplay from './NotificationDisplay'
import Kudos from '../Kudos'

const ListItem = ({ className, children, href, title, ...props }: any) => (
  <li>
    <Link
      className={clsx(styles.ListItemLink, className)}
      href={href}
      {...props}
    >
      <>
        <div className={styles.ListItemHeading}>{title}</div>
        <p className={styles.ListItemText}>{children}</p>
      </>
    </Link>
  </li>
)

const HeaderNavLinks = () => {
  const pathname = usePathname()

  const appState = useStore(appInfoStore)
  const { newImageReady } = appState

  const appStore = useStore(appInfoStore)
  // const { workers } = useStore(userInfoStore)
  const { storageQuotaLimit } = appStore

  const isActiveRoute = (page: string) => {
    if (page === pathname) {
      return true
    }

    return false
  }

  // let isActive = false
  // let isPaused = false

  // if (Object.keys(workers).length > 0) {
  //   {
  //     Object.keys(workers).forEach((workerId) => {
  //       const { maintenance_mode, online } = workers[workerId]
  //       if (online && maintenance_mode) {
  //         isPaused = true
  //       }

  //       if (online && !maintenance_mode) {
  //         isActive = true
  //       }
  //     })
  //   }
  // }

  // let workerBadgeColor = 'red'

  // if (isActive && !isPaused) {
  //   workerBadgeColor = 'green'
  // }

  // if (isPaused) {
  //   workerBadgeColor = 'orange'
  // }

  return (
    <FlexRow style={{ justifyContent: 'flex-end' }}>
      <NavigationMenu.Root
        className={clsx(styles.NavigationMenuRoot, styles.MobileHide)}
      >
        <NavigationMenu.List className={styles.NavigationMenuList}>
          <NavigationMenu.Item className={styles.NavigationMenuItem}>
            <NavigationMenu.Trigger
              className={clsx(
                styles.NavigationMenuTrigger,
                isActiveRoute('/create') && styles.isActive,
                isActiveRoute('/controlnet') && styles.isActive,
                isActiveRoute('/draw') && styles.isActive
              )}
            >
              <Link className={styles.NavigationMenuLink} href="/create">
                Create
              </Link>
              <IconChevronDown className={styles.CaretDown} stroke={1.5} />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content className={styles.NavigationMenuContent}>
              <ul className={clsx(styles.List, styles.one)}>
                <ListItem href="/create" title="Create">
                  Create a new image using a prompt, image, or painting.
                </ListItem>
                <ListItem href="/controlnet" title="ControlNet">
                  Easily get started with ControlNet
                </ListItem>
                <ListItem href="/draw" title="Draw">
                  Draw and paint your own image and use it as source material
                  for Stable Diffusion.
                </ListItem>
                <ListItem href="/live-paint" title="Live Paint">
                  Draw your own image and see Stable Diffusion process results
                  in near realtime (dependent on queue length)
                </ListItem>
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>

          <NavigationMenu.Item className={styles.NavigationMenuItem}>
            <Link
              className={clsx(
                styles.NavigationMenuLink,
                isActiveRoute('/pending') && styles.isActive
              )}
              href="/pending"
            >
              Pending
            </Link>
          </NavigationMenu.Item>

          <NavigationMenu.Item
            className={clsx('relative', styles.NavigationMenuItem)}
          >
            {newImageReady && (
              <span
                style={{
                  alignItems: 'center',
                  backgroundColor: '#DC2626',
                  border: '1px solid white',
                  borderRadius: '50%',
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'row',
                  fontSize: '8px',
                  height: '8px',
                  justifyContent: 'center',
                  marginRight: '0.25rem',
                  opacity: 1,
                  paddingLeft: '1.5px',
                  position: 'absolute',
                  right: '-8px',
                  top: '0',
                  width: '8px'
                }}
              ></span>
            )}

            <Link
              className={clsx(
                styles.NavigationMenuLink,
                isActiveRoute('/images') && styles.isActive
              )}
              href="/images"
              onClick={() => {
                setShowImageReadyToast(false)
                setNewImageReady('')
              }}
            >
              Images
            </Link>
          </NavigationMenu.Item>

          <NavigationMenu.Item className={styles.NavigationMenuItem}>
            <NavigationMenu.Trigger className={styles.NavigationMenuTrigger}>
              <Link
                className={clsx(
                  styles.NavigationMenuLink,
                  isActiveRoute('/info/models') && styles.isActive,
                  isActiveRoute('/info/updates') && styles.isActive,
                  isActiveRoute('/info/workers') && styles.isActive,
                  isActiveRoute('/info') && styles.isActive
                )}
                href="/info"
              >
                Info
              </Link>
              <IconChevronDown className={styles.CaretDown} stroke={1.5} />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content className={styles.NavigationMenuContent}>
              <ul className={clsx(styles.List, styles.one)}>
                <ListItem href="/info/models" title="Model Details">
                  Detailed information about all models currently available on
                  the Stable Horde.
                </ListItem>
                <ListItem href="/info/models/updates" title="Model Updates">
                  The latest information on new models and updated models.
                </ListItem>
                <ListItem
                  href="/info/models?show=favorite-models"
                  title="Favorite Models"
                >
                  A list of your favorite models.
                </ListItem>
                <ListItem href="/profile" title="User Profile">
                  Information about images you&apos;ve requested and / or
                  generated on the Stable Horde.
                </ListItem>
                <ListItem href="/info/workers" title="Worker Details">
                  Information about various GPU workers provided by volunteers
                  of the Stable Horde.
                </ListItem>
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>

          <NavigationMenu.Item className={styles.NavigationMenuItem}>
            <NavigationMenu.Trigger
              className={clsx(
                styles.NavigationMenuTrigger,
                isActiveRoute('/profile') && styles.isActive,
                isActiveRoute('/settings') && styles.isActive
              )}
            >
              <Link className={styles.NavigationMenuLink} href="/settings">
                Settings
              </Link>
              <IconChevronDown className={styles.CaretDown} stroke={1.5} />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content className={styles.NavigationMenuContent}>
              <ul className={clsx(styles.List, styles.one)}>
                <ListItem href="/settings" title="AI Horde Settings">
                  Settings specifically related to your AI Horde account.
                </ListItem>
                <ListItem
                  href="/settings?panel=prefs"
                  title="ArtBot Preferences"
                >
                  Preferences related to ArtBot.
                </ListItem>
                <ListItem href="/settings?panel=workers" title="Manage Workers">
                  View statistics and manage any workers you are running on the
                  Stable Horde.
                </ListItem>
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>

          {storageQuotaLimit && (
            <NavigationMenu.Item>
              <NavigationMenu.Trigger
                className={clsx(
                  styles.NavigationMenuTrigger,
                  styles.AnalyticsIcon
                )}
              >
                <IconAlertTriangle size={32} stroke="red" />
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className={styles.NavigationMenuContent}>
                <ErrorDropdown />
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          )}

          <NavigationMenu.Indicator className={styles.NavigationMenuIndicator}>
            <div className={styles.Arrow} />
          </NavigationMenu.Indicator>
        </NavigationMenu.List>

        <div className={styles.ViewportPosition}>
          <NavigationMenu.Viewport className={styles.NavigationMenuViewport} />
        </div>
      </NavigationMenu.Root>
      {/* <NavigationMenu.Root
        className={styles.NavigationMenuRoot}
        style={{ flexGrow: 'unset' }}
      >
        <NavigationMenu.List className={styles.NavigationMenuList}>
          <NavigationMenu.Item>
            <NavigationMenu.Trigger
              className={clsx(
                styles.NavigationMenuTrigger,
                styles.AnalyticsIcon
              )}
            >
              {(isActive || isPaused) && (
                <IconPoint
                  className={styles.WorkerStatus}
                  fill={workerBadgeColor}
                  stroke={1}
                />
              )}
              <IconDeviceDesktopAnalytics size={32} stroke={1} />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content
              className={clsx(
                styles.NavigationMenuContent,
                styles.HordeDropdownContent
              )}
            >
              <HordeDropdown />
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root> */}
      <NotificationDisplay />
      <Kudos />
      <EscapedNavDropdown
        menuIcon={<IconDeviceDesktopAnalytics stroke={1} size={32} />}
        content={<HordeDropdown />}
      />
    </FlexRow>
  )
}

export default HeaderNavLinks
