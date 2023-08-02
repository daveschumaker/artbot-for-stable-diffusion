'use client'
import Editor from 'app/_modules/Editor'
import PageTitle from 'app/_components/PageTitle'
import Section from 'app/_components/Section'
import styles from './drawpage.module.css'

const DrawPage = () => {
  return (
    <>
      <PageTitle>
        Draw<sup className={styles.super}>something</sup>
      </PageTitle>
      <Section>
        <Editor
          canvasId="drawing-canvas"
          canvasType="drawing"
          handleRemoveClick={() => {}}
        />
      </Section>
    </>
  )
}

export default DrawPage
