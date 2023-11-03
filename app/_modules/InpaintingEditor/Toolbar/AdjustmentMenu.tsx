import NumericInputSliderV2 from 'app/_modules/NumericInputSliderV2'
import DropDown from './DropDown'
import Slider from 'app/_components/Slider'
import Panel from 'app/_components/Panel'

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
      <div className="flex flex-col w-full" style={{ color: 'black' }}>
        <div className="w-full mb-2">
          <Panel>
            <NumericInputSliderV2
              label="Brush size"
              tooltip="Size of brush on inpainting canvas"
              from={2}
              to={300}
              step={1}
              onChange={(value) => {
                const e = {
                  target: {
                    value
                  }
                }
                handleWidth(e)
              }}
              fieldName="inpainting_brush_size"
              value={brushSize}
            />
            <Slider
              value={brushSize}
              min={2}
              max={300}
              step={1}
              onChange={(e: any) => {
                handleWidth(e)
              }}
            />
          </Panel>
        </div>
      </div>
    </DropDown>
  )
}
