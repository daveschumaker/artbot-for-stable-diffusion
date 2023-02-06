/* eslint-disable @next/next/no-img-element */
import styled from 'styled-components'
import Link from 'next/link'
import MenuIcon from '../icons/MenuIcon'
import Menu from '../Menu'
import { useState } from 'react'
import { lockScroll, unlockScroll } from '../../utils/appUtils'
import Image from 'next/image'

const Wrapper = styled.div`
  background-color: ${(props) => props.theme.body};
  align-items: center;
  display: flex;
  flex-direction: row;
  left: 0;
  padding-top: env(safe-area-inset-top);
  padding-left: 8px;
  padding-bottom: 8px;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 20;

  @media (min-width: 640px) {
    position: relative;
    margin-bottom: 2px;
    padding-bottom: 0;
    padding-left: 0;
  }
`

const MenuWrapper = styled.div`
  cursor: pointer;
  margin-right: 8px;

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
        <MenuIcon size={36} />
      </MenuWrapper>
      <div className="mt-2 w-1/2 inline-block">
        <Link href="/">
          <div className="inline-block">
            <Image
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
