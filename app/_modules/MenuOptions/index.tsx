'use client'

import {
  IconCamera,
  IconHelp,
  IconHourglass,
  IconInfoCircle,
  IconPoint,
  IconNotes,
  IconPencil,
  IconPhoto,
  IconQuestionMark,
  IconRobot,
  IconSettings,
  IconStars,
  IconZoomQuestion,
  IconLayoutDashboard
} from '@tabler/icons-react'
import styles from './menu.module.css'
import { CSSProperties } from 'react'

const MenuOptions = ({
  forceAdPadding = false,
  navigateToLink = () => {},
  style
}: {
  forceAdPadding?: boolean
  navigateToLink: (path: string) => any
  style?: CSSProperties
}) => {
  return (
    <div className={styles.MenuOptions} style={style}>
      <div
        className={styles.MenuOption}
        onClick={() => {
          navigateToLink('/create')
        }}
      >
        <IconCamera stroke={1.5} />
        Create
      </div>
      <div className={styles.SubOptions}>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/controlnet')
          }}
        >
          <IconPoint stroke={1.5} />
          ControlNet
        </div>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/create?panel=img2img')
          }}
        >
          <IconPoint stroke={1.5} />
          img2img
        </div>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/create?panel=inpainting')
          }}
        >
          <IconPoint stroke={1.5} />
          Inpainting
        </div>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/live-paint')
          }}
        >
          <IconPoint stroke={1.5} />
          Live Paint
        </div>
      </div>
      <div
        className={styles.MenuOption}
        onClick={() => {
          navigateToLink('/showcase')
        }}
      >
        <IconLayoutDashboard stroke={1.5} />
        Showcase
      </div>
      <div
        className={styles.MenuOption}
        onClick={() => {
          navigateToLink('/draw')
        }}
      >
        <IconPencil stroke={1.5} />
        Draw
      </div>
      <div
        className={styles.MenuOption}
        onClick={() => {
          navigateToLink('/interrogate')
        }}
      >
        <IconZoomQuestion stroke={1.5} />
        Interrogate
      </div>
      <div
        className={styles.MenuOption}
        onClick={() => {
          navigateToLink('/rate')
        }}
      >
        <IconStars stroke={1.5} />
        Rate Images
      </div>
      <div
        className={styles.MenuOption}
        onClick={() => {
          navigateToLink('/pending')
        }}
      >
        <IconHourglass stroke={1.5} />
        Pending
      </div>
      <div
        className={styles.MenuOption}
        onClick={() => {
          navigateToLink('/images')
        }}
      >
        <IconPhoto stroke={1.5} />
        Images
      </div>
      <div
        className={styles.MenuOption}
        onClick={() => {
          navigateToLink('/info')
        }}
      >
        <IconInfoCircle stroke={1.5} />
        Info
      </div>
      <div className={styles.SubOptions}>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/info/models')
          }}
        >
          <IconPoint stroke={1.5} />
          Model Details
        </div>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/info/models/updates')
          }}
        >
          <IconPoint stroke={1.5} />
          Model Updates
        </div>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/info/models?show=favorite-models')
          }}
        >
          <IconPoint stroke={1.5} />
          Favorite Models
        </div>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/info/workers')
          }}
        >
          <IconPoint stroke={1.5} />
          Worker details
        </div>
      </div>
      <div
        className={styles.MenuOption}
        onClick={() => {
          navigateToLink('/faq')
        }}
      >
        <IconQuestionMark stroke={1.5} />
        FAQ
      </div>
      <div
        className={styles.MenuOption}
        onClick={() => {
          navigateToLink('/changelog')
        }}
      >
        <IconNotes stroke={1.5} />
        Changelog
      </div>
      <div
        className={styles.MenuOption}
        onClick={() => {
          navigateToLink('/settings')
        }}
      >
        <IconSettings stroke={1.5} />
        Settings
      </div>
      <div className={styles.SubOptions}>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/settings')
          }}
        >
          <IconPoint stroke={1.5} />
          AI Horde Settings
        </div>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/settings?panel=workers')
          }}
        >
          <IconPoint stroke={1.5} />
          Manage Workers
        </div>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/settings?panel=prefs')
          }}
        >
          <IconPoint stroke={1.5} />
          ArtBot Prefs
        </div>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/settings?panel=import-export')
          }}
        >
          <IconPoint stroke={1.5} />
          Import / Export
        </div>
      </div>
      <div
        className={styles.MenuOption}
        onClick={() => {
          navigateToLink('/profile')
        }}
      >
        <IconRobot stroke={1.5} />
        User Profile
      </div>
      <div
        className={styles.MenuOption}
        onClick={() => {
          navigateToLink('/about')
        }}
      >
        <IconHelp stroke={1.5} />
        About
      </div>
      <div className={styles.SubOptions}>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/contact')
          }}
        >
          <IconPoint stroke={1.5} />
          Contact
        </div>
      </div>
      {forceAdPadding && <div style={{ paddingBottom: '260px' }}></div>}
    </div>
  )
}

export default MenuOptions
