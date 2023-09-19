import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import useComponentState from 'app/_hooks/useComponentState'
import MenuButton from 'app/_components/MenuButton'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import DropDownMenu from 'app/_components/DropDownMenu/dropDownMenu'
import DropDownMenuItem from 'app/_components/DropDownMenuItem'

const MenuSeparator = styled.div`
  width: 100%;
  border-bottom: 1px solid ${(props) => props.theme.navLinkActive};
`

const InfoPageMenuButton = ({ title = '' }) => {
  const router = useRouter()
  const [componentState, setComponentState] = useComponentState({
    showOptionsMenu: false
  })

  return (
    <>
      <MenuButton
        active={componentState.showOptionsMenu}
        title="View model details"
        onClick={() => {
          if (componentState.showOptionsMenu) {
            setComponentState({
              showOptionsMenu: false
            })
          } else {
            setComponentState({
              showOptionsMenu: true
            })
          }
        }}
      >
        <div className="flex flex-row gap-1 pr-2">
          {componentState.showOptionsMenu ? (
            <IconChevronDown />
          ) : (
            <IconChevronRight />
          )}
          {title}
        </div>
      </MenuButton>
      {componentState.showOptionsMenu && (
        <DropDownMenu
          handleClose={() => {
            setComponentState({
              showOptionsMenu: false
            })
          }}
        >
          <DropDownMenuItem
            onClick={() => {
              router.push(
                //@ts-ignore
                `/info/models`
              )
            }}
          >
            All models
          </DropDownMenuItem>
          <DropDownMenuItem
            onClick={() => {
              router.push(
                //@ts-ignore
                `/info/models?show=favorite-models`
              )
            }}
          >
            Favorite models
          </DropDownMenuItem>
          <DropDownMenuItem
            onClick={() => {
              router.push(
                //@ts-ignore
                `/info/models/updates`
              )
            }}
          >
            Model updates
          </DropDownMenuItem>
          <MenuSeparator />
          <DropDownMenuItem
            onClick={() => {
              router.push(
                //@ts-ignore
                `/info/workers`
              )
            }}
          >
            All workers
          </DropDownMenuItem>
        </DropDownMenu>
      )}
    </>
  )
}

export default InfoPageMenuButton
