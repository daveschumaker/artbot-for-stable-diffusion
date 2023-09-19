import { useEffect } from 'react'
import styled from 'styled-components'
import useComponentState from 'app/_hooks/useComponentState'
import { IconStar } from '@tabler/icons-react'

const RatingContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  column-gap: 8px;
  margin-top: 8px;
  height: 50px;
`

const StarWrapper = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  row-gap: 4px;
`

interface IProps {
  count?: number
  disabled: boolean
  onStarClick(value: number): void
  startValue?: number
}

const StarRating = ({
  count = 10,
  disabled = false,
  startValue = 1,
  onStarClick = () => {}
}: IProps) => {
  const [componentState, setComponentState] = useComponentState({
    activeStar: -Infinity,
    rating: -Infinity
  })

  useEffect(() => {
    if (!disabled) {
      setComponentState({
        activeStar: -Infinity,
        rating: -Infinity
      })
    }
  }, [disabled, setComponentState])

  const renderStars = () => {
    const elements = []
    let initValue = startValue - 1

    for (let i = 0; i < count; i++) {
      const value = initValue + i + 1
      const filled =
        (componentState.activeStar >= 0 &&
          componentState.activeStar >= value) ||
        (componentState.rating >= 0 && componentState.rating >= value)

      elements.push(
        <StarWrapper
          key={`star_${value}`}
          onMouseEnter={() => {
            if (disabled) {
              return
            }

            setComponentState({
              activeStar: value
            })
          }}
          onMouseLeave={() => setComponentState({ activeStar: -Infinity })}
          onClick={() => {
            if (disabled) {
              return
            }

            setComponentState({ rating: value })
            onStarClick(value)
          }}
        >
          <IconStar size={24} fill={filled ? '#fcba03' : 'none'} />
          <span className="text-xs">{value}</span>
        </StarWrapper>
      )
    }

    return elements
  }

  return <RatingContainer>{renderStars()}</RatingContainer>
}

export default StarRating
