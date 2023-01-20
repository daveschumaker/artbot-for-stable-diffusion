import { useEffect } from 'react'
import styled from 'styled-components'
import useComponentState from '../../hooks/useComponentState'
import StarIcon from '../icons/StarIcon'

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
}

const StarRating = ({
  count = 10,
  disabled = false,
  onStarClick = () => {}
}: IProps) => {
  const [componentState, setComponentState] = useComponentState({
    activeStar: 0,
    rating: null
  })

  useEffect(() => {
    if (!disabled) {
      setComponentState({
        activeStar: 0,
        rating: null
      })
    }
  }, [disabled, setComponentState])

  const renderStars = () => {
    const elements = []

    for (let i = 0; i < count; i++) {
      const value = i + 1
      const filled =
        componentState.rating >= value || componentState.activeStar >= value
      elements.push(
        <StarWrapper
          key={`star_${value}`}
          onMouseEnter={() => {
            if (disabled) {
              return
            }

            setComponentState({ activeStar: value })
          }}
          onMouseLeave={() => setComponentState({ activeStar: 0 })}
          onClick={() => {
            if (disabled) {
              return
            }

            setComponentState({ rating: value })
            onStarClick(value)
          }}
        >
          <StarIcon size={24} fill={filled ? '#fcba03' : 'none'} />
          <span className="text-xs">{value}</span>
        </StarWrapper>
      )
    }

    return elements
  }

  return <RatingContainer>{renderStars()}</RatingContainer>
}

export default StarRating
