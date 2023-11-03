import DropDown from './DropDown'
import styles from './toolbar.module.css'

export default function SettingMenu({
  handleClearMask = () => {},
  handleDownloadClick = () => {},
  setShowOutpaintToolbar = () => {},
  setShowSettingMenu = () => {},
  showOutpaintToolbar = false
}: {
  handleClearMask: () => any
  handleDownloadClick: () => any
  setShowOutpaintToolbar: (bool: boolean) => any
  setShowSettingMenu: (bool: boolean) => any
  showOutpaintToolbar: boolean
}) {
  return (
    <DropDown handleClose={() => setShowSettingMenu(false)}>
      <div className={styles.toolbarMenuWrapper}>
        <div
          className={styles.toolbarMenuItem}
          onClick={() => {
            setShowOutpaintToolbar(!showOutpaintToolbar)
            setShowSettingMenu(false)
          }}
        >
          Outpainting options
        </div>
        <div
          className={styles.toolbarMenuItem}
          onClick={() => {
            handleDownloadClick()
            setShowSettingMenu(false)
          }}
        >
          Download image + mask
        </div>
        <div
          className={styles.toolbarMenuItem}
          onClick={() => {
            handleClearMask()
            setShowSettingMenu(false)
          }}
        >
          Clear mask
        </div>
      </div>
    </DropDown>
  )
}
