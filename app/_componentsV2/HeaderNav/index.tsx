import { IconDeviceDesktopAnalytics, IconMenu } from '@tabler/icons-react'
import { basePath } from 'BASE_PATH'

/* eslint-disable @next/next/no-img-element */
export function HeaderNav() {
  return (
    <div className="navbar bg-base-100">
      <div className="flex-none">
        <button className="btn btn-sm btn-square btn-ghost">
          <IconMenu />
        </button>
      </div>
      <div className="flex-1">
        <a
          className="btn btn-sm btn-ghost normal-case text-xl text-main hover:bg-base-100"
          href="/artbot"
        >
          <img
            src={`${basePath}/artbot-logo.png`}
            height={30}
            width={30}
            alt="AI ArtBot logo"
            className="min-w-[30px] max-w-[30px"
          />
          ArtBot
        </a>
      </div>
      <div className="flex-none hidden sm:flex">
        <div className="dropdown dropdown-hover">
          <label tabIndex={0} className="btn btn-sm btn-ghost rounded-btn">
            <a href="/artbot/create">Create</a>
          </label>
          <ul
            tabIndex={0}
            className="menu dropdown-content z-[1] p-2 shadow bg-base-200 rounded-box w-52"
          >
            <li>
              <a>Item 1</a>
            </li>
            <li>
              <a>Item 2</a>
            </li>
          </ul>
        </div>
        <button className="btn btn-sm btn-ghost">
          <a href="/artbot/pending">Pending</a>
        </button>
        <button className="btn btn-sm btn-ghost">
          <a href="/artbot/images">Images</a>
        </button>
        <button className="btn btn-sm btn-ghost">
          <a href="/artbot/info">Info</a>
        </button>
        <button className="btn btn-sm btn-ghost">
          <a href="/artbot/settings">Settings</a>
        </button>
        <button className="btn btn-sm btn-ghost">
          <IconDeviceDesktopAnalytics />
        </button>
      </div>
    </div>
  )
}
