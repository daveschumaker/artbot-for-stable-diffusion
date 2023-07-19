import Head from 'next/head'
import Editor from '../components/Fabric/Editor'
import PageTitle from 'app/_components/PageTitle'
import Section from 'app/_components/Section'
import styles from '../styles/drawpage.module.css'

const DrawPage = () => {
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
      <PageTitle>
        Draw<sup className={styles.super}>something</sup>
      </PageTitle>
      <Section first>
        <Editor
          canvasId="drawing-canvas"
          canvasType="drawing"
          // setInput={setInput}
          handleRemoveClick={() => {
            // clearCanvasStore()
            // setInput({
            //   imageType: '',
            //   source_image: '',
            //   source_mask: '',
            //   source_processing: SourceProcessing.Prompt
            // })
          }}
          // source_image={input.source_image}
          // source_image_height={input.height}
          // source_image_width={input.width}
        />
      </Section>
    </>
  )
}

export default DrawPage
