import Head from 'next/head'
import PageTitle from '../components/PageTitle'
import styled from 'styled-components'
import Linker from '../components/Linker'

const Section = styled.div`
  padding-top: 16px;

  &:first-child {
    padding-top: 0;
  }
`

const SubSectionTitle = styled.div`
  font-weight: 700;
  padding-bottom: 8px;
`

const StyledUl = styled.ul`
  margin-left: 8px;
`

const StyledLi = styled.li`
  list-style: square;
  margin-left: 16px;
`

const AddedInfo = styled.div`
  border-left: 2px solid ${(props) => props.theme.text};
  font-size: 14px;
  margin-top: 8px;
  margin-bottom: 8px;
  margin-left: 16px;
  padding-left: 8px;
`

/** TEMPLATE

<Section>
  <SubSectionTitle>2022.10.27</SubSectionTitle>
  <StyledUl>
    <StyledLi>test</StyledLi>
  </StyledUl>
</Section>

<AddedInfo> exists for further explanation
*/

const Changelog = () => {
  return (
    <div className="mb-4">
      <Head>
        <title>ArtBot - Changelog</title>
      </Head>
      <PageTitle>Changelog</PageTitle>
      <Section>
        <SubSectionTitle>2022.10.27</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Add light / dark theme options
            <AddedInfo>
              Currently locked to system settings, but I will add an option for
              user preference in the future.
            </AddedInfo>
          </StyledLi>
          <StyledLi>
            Refactored &quot;advanced options panel&quot; on{' '}
            <Linker href="/">main create page</Linker>.
            <AddedInfo>
              The thinking here is to simplify the front page as much as
              possible. If someone has no experience with generative AI art, let
              them quickly create something.
            </AddedInfo>
          </StyledLi>
          <StyledLi>
            Refactored pending item component (background color, text spacing
            issues)
          </StyledLi>
          <StyledLi>
            Fixed issue when attempting to choose a random sampler.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.10.24</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            MILESTONE: 100,000 images have been created with ArtBot!
          </StyledLi>
          <StyledLi>
            You can now import images directly from a URL in order to use the
            img2img feature with stable diffusion.
          </StyledLi>
          <StyledLi>
            In the models dropdown list, you can now see the number of workers
            running each model
            <AddedInfo>
              More workers generally means quicker generation times. This is
              helpful if you want to crank through a number of images.
            </AddedInfo>
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.10.20</SubSectionTitle>
        <StyledUl>
          <StyledLi>img2img support is now live for **ALL** users!</StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.10.18</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            PURE CHAOS MODE: Add random option to orientation, sampler and
            models. Try a random selection on one... or all three if you&apos;re
            crazy.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.10.17</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            img2img support is live for trusted users (generally those who are
            contributing back to the Stable Horde with GPU cycles).
          </StyledLi>
          <StyledLi>
            Initial work on getting ArtBot setup as a proper Progressive Web App
            (PWA)
            <AddedInfo>
              Add it to your mobile device homescreen for a more app like
              experience
            </AddedInfo>
          </StyledLi>
          <StyledLi>
            Add simple pagination buttons for{' '}
            <Linker href="/images">images page</Linker> (things were getting
            slow if you had a lot of images stored in the browser cache).
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.10.11</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            MILESTONE: 10,000 images have been created using ArtBot!
          </StyledLi>
          <StyledLi>
            Add option to download PNG of your image
            <AddedInfo>
              Due to bandwidth constraints, the Stable Horde sends images as a
              WEBP file. This isn&apos;t always optimal for downloading to your
              local device. On each image details page, you will see a download
              button (down arrow).
            </AddedInfo>
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.10.11</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            MILESTONE: 1,000 images have been created using ArtBot!
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.10.09</SubSectionTitle>
        <StyledUl>
          <StyledLi>ARTBOT IS OFFICIALLY LAUNCHED! 🎉🎉🎉</StyledLi>
          <StyledLi>
            Quick fix: You can now generate more than 1 image at a time.
          </StyledLi>
        </StyledUl>
      </Section>
    </div>
  )
}

export default Changelog
