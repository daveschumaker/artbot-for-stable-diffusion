import { useState } from 'react'
import styled from 'styled-components'
import Panel from '../UI/Panel'
import SectionTitle from '../UI/SectionTitle'
import AdvancedOptionsPanel from './AdvancedOptionsPanel'
import Img2ImgPanel from './Img2ImgPanel'
import InpaintingPanel from './InpaintingPanel'
import PainterPanel from './PainterPanel'

interface LiProps {
  active?: boolean
}

const NavItem = styled.li<LiProps>`
  color: ${(props) => props.theme.navLinkNormal};
  cursor: pointer;

  &:hover {
    color: ${(props) => props.theme.navLinkActive};
    border-bottom: 2px solid ${(props) => props.theme.navLinkActive};
  }

  ${(props) =>
    props.active &&
    `
    color: ${props.theme.navLinkActive};
    border-bottom: 2px solid  ${props.theme.navLinkActive};
  `}
`

interface Props {
  handleChangeInput: any
  handleImageUpload: any
  handleOrientationSelect: any
  input: any
  setInput: any
}

const OptionsPanel = ({
  handleChangeInput,
  handleImageUpload,
  handleOrientationSelect,
  input,
  setInput
}: Props) => {
  const [activeNav, setActiveNav] = useState('advanced')
  return (
    <Panel>
      <SectionTitle>
        {activeNav === 'advanced' && `Advanced Options`}
        {activeNav === 'img2img' && `img2img upload`}
        {activeNav === 'painter' && `Painter`}
        {activeNav === 'inpainting' && `Inpainting`}
      </SectionTitle>
      <ul className="flex flex-row gap-4 md:gap-8 mb-2">
        <NavItem
          active={activeNav === 'advanced'}
          onClick={() => setActiveNav('advanced')}
        >
          advanced
        </NavItem>
        <NavItem
          active={activeNav === 'img2img'}
          onClick={() => setActiveNav('img2img')}
        >
          img2img
        </NavItem>
        <NavItem
          active={activeNav === 'painter'}
          onClick={() => setActiveNav('painter')}
        >
          painter
        </NavItem>
        <NavItem
          active={activeNav === 'inpainting'}
          onClick={() => setActiveNav('inpainting')}
        >
          inpainting
        </NavItem>
      </ul>
      {activeNav === 'advanced' && (
        <AdvancedOptionsPanel
          handleChangeInput={handleChangeInput}
          handleImageUpload={handleImageUpload}
          handleOrientationSelect={handleOrientationSelect}
          input={input}
          setInput={setInput}
        />
      )}
      {activeNav === 'img2img' && <Img2ImgPanel />}
      {activeNav === 'painter' && <PainterPanel />}
      {activeNav === 'inpainting' && <InpaintingPanel />}
    </Panel>
  )
}

export default OptionsPanel
