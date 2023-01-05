/* eslint-disable @next/next/no-img-element */
import styled from 'styled-components'
import Link from 'next/link'
import MenuIcon from '../icons/MenuIcon'
import Menu from '../Menu'
import { useState } from 'react'
import { lockScroll, unlockScroll } from '../../utils/appUtils'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  margin-bottom: 8px;

  @media (min-width: 640px) {
    margin-bottom: 2px;
  }
`

const MenuWrapper = styled.div`
  cursor: pointer;
  margin-right: 16px;

  &:hover {
    color: rgb(20, 184, 166);
  }
`

export default function Header() {
  const [showMenu, setShowMenu] = useState(false)

  const closeMenu = () => {
    unlockScroll()
    setShowMenu(false)
  }

  const openMenu = () => {
    lockScroll()
    setShowMenu(true)
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
        <MenuIcon />
      </MenuWrapper>
      <div className="mt-2 w-1/2 inline-block">
        <Link href="/">
          <div className="inline-block">
            <img
              src="/artbot/artbot-logo.png"
              height={32}
              width={32}
              alt="AI ArtBot logo"
            />
          </div>
          <div className="inline-block">
            <h1 className="ml-2 pt-1 inline-block h-8 text-[30px] font-bold leading-7 text-teal-500">
              ArtBot
            </h1>
          </div>
        </Link>
      </div>
      <div className="mt-2 w-1/2 inline-block text-right">
        <div className="mt-3"></div>
      </div>
    </Wrapper>
  )
}
