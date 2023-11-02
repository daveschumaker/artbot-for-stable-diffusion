import DropDown from './DropDown'

export default function AdjustmentMenu({
  setShowAdjustmentMenu = () => {},
  brushSize,
  handleWidth = () => {}
}: {
  setShowAdjustmentMenu: (bool: boolean) => any
  brushSize: number
  handleWidth: (e: any) => any
}) {
  return (
    <DropDown
      handleClose={() => {
        setShowAdjustmentMenu(false)
      }}
    >
      <div className="flex flex-col w-full">
        <div className="w-full mb-2">
          <div className="text-gray-900">
            <small>
              <strong>Brush size ({brushSize} px)</strong>
            </small>
          </div>
          <div className="w-full">
            <input
              className="w-full"
              type="range"
              min={2}
              max="120"
              onChange={handleWidth}
              value={brushSize}
            />
          </div>
        </div>
      </div>
    </DropDown>
  )
}
