/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import Editor from '../components/Fabric/Editor'
import PageTitle from '../components/UI/PageTitle'
import { useReducer } from 'react'
import DefaultPromptInput from 'models/DefaultPromptInput'
import { useFetchImage } from 'hooks/useFetchImage'
import SpinnerV2 from 'components/Spinner'
import { LivePaintOptions } from 'components/LivePaintPage/Options'
import { SourceProcessing } from 'utils/promptUtils'
import { useEffectOnce } from 'hooks/useEffectOnce'

const LivePaintPage = () => {
  const initInput: DefaultPromptInput = {
    ...new DefaultPromptInput(),
    source_processing: SourceProcessing.Img2Img,
    sampler: 'k_dpm_2'
  }

  const [input, setInput] = useReducer((state: any, newState: any) => {
    const updatedInputState = { ...state, ...newState }

    return updatedInputState
  }, initInput)

  let [imageResult, pending, jobStatus, waitTime] = useFetchImage(input)

  useEffectOnce(() => {
    setInput({ seed: String(Math.abs((Math.random() * 2 ** 32) | 0)) })
  })

  return (
    <>
      <Head>
        <title>Draw Something - ArtBot for Stable Diffusion</title>
        <meta name="twitter:title" content="ArtBot - Draw Something" />
        <meta
          name="twitter:image"
          content="https://tinybots.net/artbot/robots_drawing.png"
        />
      </Head>
      <PageTitle>Live Paint</PageTitle>
      <div className="flex flex-row w-full gap-2">
        <div className="w-1/2 max-w-[576px]">
          <Editor
            canvasId="drawing-canvas"
            canvasType="drawing"
            handleRemoveClick={() => {}}
            setInput={setInput}
            canvasHeight={576}
            canvasWidth={576}
          />
        </div>
        <div className="flex flex-col w-1/2">
          <div className="h-[51px] mb-[16px] flex flex-row w-full items-center gap-2">
            {pending ? <SpinnerV2 size={24} /> : ''}
            {pending ? <span>{jobStatus}</span> : ''}
            {pending && waitTime !== '...' ? (
              <span>({Number(waitTime) + 5} seconds)</span>
            ) : (
              ''
            )}
          </div>
          {imageResult ? (
            <img
              className="h-[576px] w-[576px]"
              src={'data:image/webp;base64,' + imageResult}
            />
          ) : (
            <div className="h-[576px] w-[576px] bg-white"></div>
          )}
        </div>
      </div>
      <div className="flex w-full mt-4 max-w-[576px]">
        <LivePaintOptions input={input} setInput={setInput} />
      </div>
    </>
  )
}

export default LivePaintPage
