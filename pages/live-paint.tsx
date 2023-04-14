/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import Head from 'next/head'
import Editor from '../components/Fabric/Editor'
import PageTitle from '../components/UI/PageTitle'
import { useReducer, useState } from 'react'
import DefaultPromptInput from 'models/DefaultPromptInput'
import { useFetchImage } from 'hooks/useFetchImage'
import SpinnerV2 from 'components/Spinner'
import { LivePaintOptions } from 'components/LivePaintPage/Options'
import { SourceProcessing } from 'utils/promptUtils'
import { useEffectOnce } from 'hooks/useEffectOnce'
import { Button } from 'components/UI/Button'
import DownloadIcon from 'components/icons/DownloadIcon'
import { downloadFile } from 'utils/imageUtils'

const LivePaintPage = () => {
  const initInput: DefaultPromptInput = {
    ...new DefaultPromptInput(),
    source_processing: SourceProcessing.Img2Img,
    sampler: 'k_dpm_2'
  }

  const [pageWidth, setPageWidth] = useState(0)

  const [input, setInput] = useReducer((state: any, newState: any) => {
    const updatedInputState = { ...state, ...newState }

    return updatedInputState
  }, initInput)

  let [imageResult, pending, jobStatus, waitTime] = useFetchImage(input)

  useEffectOnce(() => {
    setInput({ seed: String(Math.abs((Math.random() * 2 ** 32) | 0)) })

    const container = document.getElementById('live-paint-container')
    const width = container?.offsetWidth
    // @ts-ignore
    setPageWidth(width)
  })

  const size = Math.floor((pageWidth - 8) / 2)

  return (
    <>
      <Head>
        <title>Live Paint - ArtBot for Stable Diffusion</title>
        <meta name="twitter:title" content="ArtBot - Live Paint" />
        <meta
          name="twitter:image"
          content="https://tinybots.net/artbot/robots_drawing.png"
        />
      </Head>
      <PageTitle>Live Paint</PageTitle>
      <div className="text-amber-500 adCol:hidden">
        <strong>Important!</strong> This feature is experimental and probably
        does not work well with mobile devices.
      </div>
      <div className="flex flex-row w-full gap-2" id="live-paint-container">
        <div className="w-1/2" style={{ maxWidth: `${size}px` }}>
          <Editor
            canvasId="drawing-canvas"
            canvasType="drawing"
            handleRemoveClick={() => {}}
            setInput={setInput}
            canvasHeight={size}
            canvasWidth={size}
            editorClassName="relative mt-[67px]"
            toolbarClassName="mt-[-60px]"
            toolbarAbsolute
            toolbarDisableMenu
          />
        </div>
        <div className="flex flex-col w-1/2">
          <div className="h-[51px] mb-[16px] flex flex-row justify-end w-full items-center gap-2 text-xs">
            {pending ? <SpinnerV2 size={20} /> : ''}
            {pending ? <span>{jobStatus}</span> : ''}
            {pending && waitTime !== '...' ? (
              <span>({Number(waitTime) + 3} seconds)</span>
            ) : (
              ''
            )}
          </div>
          {imageResult ? (
            <img
              style={{
                height: `${size}px`,
                width: `${size}px`
              }}
              src={'data:image/webp;base64,' + imageResult}
            />
          ) : (
            <div
              className="bg-white "
              style={{
                height: `${size}px`,
                width: `${size}px`
              }}
            ></div>
          )}
        </div>
      </div>
      <div className="flex justify-end w-full mt-4">
        <Button
          disabled={!input.prompt || !input.source_image || !imageResult}
          onClick={async () => {
            await downloadFile({
              base64String: input.source_image,
              fileType: 'image/webp',
              prompt: 'drawing_input_' + input.prompt
            })

            await downloadFile({
              base64String: imageResult,
              fileType: 'image/webp',
              prompt: 'image_output_' + input.prompt
            })
          }}
        >
          <DownloadIcon />
          Download images
        </Button>
      </div>
      <div className="flex w-full mt-4 max-w-[576px]">
        <LivePaintOptions input={input} setInput={setInput} />
      </div>
    </>
  )
}

export default LivePaintPage
