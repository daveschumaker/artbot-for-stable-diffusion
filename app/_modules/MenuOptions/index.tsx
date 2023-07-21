'use client'

import {
  IconCamera,
  IconHelp,
  IconHourglass,
  IconInfoCircle,
  IconLineDashed,
  IconNotes,
  IconPencil,
  IconPhoto,
  IconQuestionMark,
  IconRobot,
  IconSettings,
  IconStars,
  IconZoomQuestion
} from '@tabler/icons-react'
import styles from './menu.module.css'
import { CSSProperties } from 'react'

const MenuOptions = ({
  navigateToLink = () => {},
  style
}: {
  navigateToLink: (path: string) => any
  style?: CSSProperties
}) => {
  return (
    <div className={styles.MenuOptions} style={style}>
      <div
        className={styles.MenuOption}
        onClick={() => {
          navigateToLink('/')
        }}
      >
        <IconCamera stroke={1.5} />
        Create
      </div>
      <div className={styles.SubOptions}>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/chat')
          }}
        >
          <IconLineDashed stroke={1.5} />
          Chat / Text
        </div>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/controlnet')
          }}
        >
          <IconLineDashed stroke={1.5} />
          ControlNet
        </div>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/?panel=img2img')
          }}
        >
          <IconLineDashed stroke={1.5} />
          img2img
        </div>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/?panel=inpainting')
          }}
        >
          <IconLineDashed stroke={1.5} />
          Inpainting
        </div>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/live-paint')
          }}
        >
          <IconLineDashed stroke={1.5} />
          Live Paint
        </div>
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
          <IconLineDashed stroke={1.5} />
          Model Details
        </div>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/info/models/updates')
          }}
        >
          <IconLineDashed stroke={1.5} />
          Model Updates
        </div>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/info/models?show=favorite-models')
          }}
        >
          <IconLineDashed stroke={1.5} />
          Favorite Models
        </div>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/info/workers')
          }}
        >
          <IconLineDashed stroke={1.5} />
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
          <IconLineDashed stroke={1.5} />
          AI Horde Settings
        </div>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/settings?panel=workers')
          }}
        >
          <IconLineDashed stroke={1.5} />
          Manage Workers
        </div>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/settings?panel=prefs')
          }}
        >
          <IconLineDashed stroke={1.5} />
          ArtBot Prefs
        </div>
        <div
          className={styles.SubOption}
          onClick={() => {
            navigateToLink('/settings?panel=import-export')
          }}
        >
          <IconLineDashed stroke={1.5} />
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
          <IconLineDashed stroke={1.5} />
          Contact
        </div>
      </div>
    </div>
  )
}

export default MenuOptions
