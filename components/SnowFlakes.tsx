import { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import AppSettings from '../models/AppSettings'

const SnowflakesFall = keyframes`
    0% {
        top: -10%;
    }
    100% {
        top: 100%;
    }
`

const SnowflakesShake = keyframes`
    0% {
        transform: translateX(0px);
    }
    50% {
        transform: translateX(80px);
    }
    100% {
        transform: translateX(0px);
    }
`

const SnowflakesWrapper = styled.div``

const Snowflake = styled.div`
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-animation-duration: 10s, 3s;
  -webkit-animation-iteration-count: infinite, infinite;
  -webkit-animation-name: ${SnowflakesFall}, ${SnowflakesShake};
  -webkit-animation-play-state: running, running;
  -webkit-animation-timing-function: linear, ease-in-out;
  -webkit-user-select: none;
  animation-duration: 10s, 3s;
  animation-iteration-count: infinite, infinite;
  animation-name: ${SnowflakesFall}, ${SnowflakesShake};
  animation-play-state: running, running;
  animation-timing-function: linear, ease-in-out;
  cursor: default;
  position: fixed;
  top: -10%;
  user-select: none;
  z-index: 9999;

  color: #fff;
  font-size: 1em;
  font-weight: 100;
  font-family: Arial;
  text-shadow: 0 0 1px #000;

  &:nth-of-type(0) {
    left: 1%;
    -webkit-animation-delay: 0s, 0s;
    animation-delay: 0s, 0s;
  }

  &:nth-of-type(1) {
    left: 10%;
    -webkit-animation-delay: 1s, 1s;
    animation-delay: 1s, 1s;
  }

  &:nth-of-type(2) {
    left: 20%;
    -webkit-animation-delay: 6s, 0.5s;
    animation-delay: 6s, 0.5s;
  }

  &:nth-of-type(3) {
    left: 30%;
    -webkit-animation-delay: 4s, 2s;
    animation-delay: 4s, 2s;
  }

  &:nth-of-type(4) {
    left: 40%;
    -webkit-animation-delay: 2s, 2s;
    animation-delay: 2s, 2s;
  }

  &:nth-of-type(5) {
    left: 50%;
    -webkit-animation-delay: 8s, 3s;
    animation-delay: 8s, 3s;
  }

  &:nth-of-type(6) {
    left: 60%;
    -webkit-animation-delay: 6s, 2s;
    animation-delay: 6s, 2s;
  }

  &:nth-of-type(7) {
    left: 70%;
    -webkit-animation-delay: 2.5s, 1s;
    animation-delay: 2.5s, 1s;
  }

  &:nth-of-type(8) {
    left: 80%;
    -webkit-animation-delay: 1s, 0s;
    animation-delay: 1s, 0s;
  }

  &:nth-of-type(9) {
    left: 90%;
    -webkit-animation-delay: 3s, 1.5s;
    animation-delay: 3s, 1.5s;
  }
`

const Snowflakes = () => {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    if (AppSettings.get('disableSnowflakes')) {
      setEnabled(false)
    }
  }, [])

  if (!enabled) {
    return null
  }

  return (
    <SnowflakesWrapper aria-hidden="true">
      <Snowflake>❅</Snowflake>
      <Snowflake>❆</Snowflake>
      <Snowflake>❅</Snowflake>
      <Snowflake>❆</Snowflake>
      <Snowflake>❅</Snowflake>
      <Snowflake>❆</Snowflake>
      <Snowflake>❅</Snowflake>
      <Snowflake>❆</Snowflake>
      <Snowflake>❅</Snowflake>
      <Snowflake>❆</Snowflake>
      <Snowflake>❅</Snowflake>
      <Snowflake>❆</Snowflake>
    </SnowflakesWrapper>
  )
}

export default Snowflakes
