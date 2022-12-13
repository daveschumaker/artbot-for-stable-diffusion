import Slider from 'rc-slider'
import styled from 'styled-components'
import 'rc-slider/assets/index.css'

const StyledSlider = styled(Slider)`
  width: 100%;
`

const SliderComponent = (props: any) => {
  return (
    <>
      <StyledSlider
        draggableTrack
        trackStyle={{ backgroundColor: '#14B8A6', height: 10 }}
        handleStyle={{
          height: 20,
          width: 20,
          backgroundColor: '#14B8A6'
        }}
        railStyle={{ height: 10 }}
        {...props}
      />
    </>
  )
}

export default SliderComponent
