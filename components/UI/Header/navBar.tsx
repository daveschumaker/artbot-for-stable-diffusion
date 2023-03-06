/* eslint-disable react/display-name */
import React from 'react'
import clsx from 'clsx'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import styles from './navBar.module.css'
import ChevronDownIcon from '../../icons/ChevronDownIcon'
import Link from 'next/link'
import { useRouter } from 'next/router'
import AnalyticsIcon from '../../icons/AnalyticsIcon'
import HordeDropdown from './HordeDropdown'

const NavBar = () => {
  const router = useRouter()
  const { pathname } = router

  const isActiveRoute = (page: string) => {
    if (page === pathname) {
      return true
    }

    return false
  }

  return (
    <NavigationMenu.Root className={styles.NavigationMenuRoot}>
      <NavigationMenu.List className={styles.NavigationMenuList}>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger
            className={clsx(
              styles.NavigationMenuTrigger,
              isActiveRoute('/') && styles.isActive,
              isActiveRoute('/controlnet') && styles.isActive,
              isActiveRoute('/draw') && styles.isActive
            )}
          >
            <Link className={styles.NavigationMenuLink} href="/">
              Create
            </Link>
            <ChevronDownIcon className={styles.CaretDown} />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className={styles.NavigationMenuContent}>
            <ul className={clsx(styles.List, styles.one)}>
              <ListItem href="/" title="Create">
                Create a new image using a prompt, image, or painting.
              </ListItem>
              <ListItem href="/controlnet" title="ControlNet">
                Easily get started with ControlNet
              </ListItem>
              <ListItem href="/draw" title="Draw">
                Draw and paint your own image and use it as source material for
                Stable Diffusion.
              </ListItem>
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
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

        <NavigationMenu.Item>
          <Link
            className={clsx(
              styles.NavigationMenuLink,
              isActiveRoute('/images') && styles.isActive
            )}
            href="/images"
          >
            Images
          </Link>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
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
            <ChevronDownIcon className={styles.CaretDown} />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className={styles.NavigationMenuContent}>
            <ul className={clsx(styles.List, styles.one)}>
              <ListItem href="/info/models" title="Model Details">
                Detailed information about all models currently available on the
                Stable Horde.
              </ListItem>
              <ListItem href="/models/updates" title="Model Updates">
                The latest information on new models and updated models.
              </ListItem>
              <ListItem
                href="/info/models?show=favorite-models"
                title="Favorite Models"
              >
                A list of your favorite models.
              </ListItem>
              <ListItem href="/info/workers" title="Worker Details">
                Information about various GPU workers provided by volunteers of
                the Stable Horde.
              </ListItem>
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
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
            <ChevronDownIcon className={styles.CaretDown} />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className={styles.NavigationMenuContent}>
            <ul className={clsx(styles.List, styles.one)}>
              <ListItem href="/profile" title="User Profile">
                Information about images you&apos;ve requested and / or
                generated on the Stable Horde.
              </ListItem>
              <ListItem href="/settings" title="Stable Horde Settings">
                Settings specifically related to your Stable Horde account.
              </ListItem>
              <ListItem href="/settings?panel=prefs" title="ArtBot Preferences">
                Preferences related to ArtBot.
              </ListItem>
              <ListItem href="/settings?panel=workers" title="Manage Workers">
                View statistics and manage any workers you are running on the
                Stable Horde.
              </ListItem>
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Trigger className={styles.NavigationMenuTrigger}>
            <AnalyticsIcon />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className={styles.NavigationMenuContent}>
            <HordeDropdown />
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Indicator className={styles.NavigationMenuIndicator}>
          <div className={styles.Arrow} />
        </NavigationMenu.Indicator>
      </NavigationMenu.List>

      <div className={styles.ViewportPosition}>
        <NavigationMenu.Viewport className={styles.NavigationMenuViewport} />
      </div>
    </NavigationMenu.Root>
  )
}

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

export default NavBar
