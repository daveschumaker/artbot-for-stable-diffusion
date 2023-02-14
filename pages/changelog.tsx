import Head from 'next/head'
import PageTitle from '../components/UI/PageTitle'
import styled from 'styled-components'
import Linker from '../components/UI/Linker'
import FeedbackModal from '../components/Feedback'
import { useState } from 'react'
import { useEffectOnce } from '../hooks/useEffectOnce'
import { trackEvent } from '../api/telemetry'
import Panel from '../components/UI/Panel'
import AdContainer from '../components/AdContainer'

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
  margin-bottom: 8px;
`

const AddedInfo = styled.div`
  border-left: 2px solid ${(props) => props.theme.text};
  font-size: 14px;
  margin-top: 8px;
  margin-bottom: 8px;
  margin-left: 16px;
  padding-left: 8px;
`

const LinkButton = styled.div`
  display: inline-block;
  cursor: pointer;
  color: ${(props) => props.theme.link};
  font-weight: 600;

  &:hover {
    color: ${(props) => props.theme.linkActive};
  }
`

/** TEMPLATE

<Section>
  <SubSectionTitle>2023.02.01</SubSectionTitle>
  <StyledUl>
    <StyledLi>test</StyledLi>
  </StyledUl>
</Section>

<AddedInfo> exists for further explanation
*/

const Changelog = () => {
  const [showFeedback, setShowFeedback] = useState(false)

  useEffectOnce(() => {
    trackEvent({
      event: 'PAGE_VIEW',
      context: '/pages/changelog'
    })
  })

  return (
    <div className="mb-4">
      {showFeedback && (
        <FeedbackModal handleClose={() => setShowFeedback(false)} />
      )}
      <Head>
        <title>Changelog - ArtBot for Stable Diffusion</title>
      </Head>
      <PageTitle>Changelog</PageTitle>
      <div className="mb-4">
        The latest happenings on ArtBot. Have a feature request or bug report?{' '}
        <LinkButton onClick={() => setShowFeedback(true)}>
          Contact me!
        </LinkButton>
      </div>
      <div className="w-full">
        <AdContainer minSize={0} maxSize={640} />
      </div>
      <Panel>
        <Section>
          <SubSectionTitle>Ongoing issues:</SubSectionTitle>
          <StyledUl>
            <StyledLi>
              2022.12.24 - Bulk downloads using the export option are a bit
              buggy. I believe this is due to browser and device memory
              limitations. I&apos;m investigating ways to make the downloads
              easier (perhaps breaking them up into a series of files that you
              would have to manually download). In the meantime, you can
              optionally download 100 images at a time on from the{' '}
              <Linker href="/images">images page</Linker> or groups of your
              favorite images. (I know that some of you have thousands of images
              and this is not ideal at the moment.)
            </StyledLi>
          </StyledUl>
        </Section>
      </Panel>
      {/* ///// START CHANGE LOG ////// */}
      <Section>
        <SubSectionTitle>2023.02.13</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Some UI refactoring in today&apos;s update: For non-mobile devices,
            the navbar you see at the top of the screen has been modified and
            folded into the header itself (rather than as a separate row).
          </StyledLi>
          <StyledLi>
            On the image creation page, I&apos;ve changed the text area for the
            prompt to be fixed to the top of the screen as you scroll down. Is
            this okay? Is this annoying? Should it be a personal setting? Let me
            know! (FYI, I have disabled it on the inpainting panel, so you have
            max screen real estate for that mode)
          </StyledLi>
          <StyledLi>
            Below the advanced options panel, I removed the create image button.
            It sounds like this was an unpopular opinion. So, it&apos;s back!
            Thanks to Saw Dagon on Discord for letting me know how important
            they found it.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.02.12</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Added a helpful automated error message that shows up on every page
            if ArtBot is unable to connect to the Stable Horde backend API
            (...like this exact moment as I am deploying this).
          </StyledLi>
          <StyledLi>
            Fix: Issue with canvas settings being preserved beween image
            generation requests, depending on settings. Thanks to FlameMind and
            Gigachad on Discord for reporting this and providing some video
            examples of what was happening.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.02.11</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Feature: Enable support for CLIP skip, a new feature available on
            the Stable Horde. What is it? It controls how early to stop
            processing a prompt. The higher the value (max of 12), the earlier
            the CLIP network will stop processing a prompt before being sent to
            a Stable Diffusion model.
          </StyledLi>
          <StyledLi>
            Feature: In the{' '}
            <Linker href="/settings?panel=prefs">ArtBot settings panel</Linker>,
            there is now an option that will preserve canvas / mask settings
            between image generations. Thanks to FlameMind on Discord for the
            suggestion.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.02.09</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: In some situations, when ArtBot received an error response from
            the Stable Horde API, the error would cascade down and affect all
            pending jobs. I&apos;ve added some new logic that should prevent
            this from occurring in certain scenarios.
          </StyledLi>
          <StyledLi>
            Feature: The fix is in! (The hires fix, that is, courtesy of some
            recent additions to the Stable Horde API). This allows you to create
            images at higher resolutions without inadvertently making
            multi-headed monstrosities. How does it work? It partially renders
            image at a lower resolution before upscaling it and adding more
            detail.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.02.08</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Minor fix: delete button not working on inpainting tab.
          </StyledLi>
          <StyledLi>
            Minor fix: change brush size slider not working on inpainting tab.
          </StyledLi>
          <StyledLi>
            Renamed &quot;Stable Diffusion v.2.0 Inpainting&quot; model because
            it was incorrect. It&apos;s actually &quot;Stable Diffusion v.1.5
            Inpainting&quot;. (Thanks to FlameMind on Discord for reporting
            this).
          </StyledLi>
          <StyledLi>
            Added a border to the mask and erase brushes in inpainting mode.
            This should make it a bit easier to see where you&apos;re painting
            if the background is white or red. Thanks to &quot;💫.&quot; on
            Discord for suggesting this.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.02.07</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: More work attempting to fix some issues with fixed header on
            mobile devices. If you&apos;re having issues where some UI elements
            get stuck underneath the fixed header and you cannot access them,
            please let me know! (Also, please send along what device / browser
            this is happening with.)
          </StyledLi>
          <StyledLi>
            Removed the &quot;NoSleep&quot; option for mobile devices, because
            it did not work.
          </StyledLi>
          <StyledLi>
            Attempting to fix an issue with inpainting / img2img masks not being
            properly set. Thanks to FlameMind on Discord for reporting this.
          </StyledLi>
          <StyledLi>
            FIXED! Content appearing under the header on mobile devices. To the
            beautiful, brave, anonymous soul who wrote in to tell me what device
            you were using when you encountered this issue, THANK YOU! (A
            7th-gen iPod touch, effective screen width of 320px. Wow!) A quick
            test using XCode&apos;s handy iOS simulator verified what was
            happening. I had no idea. Thank you! For those following along at
            home,{' '}
            <Linker
              href="https://imgur.com/gallery/bpFhCXE"
              target="_blank"
              rel="noopener noreferrer"
            >
              this is what they were dealing with.
            </Linker>
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.02.06</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            UX: Change some behavior related to swiping between pages / images
            on mobile devices. Previously, it was way too sensitive. It should
            be a bit more forgiving now.
          </StyledLi>
          <StyledLi>
            Feature: Added some very simple performance stats fetched from the
            Stable Horde API to the{' '}
            <Linker href="/info" passHref>
              general info page
            </Linker>
            .
          </StyledLi>
          <StyledLi>
            On mobile devices, fix some issues with header (and content
            appearing within safe area on iOS).
          </StyledLi>
          <StyledLi>
            Fix a number of z-index issues with various parts of the UI after
            the recent fixed header update.
          </StyledLi>
          <StyledLi>
            Fix: A few more pesky z-index issues like unable to select dropdown
            menu on settings page (thanks for reporting, anonymous user!) and
            being unable to use model triggers on the create image page (thanks
            to Ano for reporting this via Discord).
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.02.04</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: On mobile devices, ad unit would show above delete confirmation
            modal. Thanks to gunsalem on Discord for reporting.
          </StyledLi>
          <StyledLi>
            Fix: Shareable links did not load proper model. Thanks to Gigachad
            on Discord for reporting.
          </StyledLi>
          <StyledLi>
            Non-user facing: Split up some code related to the FAQ in order to
            better show specific content around various parts of ArtBot (not
            implemented yet).
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.02.03</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: Update links to view detailed model info on image creation
            page. Thanks to voodoocode on Discord for reporting this.
          </StyledLi>
          <StyledLi>
            UX: Add scrollbar to prompt input text area to better help with
            accessibility. Thanks to kindagami on Discord for suggesting this.
          </StyledLi>
          <StyledLi>
            UX: Make negative prompt field a text area instead of input, giving
            a bit more visibility into what you have typed.
          </StyledLi>
          <StyledLi>
            Added some (hopefully unobtrusive) ads from{' '}
            <Linker
              href="https://www.carbonads.net/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Carbon
            </Linker>
            . It&apos;s a network geared toward creators and developers. I am
            hoping it doesn&apos;t cheapen ArtBot and the little bit of
            potential income from it will be used to support the site (server
            costs ~$15 / mo) and donate some extra dollars to Stable Horde for
            their awesome service. If it really affects your experience with
            ArtBot, please let me know!
          </StyledLi>
          <StyledLi>
            Fix: Entering text in number field and then clicking plus or minus
            appended 1 to the value instead of adding it, similar to the issue
            on 2023.01.31. Thanks to Stable Horde user goxryX-mipja for
            reporting this.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.02.02</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Feature: Add an option to view image generation parameters from the
            pending items page. I often see people on Discord report receiving
            some sort of ambiguous error from Stable Horde. This should help
            with debugging what went wrong.
          </StyledLi>
          <StyledLi>
            Fix: Use trusted workers was always set to true, regardless of your
            preferences. This might help speed up image requests!
          </StyledLi>
          <StyledLi>
            When using a style preset, negative prompts were all sorts of
            screwed up (thanks to me). I have fixed behavior around this (as
            well as some more robust prompt validation logic).
          </StyledLi>
          <StyledLi>
            Feature: Warnings for excessive prompt lengths. Stable Diffusion
            only parses prompts that are ~77 tokens in length (about 300
            characters). Anything exceeding this will be ignored. ArtBot now
            shows a warning if you hit this limit. (You can still submit an
            image request -- but the prompt exceeding this may not affect your
            image).
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.02.01</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Pix2Pix incoming! Soon. It&apos;s currently in testing from one
            worker on the Stable Horde. Give it a try! I loves high step counts.
            And you can also add an image mask to specifically target an area of
            the image. (e.g., I highlight my dog&apos;s face and say &quot;put
            sunglasses on it&quot;)
          </StyledLi>
          <StyledLi>
            UX: Hide{' '}
            <Linker href="/faq#kudos" passHref>
              kudos cost
            </Linker>{' '}
            for image generation from non-logged in users. It&apos;s unintuitive
            at first and might turn some people off from creating anything.
            Props to ResidentChiefNZ on Discord for the suggestion.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.31</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: When adjusting the a slider on the image creation page and then
            trying to type something into the number field, the value would be
            appended to whatever existed in the number field. Thanks to Hinaloth
            on Discord for reporting this.
          </StyledLi>
          <StyledLi>
            Fix: Use favorite models button was disabled. Thanks to Anon69 on
            Discord for reporting this.
          </StyledLi>
          <StyledLi>
            Fix: Plus and minus buttons appended a value, rather than added a
            value to any number input. (e.g., 10 + 1 = 101 instead of 11).
            Thanks to Hinaloth on Discord for reporting this.
          </StyledLi>
          <StyledLi>
            Update: CFG Strength / Guidance scale minimum steps changed from 1.0
            to 0.5
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.30</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Biggest and most obvious change -- getting rid of the imported
            Google font and defaulting to Helvetica. I was using Roboto (hah!),
            and thought it made things look more fun. But I did&apos;t really
            like relying on Google for the font, plus the slight performance hit
            was a turn off (which Chrome&apos;s own Lighthouse utility called
            out). So, we&apos;re going to try this Helvetica thing.
          </StyledLi>
          <StyledLi>
            Fixed some lazy loading issues from the main image creation page.
            Things should be <em>snappier!</em> Also, I was able to get a
            Lighthouse score of 100 on my local machine after this. It&apos;ll
            be interesting to see how that shakes out on production.
          </StyledLi>
          <StyledLi>
            Would you believe I am still working on issues related to the
            Pending Items page? I think I have them fixed finally. Really.
            Hopefully.
          </StyledLi>
          <StyledLi>
            Updated the README.md file in the ArtBot project&apos;s{' '}
            <Linker
              href="https://github.com/daveschumaker/artbot-for-stable-diffusion"
              target="_blank"
              rel="noopener noreferrer"
            >
              Github page
            </Linker>
            . This should better help people who are curious about the project
            (or even want to contribute) get it up and running on their own
            machines.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.29</SubSectionTitle>
        <StyledUl>
          <StyledLi>Update styles dropdown on the create image page.</StyledLi>
          <StyledLi>
            Fix: Remove reverse sort order for completed items page. It caused
            items to jump around, which was problematic if you were trying to
            click on something to rate or delete. Thanks to &quot;💫.&quot; on
            Discord for reporting this.
          </StyledLi>
          <StyledLi>
            UX: Add option to disable swiping between pages on{' '}
            <Linker href="/images">image gallery page</Linker> for mobile
            devices. Thanks to &quot;Black Drapion&quot; on Discord for the
            suggestion.
          </StyledLi>
          <StyledLi>
            Minor updates to the contact form, as well as HTML metadata. (Sadly,
            this has nothing to do with embedding data within images, which has
            been a popular request. If you happen to know of a way client-side
            way to do this within the context of a web browser, please let me
            know!)
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.28</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            UX: Queue up an additional image in background of rating tab -- this
            makes rating images seem faster!
          </StyledLi>
          <StyledLi>
            Fix: Clean up some logic related to the pending items page. It was a
            bit messy, prone to errors, sometimes the image preview you clicked
            on showed a different image in the popup modal. Just a sucky
            experience overall. Hopefully, things will work better now.
          </StyledLi>
          <StyledLi>
            Feature: Support for newly implemented &quot;k_dpmpp_sde&quot;
            sampler (commonly known as &quot;DPM++ SDE or DPM++ SDE Karras&quot;
            in other UIs)
          </StyledLi>
          <StyledLi>
            Feature: On mobile devices, the image modal will now have an
            additional share button that uses your device&apos;s native share
            panel -- for those instances where you want to share / post an image
            somewhere.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.27</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            MILESTONE: 🎉🎉🎉 3,000,000 images have been created with ArtBot!
            You are all amazing. 🎉🎉🎉
          </StyledLi>
          <StyledLi>It&apos;s bug fixes all the way down!</StyledLi>
          <StyledLi>
            Fix: Star count was incorrect when rating your own recently created
            images. (It was 5, should be 6. Hey, I didn&apos;t make the rules!
            Just using what the API provides). Thanks to &quot;💫.&quot; on
            Discord for reporting this.
          </StyledLi>
          <StyledLi>
            Fix: When a model has multiple trigger words, the trigger words run
            together on the model details page. Thanks to voodoocode on Discord
            for reporting this.
          </StyledLi>
          <StyledLi>
            Fix: On the image creation page, the trigger word dropdown would
            only show a single trigger if there were multiple trigger words.
            Thanks to Airic on Discord for reporting this.
          </StyledLi>
          <StyledLi>
            Feature: Add a link to delete all pending jobs. Useful when you
            (accidentally... ah hem, I am guilty) queue up about 700 images
            thanks to prompt matrices, multi-guidance, etc. Thanks to
            &quot;💫.&quot; on Discord for suggesting this.
          </StyledLi>
          <StyledLi>
            Fix: After uploading an image to the inpainting tool, the web app
            would get stuck in an infinite loop, which prevented you from
            clicking on links in the bottom navbar (if on mobile devices).
            Thanks to Stable Horde user Underwater_Silver for the feedback on
            this!
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.26</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Been pretty heads down lately and have been working on various
            things in the background. Among them:
          </StyledLi>
          <StyledLi>
            Better inpainting: Inpainting on ArtBot has always kind of...
            sucked. And it&apos;s been missing a feature added to Stable Horde
            awhile back: img2img masking, which was released way back at the{' '}
            <Linker
              href="https://discord.com/channels/781145214752129095/1020695869927981086/1038557043046494279"
              target="_blank"
              rel="noopener noreferrer"
            >
              beginning of November
            </Linker>
            . I made some improvements around this experience and tried to give
            the interface a slightly updated coat of paint.
            <AddedInfo>
              Inpainting and img2img masking aren&apos;t exactly the same thing,
              though from an end-user perspective, they both work in a very
              similar fashion -- you paint a part of an image that you want
              changed, type in a description and voila! With inpainting, you are
              limited to a very specific model (stable_diffusion_inpainting,
              based on SD v2). With img2img mask, you can use any model. Also,
              due to how resource intensive inpainting is, there are not many
              workers currently running the stable_diffusion_inpainting model,
              which has resulted in a ton of issues on ArtBot (error messages
              saying: &quot;No workers available, try again later.&quot;).
              Things should work much better now! Head on over to the{' '}
              <Linker href="/?panel=inpainting">inpainting panel</Linker> and
              try it out!
            </AddedInfo>
          </StyledLi>
          <StyledLi>
            UX: On mobile devices, replace interrogation icon / link with rating
            icon / link. The ratings page is used more (at least on desktop) and
            arguably more important. You can still find the interrogation page
            in the menu. (Thanks to Stable Horde user, Underwater_Silver, for
            the suggestion)
          </StyledLi>
          <StyledLi>
            Feature: Stable Horde recently added support for attempting to
            create tiled images. This is handy for creating fun backgrounds.
            Check it out, in the advanced options tab. (Note: It does not work
            for img2img or inpainting requests.)
          </StyledLi>
          <StyledLi>
            Fix: Copy prompt from the image details page forgot image
            orientation and resolution settings. (Thanks for reporting on
            Discord, Saw Dagon)
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.21</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Feature: Artifact and image quality ratings added to recently
            created images.
          </StyledLi>
          <StyledLi>
            Feature: Anonymous users can now rate images (but you will need to
            log in to receive kudos)
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.20</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Small improvements to how new images are loaded after rating a new
            image (trying to cut down on perceived delays while waiting for new
            image to load).
          </StyledLi>
          <StyledLi>
            Added an optional contact field to the feedback form. Some of you
            have really interesting suggestions... or bugs, and I would love to
            be able to reach out to know more.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.19</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: Issue where typing anything in denoising strength field would
            result in a value of &quot;NaN&quot;. (Thanks for reporting on{' '}
            <Linker
              href="https://discord.com/channels/781145214752129095/1038867597543882894"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </Linker>{' '}
            , voodoocode!)
          </StyledLi>
          <StyledLi>
            Fix: Settings page fetches latest kudos count when loaded. This
            should fix the issue where it appeared you did&apos;t receive kudos
            after rating an image (but you actually did, the user info cache was
            just stale).
          </StyledLi>
          <StyledLi>
            Feature: Now request multiple images using multiple guidance
            strengths. It works similar to the multi-step request feature added
            on <strong>2022.12.20</strong>.
          </StyledLi>
          <StyledLi>
            Feature: Implement Stable Horde&apos;s artifact / image quality
            rating endpoint. Now, rate images for presence of artifacts, in
            addition to aesthetic taste.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.18</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: Image creation page would sometimes forget various parameters
            under certain scenarios. I believe this is now fixed. (Thanks to
            &quot;💫.&quot; on Discord for reporting this.)
          </StyledLi>
          <StyledLi>
            On the <Linker href="/settings">settings page</Linker>, I&apos;ve
            added more granular options for preserving both prompt and seed
            after creating an image. (All other options should be remembered and
            automatically saved as you change them).
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.17</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Feature: New{' '}
            <Linker href="/info/models/updates" passHref>
              model updates
            </Linker>{' '}
            page. Keep track of the latest models added to Stable Horde (and
            ArtBot), as well as any version bumps (or models being removed...
            ::sad trombone::). Thanks for the suggestion, anonymous user!
          </StyledLi>
          <StyledLi>
            Added some additional telemetry in order to track down a pesky issue
            related to kudos not updating after rating images.
          </StyledLi>
          <StyledLi>
            Minor fix: Changed how API calls were made to the rating endpoint.
            Hopefully this slightly speeds up your ability to rate images.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.14</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Save model version on image create and show in image details.{' '}
            <Linker
              href="https://github.com/daveschumaker/artbot-for-stable-diffusion/issues/29"
              target="_blank"
              rel="noopener noreferrer"
            >
              Github #29
            </Linker>
            <AddedInfo>
              This is something I hadn&apos;t been doing before now. There are a
              lot of models now available on the Stable Horde (100 at the time
              of this writing!). And many of the models are being updated by
              their maintainers. Some models can drastically change output
              between differing versions, meaning that the same parameters and
              seed given to a different version of a particular model will
              result in a completely different image. In an effort to give more
              transparency into how your images have been created, ArtBot will
              now save the version of the model that was created with your
              image.
            </AddedInfo>
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.13</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: When using multi-models or all-models option, automatically add
            trigger word to beginning of the prompt. (Should this be optional?
            This should probably optional, eh?)
          </StyledLi>
          <StyledLi>
            UX: Reverse order of image direction. Most recent image should be
            left, right? (e.g., if you hit left arrow or swipe from the left
            side, you should be going toward more recent images?) See{' '}
            <Linker
              href="https://github.com/daveschumaker/artbot-for-stable-diffusion/issues/24"
              target="_blank"
              rel="noopener noreferrer"
            >
              Github #24
            </Linker>
            .
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.12</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: Swiping or using arrow keys when viewing modal from image
            gallery made the underlying gallery page change.
          </StyledLi>
          <StyledLi>Updated ratings API endpoint</StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.11</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Feature: You can now rate your recently created images and
            automatically send the results to LAION, via the Stable Horde.
            Provided you&apos;ve created the image within the past 20 minutes
            and you have sharing enabled on the{' '}
            <Linker href="/settings">settings page</Linker>, you&apos;ll be able
            to rate your image based on your aesthetic preferences. How do you
            rate an image? You use the...
          </StyledLi>
          <StyledLi>
            Feature: ...newly created image modal! This will pop up in various
            places around the site (pending page, images page, image details
            page when looking at related images). It allows you to quickly
            navigate between tons of images. On a mobile device, swipe on the
            picture. On a computer, hit the arrow keys. For those who like the
            bevy of options provided on the image details page, fear not: you
            can still access them (though it is one additional click) from the
            modal.
          </StyledLi>
          <StyledLi>
            Feature: Just kidding... sort of. Images should still detect middle
            clicks, so for those of you who like to visit the images page and
            middle click / open a bunch of images in new tabs, this should still
            work!
          </StyledLi>
          <StyledLi>
            UX: Drastically speed up image lookups from IndexedDb. I was using a
            fairly un-optimized query, which would cause lots of spinners when
            loading image details pages. NO MORE! (Hopefully)
          </StyledLi>
          <StyledLi>
            UX: Helpful warning if you&apos;re trying to create a new batch of
            images but have a fixed seed.
          </StyledLi>
          <StyledLi>Show rate image button on pending items page.</StyledLi>
          <StyledLi>
            When clicking on the image finished toast popup in the corner of the
            screen, load the image modal so you can instantly rate your image
            (if applicable).
          </StyledLi>
          <StyledLi>
            Fix: I had added a fixed seed warning when generating multiple
            images with a fixed seed, but forgot to take into account the
            scenario where you WANT a fixed seed (multiple models, multiple
            steps). Now, I just show a warning, but do not block you. (Thanks
            for the feedback, anonymous user!)
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.10</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: My refactoring of the star rating component broke... the star
            rating component. 😩
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.09</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: Better error handling if the aesthetic rating server goes
            offline.
          </StyledLi>
          <StyledLi>
            Split star rating component out so that is more reusable. (Will help
            an upcoming feature where you can rate your own images and send the
            result to LAION)
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.08</SubSectionTitle>
        <StyledUl>
          <StyledLi>UX: Add number below stars on rating page.</StyledLi>
          <StyledLi>
            Fix: Copy prompt on image details page now copies the key as well.
          </StyledLi>
          <StyledLi>
            Minor fix: Persist image2text interrogation options.
          </StyledLi>
          <StyledLi>
            Added a link to Google Colab that allows you to easily setup a
            Stable Horde worker. Help out the community, earn kudos and learn a
            bit of Python while you&apos;re at it!
          </StyledLi>
          <StyledLi>
            Feature: Add option to send an existing image from your library to
            the image2text interrogation feature. (Thanks for the suggestion,
            anonymous user!)
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.07</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Feature: Help improve future versions of Stable Diffusion by{' '}
            <Linker href="/rate">rating images</Linker>. Each image you rate
            currently gives a reward of 5 kudos. For those of you who
            aren&apos;t able to run a Stable Horde instance on your local
            machine, this could be a great way to earn kudos.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.06</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            A lot of cool improvements today, thanks to the power of{' '}
            <LinkButton onClick={() => setShowFeedback(true)}>
              feedback
            </LinkButton>
            . Thank you!
          </StyledLi>
          <StyledLi>
            Fix: Recently created img2img images do not show a denoise value on
            the image details page. Looks like I broke this due to my model
            refactor waaaaaay back on 2022.12.22. (Thanks for reporting,
            anonymous user!)
          </StyledLi>
          <StyledLi>
            UX: On mobile devices, swap out icon on mobile footer for the
            interrogate page, as it is a more useful link. (Thanks for the
            feedback, anonymous user!)
          </StyledLi>
          <StyledLi>
            Feature: Ability to bulk delete related images from the image
            details page. (Thanks for the suggestion, anonymous user!)
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.05</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Feature: More improvements to{' '}
            <Linker href="/interrogate">image interrogation</Linker>. You can
            now upload images directly from your own device. Go ahead, I know
            you want to see how the API describes your face or your kid&apos;s
            most recent drawing! Also, you can now select multiple types of
            interrogations to run at once (caption, tags, nsfw).
          </StyledLi>
          <StyledLi>
            Neat: ArtBot was{' '}
            <Linker
              href="https://www.pcworld.com/article/1431633/meet-stable-horde-the-setihome-of-ai-art.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              mentioned in an article
            </Linker>{' '}
            about the Stable Horde in a recent post in PC World magazine. 😎
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.04</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Feature: Support for Stable Horde{' '}
            <Linker href="/interrogate">CLIP interrogation</Linker>. Send an
            existing image to the Stable Horde API and get a predicted caption
            generated by the API, NSFW status, or tags related to the image.{' '}
            <Linker
              href="https://dbzer0.com/blog/image-interrogations-are-now-available-on-the-stable-horde/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read db0&apos;s blog post about it.
            </Linker>{' '}
            For now, it only works on images submitted via URL. (Direct image
            uploading coming soon)
          </StyledLi>
          <StyledLi>
            Feature: Proper kudos cost and image generation numbers on the
            create page.
            <AddedInfo>
              When you create a new image request using combinations of various
              settings (like a prompt matrix, multiple steps, all samplers,
              etc), image counts can inflate pretty quickly. You now have more
              visibility into how many images you are requesting from the Stable
              Horde API, as well as updated kudos costs (total and per image).
            </AddedInfo>
          </StyledLi>
          <StyledLi>
            Feature: Added a new slide out menu system that&apos;s available
            across the app on both mobile and desktop devices. ArtBot is
            starting to get a lot of options, so this is a nice way to list
            everything available on the site.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.03</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: Resolve issue with image sizes resetting to 512x512 after
            encountering an API error.
          </StyledLi>
          <StyledLi>
            Fix: Ensure old inpainting canvas has been removed prior to
            importing / uploading a brand new image.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.02</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: Issue with importing image for use with inpainting when image
            width is smaller than canvas width.
          </StyledLi>
          <StyledLi>
            Fix: After yesterday&apos;s fix related to automatically adding
            image dimensions, we now automatically set custom dimensions for
            images imported via inpainting to nearest integer divisible by 64 --
            this is something that Stable Diffusion requires. (You can override
            this, should you want to.)
          </StyledLi>
          <StyledLi>
            Fix: In some instances, image settings and requests were not reset
            if option to preserve settings was disabled.
          </StyledLi>
          <StyledLi>
            Attempt to fix inpainting scaling issues when importing via a mobile
            device.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2023.01.01</SubSectionTitle>
        <StyledUl>
          <StyledLi>Happy New Year!</StyledLi>
          <StyledLi>
            Fix: When importing an image for use with inpainting, automatically
            set custom dimensions of image request based on size of your painted
            image. (You can still change the size, but I find that this helps
            with preventing squashed images when inpainting if you forget to
            change the size).
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.29</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Feature: Option to use a specific worker on the{' '}
            <Linker href="/settings">settings page</Linker>. Useful for
            debugging purposes, testing your own worker, or testing new
            features.
          </StyledLi>
          <StyledLi>
            Minor fix: Loading spinner on{' '}
            <Linker href="/info/workers">workers page</Linker>, typo on drop
            down.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.28</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            MILESTONE: 🎉🎉🎉 2,000,000 images have been created with ArtBot!
            🎉🎉🎉
          </StyledLi>
          <StyledLi>Minor fix: Typo on FAQ page.</StyledLi>
          <StyledLi>
            UX: After selecting text trigger from dropdown, automatically focus
            text area so you can keep typing your prompt.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.27</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Minor fix: Issues with showing correct dimensions for upscaled
            images in some situations.
          </StyledLi>
          <StyledLi>
            Minor fix: Correct hostname when copying links while running project
            in local environment (e.g., localhost vs tinybots.net)
          </StyledLi>
          <StyledLi>
            Minor fix: CSS alignment issues with popup modal that handles things
            like feedback and prompt history. I&apos;d like to use this for some
            additional features in the future, so this better prepares things in
            advance.
          </StyledLi>
          <StyledLi>
            Change model trigger behavior to default always adding trigger to
            front of prompt.
            <AddedInfo>
              Thoughts behind this: Stable Diffusion tends to place more
              emphasis on words at the beginning of a prompt. If you&apos;re
              using a custom model, you probably want to trigger its special
              behavior, so placing prompt at front seems to make the most sense.
              Should this actually be a personal preference / configuration
              option? Let me know.
            </AddedInfo>
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.26</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Feature: Removed the ability to automatically add trigger words to
            select models... because you can now manually choose where and which
            trigger words to add. If you select a model that requires the use of
            trigger words, you&apos;ll now see a dropdown button above the
            prompt field to choose various options.
          </StyledLi>
          <StyledLi>Removed snowflakes... until next year!</StyledLi>
          <StyledLi>Show model version on info page.</StyledLi>
          <StyledLi>
            Hitting ESC should now close popup modals and drop down menus.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.24</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Happy holidays and Merry Christmas! (If you&apos;re into that sort
            of thing.) For those of us inhabiting the upper half of our planet,
            it&apos;s winter time. ⛄️ I&apos;ve added some festive snowflakes
            to celebrate. ❄️ (For those on the bottom half of the planet, what
            sort of thing signifies the holiday season for you? It definitely
            can&apos;t be snowflakes, right?)
          </StyledLi>
          <StyledLi>
            Feature: Added support for CodeFormers post-processing utility.
          </StyledLi>
          <StyledLi>
            Feature: Fine! Add ability to{' '}
            <Linker href="/settings?panel=prefs">
              disable snowflakes on the settings page
            </Linker>
            .
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.23</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Refactor: Made some changes in model selection. Now, you can select
            any model available within the Stable Horde models database, even if
            0 workers are available. In theory (hopefully, maybe), this means
            that a worker running dynamic models will eventually load your
            requested model. I am not entirely convinced that this works yet.
          </StyledLi>
          <StyledLi>
            Small UX improvements: Links to specific model details from advanced
            options panel. Links to view all favorite models. Display a warning
            for models with limited or no worker availability.
          </StyledLi>
          <StyledLi>
            Fix: In my model refactor last night, I broke the counter for
            checking if there are any workers supporting inpainting. This has
            now been fixed.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.22</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: Restore ability for favorite models and multi-model select to
            generate multiple images at a time. I thought I was fixing an
            inadvertent bug I had introduced a long time ago. It turns out, it
            was a useful feature. (Thanks for the feedback on{' '}
            <Linker
              href="https://discord.com/channels/781145214752129095/1038867597543882894"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </Linker>
            , Black Drapion!)
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.20</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fixed: Better handling of situations where someone may have selected
            multiple images, then chose an option such as use all models. This
            would create a ton of image requests (e.g., 8 images x 68 models =
            544 images!)
          </StyledLi>
          <StyledLi>
            Feature: Request multiple images by step count.
            <AddedInfo>
              Want to see how changing the number of steps affects image output?
              You can now pass in a comma separated list of values on the create
              image page and ArtBot will request multiple images. For example,
              requesting an image with steps of &quot;2,4,16,24&quot; will
              generate 4 images, each with a step associated with a specific
              value found within that list.
            </AddedInfo>
          </StyledLi>
          <StyledLi>
            Typo fixed in above text ☝️. (Thanks, anonymous user!)
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.19</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix issue where selecting &quot;useAllModels&quot; after having
            stable_diffusion_2 selected would try to request an incorrect
            sampler for all remaining models.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.16</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: Issue with denoise strength number input overflowing outside
            panel on mobile devices. (Thanks for reporting on{' '}
            <Linker
              href="https://discord.com/channels/781145214752129095/1038867597543882894"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </Linker>{' '}
            , voodoocode!)!)
          </StyledLi>
          <StyledLi>
            Fix: Negative prompts not showing up. (Thanks for reporting,
            anonymous user!)
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.15</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            UX: Can now select favorite prompts from prompt history and filter
            by favorite prompts.
          </StyledLi>
          <StyledLi>
            UX: Played around with slider arrangements and added plus / minus
            buttons to any number input field.
          </StyledLi>
          <StyledLi>
            Limit slider for logged in users to 150 steps (officially, you can
            still go up to 500, but trying to select a lower value using the
            slider was a pain). Thanks for the suggestion, anonymous user!
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.14</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: Settings page option for allowing NSFW images to be generated
            wasn&apos;t being respected.
          </StyledLi>
          <StyledLi>
            UX: Refactored some stuff related to drop down menus. For the most
            part, you won&apos;t see any changes, but you can now click outside
            the dropdown menu to make it automatically close.
          </StyledLi>
          <StyledLi>
            Feature: Prompt history! Click the handy clock icon at the top of
            the create image page and you&apos;ll see a running list of all
            prompts that you&apos;ve used (starting as of today).
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.13</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            MILESTONE: 1,500,000 images have been created with ArtBot!
          </StyledLi>
          <StyledLi>
            UX improvement: Added sliders to the various inputs on the advanced
            options panel. This is especially helpful for mobile users. (Thanks
            for the suggestion on Discord, bigdawg!)
          </StyledLi>
          <StyledLi>
            Added a pseudo-realtime counter for total number of images generated
            with ArtBot on the <Linker href="/about">about page</Linker>
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.12</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            UX improvement: Added an additional &quot;create&quot; button below
            the advanced options panel. (Thanks for the suggestion on{' '}
            <Linker
              href="https://discord.com/channels/781145214752129095/1038867597543882894"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </Linker>{' '}
            , voodoocode!)
          </StyledLi>
          <StyledLi>
            Feature: Bulk download of PNGs. The Stable Horde API has long served
            images in WebP to save bandwidth. Now, when you request a bulk
            download of image data, they are automatically converted to PNGs
            inside your browser. Note that this process may take some time
            depending on your device and the number of images you&apos;ve
            selected. (Thanks for the suggestion on Discord, honeypony!)
          </StyledLi>
          <StyledLi>
            Feature: You can now export all image data at once from the{' '}
            <Linker href="/settings?panel=import-export">settings page</Linker>.
            On my local machine, I was able to export 2100 images and the
            archive file was 1.4GB in size. An corresponding import feature will
            come soon, allowing you to import your data to a different device.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.09</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Sounds like DNS propagation has taken awhile, but ArtBot seems to be
            coming back online to various people around the world. I apologize
            for any delays. I wish DNS updates would happen faster.
          </StyledLi>
          <StyledLi>
            Fix: Issue where adding multiple models to an image request already
            using stable_diffusion_2 would cause API payload validation errors
            due to incorrect samplers. (
            <Linker
              href="https://github.com/daveschumaker/artbot-for-stable-diffusion/issues/21"
              target="_blank"
            >
              Thanks honeypony on Discord!
            </Linker>
            )
          </StyledLi>
          <StyledLi>
            UX: There have been few workers offering inpainting services lately
            due to memory leaks and crashing issues when running an inpainting
            model. Now, when no workers are available, the inpainting panel will
            actually tell you this. No more mysterious wait times (hopefully).
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.08</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fun fact: ArtBot had been hosted on a Raspberry Pi running in our
            hallway closet this whole time. I decided to do some server
            updates... and broke everything. My apologies for the site being
            down awhile today. However, ArtBot is now on a legit hosting
            service. No more Raspberry Pi!
          </StyledLi>
          <StyledLi>
            Enable fetching images from Cloudflare R2 by default.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.07</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: Pesky bug that duplicated all image requests if &quot;use all
            samplers&quot; was selected and the image job had encountered an
            error. (Thanks, anonymous user!)
          </StyledLi>
          <StyledLi>
            Refactor: Split up some components for better reusability. In
            addition to you being able to manage your own worker, you can also
            see a{' '}
            <Linker href="/info/workers" passHref>
              list of all workers currently available on Stable Horde
            </Linker>
            , as well as their performance stats.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.06</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: Issue with attempting to use non-trusted workers. (
            <Linker
              href="https://github.com/daveschumaker/artbot-for-stable-diffusion/issues/20"
              target="_blank"
            >
              Thanks voodoocode!
            </Linker>
            )
          </StyledLi>
          <StyledLi>
            Added option to search model and sampler dropdowns. (
            <Linker
              href="https://github.com/daveschumaker/artbot-for-stable-diffusion/pull/19"
              target="_blank"
            >
              Thanks voodoocode!
            </Linker>
            )
          </StyledLi>
          <StyledLi>Update style presets.</StyledLi>
          <StyledLi>
            Feature: Select favorite models and then generate images against
            them. You can select your favorite Stable Diffusion models{' '}
            <Linker href="/info" passHref>
              here
            </Linker>
            .
          </StyledLi>
          <StyledLi>
            Feature: Generate a series of images using all available samplers.
            Works best if you fix the seed ahead of time.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.05</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: &quot;Save input on create&quot; option wasn&apos;t working.
            (Thanks for reporting, bigdawg on Discord)
          </StyledLi>
          <StyledLi>
            Feature: Support for using a prompt matrix. For example:
            &quot;Beautiful forest full of trees by{' '}
            {`{Bob Ross|Thomas Kinkade}`}&quot; will create two images, one with
            the Bob Ross parameter and another with the Thomas Kinkade
            parameter. This mode works best if you fix the seed ahead of time.
          </StyledLi>
          <StyledLi>
            Add kudos cost calculation when modifying image parameters.
          </StyledLi>
          <StyledLi>
            Added experimental option to get images from Cloudflare R2 service
            (this will be default behavior in the future). For end users, this
            means the potential for generating real lossless images.
          </StyledLi>
          <StyledLi>
            Added an option to stay on create page after requesting a new image.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.04</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Experimental feature: Added a &quot;no sleep&quot; option to the{' '}
            <Linker href="/settings?panel=pref" passHref>
              settings page
            </Linker>{' '}
            which uses background audio APIs to keep your mobile device screen
            awake.
            <AddedInfo>
              This is useful in instances where you may have queued up a large
              number of images on your mobile device and want the process to
              continue running. This is an experimental feature.{' '}
              <LinkButton onClick={() => setShowFeedback(true)}>
                Leave me feedback
              </LinkButton>{' '}
              if anything looks amiss.
            </AddedInfo>
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.02</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Shareable model information. Do you want to know more about{' '}
            <Linker href="/info/models#Clazy" passHref>
              Clazy?
            </Linker>{' '}
            Or maybe share the details about this particular model with a
            friend? Easy! Hit the link icon next to the model name.
          </StyledLi>
          <StyledLi>
            Updated inputs in advanced options tab to be number fields (and make
            it easier to step between values).{' '}
            <Linker
              href="https://github.com/daveschumaker/artbot-for-stable-diffusion/pull/18"
              target="_blank"
            >
              Thanks voodoocode!
            </Linker>
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.12.01</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Refactored the <Linker href="/pending">pending items page</Linker>.
            Previously, if you queued up a whole bunch of images, things would
            jump around, disappear, etc. It was just an annoying experience for
            everyone.
          </StyledLi>
          <StyledLi>
            Refactored the <Linker href="/settings">settings page</Linker>. The
            layout is more logical now. There is also a simplified tool for
            managing workers (if you happen to be contributing your GPU power to
            The Horde).
          </StyledLi>
          <StyledLi>
            Feature: Automatically restore prompts after server is updated.
            <AddedInfo>
              If you have been bitten by the issue where I push an update to
              ArtBot while you&apos;re in the middle of writing a prompt and
              then lose everything because the page reloads... I&apos;m really
              sorry! This should no longer happen! Your prompts (and associated
              image generation settings) will be automatically restored after
              future server updates.
            </AddedInfo>
          </StyledLi>
          <StyledLi>
            Add some additional telemetry to better log requests created using
            the beta option for better error handling and performance
            monitoring.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.29</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: Finally fixed the pesky bug where everything would disappear
            from pending items page when you clicked retry or delete.
          </StyledLi>
          <StyledLi>
            Feature: Styles! Are you having a hard time coming up with a prompt
            to give you good looking images? Over on the{' '}
            <Linker
              href="https://discord.com/channels/781145214752129095/1027506429139095562"
              target="_blank"
            >
              Stable Horde Discord channel
            </Linker>
            , Db0 has implemented a bot that can make it easier to emulate a
            number of different art styles. There is now a styles dropdown below
            the prompt textbox where you can choose one of these style presets.
            You can see prompt details related to various styles on{' '}
            <Linker
              href="https://github.com/db0/Stable-Horde-Styles"
              target="_blank"
            >
              Github
            </Linker>
            .
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.28</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Refactor: More work on caching model data from Stable Horde API so
            that it is immediately available on page load.
          </StyledLi>
          <StyledLi>
            Fix: Clicking the &quot;upscale image&quot; link from any image
            details page should now work properly. (I broke this while trying to
            create some new classes for handling image requests, reroll
            requests, and upscale requests.)
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.27</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: Resolve issue where sampler field would be empty when switching
            from stable_diffusion_2.0 model to something else. This would cause
            API errors when submitting a new image request. (Thanks for
            reporting this, anonymous user!)
          </StyledLi>
          <StyledLi>
            Fix: Resolve issue with &quot;use all models&quot; option not
            actually using all models. (Also, thanks for reporting this,
            anonymous user!)
          </StyledLi>
          <StyledLi>
            Fix: Number of images calculation was wrong. (Thanks for reporting,{' '}
            <Linker
              href="https://github.com/daveschumaker/artbot-for-stable-diffusion/issues/16"
              target="_blank"
            >
              KyuubiYoru
            </Linker>
            ). I also added multi-images per model when using multi-model
            select. (e.g., if you choose 3 different models and want to generate
            4 images, you will get 4 images per each model)
          </StyledLi>
          <StyledLi>
            Fix: Upscaling an image that had been created with the
            &quot;useAllModels&quot; option created a new batch of images using
            every single model available, instead of just one.
          </StyledLi>
          <StyledLi>
            Minor feature: Created a micro-service to better push relevant
            updates to ArtBot front page without having to redeploy. This
            handles the &quot;API is currently under high load...&quot; warning
            you might have seen as of late.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.26</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            MILESTONE: 🎉🎉🎉 1,000,000 images have been created with ArtBot!
            🎉🎉🎉
            <AddedInfo>
              Absolutely amazing. Thanks to everyone for suggestions, feedback,
              and using the site. This has been a fun side project and I&apos;m
              very grateful to Db0 and the rest of the Stable Horde community
              for creating such an awesome project! Here&apos;s to the next
              million. 😎
            </AddedInfo>
          </StyledLi>
          <StyledLi>
            Feature: Shareable links. This is something I&apos;ve wanted to do
            for awhile and StableUI (the other big Stable Horde web UI),
            recently implemented it. Now you can share your ArtBot image
            generations with others. For example:{' '}
            <Linker href="https://tinybots.net/artbot?share=N4IgDgTg9gtmAuIBcIDKMCWAbDA7A5gAQCGEGAzvFAMYTHzmEAWUWAJnkVqfgKaHkc1XoygAzZsRgAaQgCNexAK7wMYpVhK42AgJ4wYveGWrFNY4sPKyo2QmGJ5VBWXNJQAjkv6VdWXiDSILi8+PQYAG4BKIHgpFLkyADaIBEAjIEArGkATNIA7ABsABxBANYA+rwavBAVxIE5ACzSAJxBxfnFAMwlTa3FsZTEcv4VHGLq5BhQuIHG3tIpAOIAYgAKywCCAHIgALpL+-sAvkA">
              Smiling aristocrats holding slices of ham.
            </Linker>
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.25</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Stability.Ai released their Stable Diffusion 2.0 model yesterday.
            The model was quickly added to Stable Horde and due to increased
            demand, the cluster has been under a pretty heavy load (all Stable
            Horde UIs seem to be slow lately). Things seem to be getting a bit
            better, but requests are still a bit slow. You can try out the new
            model <Linker href="/?model=stable_diffusion_2.0">here</Linker>.
          </StyledLi>
          <StyledLi>
            Fix: Implemented better caching of model details and model
            availability on my own server. Various API calls to the Stable Horde
            API were encountering response times of up to 10 seconds. This made
            the whole ArtBot experience... not very pleasant.
          </StyledLi>
          <StyledLi>
            Fix: Finally remember selected model when navigating between pages!
          </StyledLi>
          <StyledLi>
            Fix: Multi-model select dropdown stays open after selecting an
            initial model.
          </StyledLi>
          <StyledLi>
            Fix: When choosing to generate multiple images, only 1 image was
            ever generated.
          </StyledLi>
          <StyledLi>
            Fix: Fix issue where pending items page showed there were active
            pending jobs, but nothing appeared on the page.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.23</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            MILESTONE: 900,000 images have been created with ArtBot!
          </StyledLi>
          <StyledLi>
            Refactored some things related to fetching model details to better
            cache data and hopefully make the{' '}
            <Linker href="/info">info page</Linker> snappier.
          </StyledLi>
          <StyledLi>Minor: Update various packages.</StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.22</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Feature: New <Linker href="/info">info tab</Linker> with stats and
            information about all models currently available via Stable Horde.
            See which models are in high demand, how many workers are currently
            serving the model and how many images you&apos;ve generated with
            each model.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.21</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            MILESTONE: 800,000 images have been created with ArtBot!
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.20</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: If a pending image job encounters an error state (e.g., max
            concurrent requests, invalid params, anon user limits, flagged
            prompt, horde offline, etc), all related pending jobs will
            automatically have the same error state applied. This will prevent
            us from unnecessarily slamming the Horde API and potentially having
            requests from your IP address throttled.
          </StyledLi>
          <StyledLi>
            Because of the above fix, we can now update max images per job. Lets
            bump it up to... 100!
          </StyledLi>
          <StyledLi>
            Initial support for new showcases field in the Stable Horde API that
            highlights example images for each model.
          </StyledLi>
          <StyledLi>
            Added optional setting to allow web app to run in background tab.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.19</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: Resolve issue with allowing the generation of NSFW images and
            which workers a job was sent to.
          </StyledLi>
          <StyledLi>
            Feature: Added option on settings page to preserve image generation
            parameters after creating a new image.
          </StyledLi>
          <StyledLi>
            Feature: Show kudos associated with your StableHorde account.{' '}
            <Linker
              href="https://github.com/daveschumaker/artbot-for-stable-diffusion/pull/12"
              target="_blank"
            >
              (Thanks to Florian for the PR)
            </Linker>
          </StyledLi>
          <StyledLi>
            Fix: Trusted worker option on settings page would not remember value
            after leaving tab.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.18</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            MILESTONE: 700,000 images have been created with ArtBot!
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.17</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: useAllModels option was broken after the refactor I did
            yesterday. It&apos;s now fixed.
          </StyledLi>
          <StyledLi>
            Fix: Sort by number of available models in model select dropdown on
            the create page.
          </StyledLi>
          <StyledLi>
            Feature: The Horde now supports upscalers like RealESRGAN_x4plus and
            face correction tools such as GFPGAN. These have now been added into
            ArtBot (see both the advanced parameters on the image generation
            page, as well as the advanced options below any image).
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.16</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            MILESTONE: 600,000 images have been created with ArtBot!
          </StyledLi>
          <StyledLi>
            Tackling some personal tech debt -- refactored how models are
            fetched and cached from backend API
          </StyledLi>
          <StyledLi>
            Refactored some telemetry tooling for determining which features are
            used, what things break, etc.
          </StyledLi>
          <StyledLi>
            Support for multi-trigger select for available models (currently
            only 1 available). You can mix and match potential triggers to
            change the style of a supported model.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.14</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            {' '}
            MILESTONE: 🎉🎉🎉 <strong>500,000</strong> 🎉🎉🎉 images have been
            created with ArtBot!!! The pace has definitely picked up. That is
            awesome to see.
          </StyledLi>
          <StyledLi>
            Replaced document.hasFocus() with{' '}
            <Linker
              href="https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState"
              target="_blank"
            >
              document.visibilityState
            </Linker>{' '}
            so that images can still be requested and fetched if ArtBot is
            visible in another tab or monitor. Big thanks to
            &quot;headhunterjack&quot; on Discord.
          </StyledLi>
          <StyledLi>
            Feature: Negative prompt library on the{' '}
            <Linker href="/">create page</Linker>. Rather than having to
            remember to repeatedly paste in a negative prompt, you can now
            optionally save the prompt as load it by default. You can also save
            multiple negative prompts!
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.13</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Feature: Preserve input settings when navigating around ArtBot.
            <AddedInfo>
              It&apos;s frustrating to have added all sorts of input for an
              image and then you click some other link on ArtBot to check
              something and then all the data is lost when you return. No more!
              Data is preserved if you move away from the create page. This
              state gets reset when you create a new image.
            </AddedInfo>
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.12</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix (hopefully): When rerolling existing images or retrying pending
            images, sometimes ArtBot would forget what model you had originally
            selected and revert to the default model (&quot;stable
            diffusion&quot;).
          </StyledLi>
          <StyledLi>
            Fix: Selecting random in the models dropdown never actually selected
            a random model.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.11</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            MILESTONE: That was fast. 400,000 images have been created with
            ArtBot!
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.10</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix: When using the &quot;use all available models&quot; option, do
            not send a request to &quot;stable_diffusion_inpainting&quot;.
          </StyledLi>
          <StyledLi>
            Added number of currently available models to &quot;use all
            available models&quot; option.{' '}
          </StyledLi>
          <StyledLi>
            Feature: Navigate between multiple pages on{' '}
            <Linker href="/images">images page</Linker> using arrow keys on a
            computer or swiping on a mobile device.
          </StyledLi>
          <StyledLi>
            Fix: Adjusted max steps (down) for various samplers for anonymous
            users -- this contributed to a number of frustrating error messages
            from the Stable Horde API when trying to create images.
          </StyledLi>
          <StyledLi>
            Fix: I think I found the issue with the pesky &quot;90 per 1
            minute&quot; rate limiting error. A number of people open images up
            in new tabs. Each one of those tabs is firing off API calls to
            Stable Horde (especially if you are generating and checking a number
            of image requests). This makes it easy to inadvertently hit a rate
            limit and get unexplained errors. Now, API calls will only happen in
            the active browser tab. Things should be much smoother now. Thanks
            to &quot;webhead&quot; on Discord for helping me to track this down.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.09</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            MILESTONE: 300,000 images have been created with ArtBot! (33,000 in
            the last 24 hours)
          </StyledLi>
          <StyledLi>
            Made a number of improvements to pending items page, such as filters
            and options to edit or retry image requests when an error is
            detected from the Stable Horde API.
          </StyledLi>
          <StyledLi>
            Thanks to some refactored logic with the pending items queue,
            I&apos;ve upped limit of images that can be requested at once.
          </StyledLi>
          <StyledLi>
            Fix: issue where clicking &quot;reroll&quot; on an image created
            with the &quot;use all models&quot; options resulted in re-running
            the job again... the whole thing (this meant 20+ new images, when
            you probably only wanted one).
          </StyledLi>
          <StyledLi>
            For those so inclined, I added a{' '}
            <Linker href="https://www.buymeacoffee.com/davely" target="_blank">
              buy me a coffee
            </Linker>{' '}
            link to the <Linker href="/about">about page</Linker>.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.08</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Feature: Bulk download images from the{' '}
            <Linker href="/images">images page</Linker>. Hit the select button
            in the top right, pick the images you want and then click the
            download link. A zip file will be created with your images, as well
            as a json file that lists all the relevant image generation details
            (handy if you need to recreate or reference the image details
            later).
          </StyledLi>
          <StyledLi>
            Feature: Generate an image using all models at once! In the advanced
            options panel on the <Linker href="/">create page</Linker>, scroll
            down and select &quot;use all available models&quot;. You will get
            an image back for each model currently available on Stable Horde.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.07</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Fix denoising strength not showing up on advanced options panel when
            creating a new img2img request. (Note: due to limitations with the
            Stable Horde API, denoise is only available for img2img and not
            inpainting)
          </StyledLi>
          <StyledLi>
            Updated max steps to 500 for logged in users, providing you have
            enough kudos (add your Stable Horde API key to the settings page to
            log in).
          </StyledLi>
          <StyledLi>Fix: You can now choose random models again.</StyledLi>
          <StyledLi>
            Model descriptions now added below dropdown on advanced options
            panel. If a custom model requires the use of a trigger to activate,
            it is now automatically added to the beginning of your prompt when
            sent to the API.
          </StyledLi>
          <StyledLi>
            Added advanced option to use the karras scheduler, which should help
            improve image generation at lower step counts.
          </StyledLi>
          <StyledLi>
            Feature: You can now use the left and right arrow keys (on desktop),
            or swipe left and right (on mobile) to navigate between related
            images on each image page... providing they exist, of course.
            Additionally, on desktop, if you tap &quot;F&quot;, you can quickly
            favorite or unfavorite an image.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.06</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Feature: Mark images as favorites, and filter images on the main
            gallery page (by favorited / non-favorited, image generation type
            and more to come soon).
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.05</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Feature: Bulk delete images from the{' '}
            <Linker href="/images">images page</Linker>. Just hit the select /
            checkmark button in the top right to start choosing. I will bring
            this to the image details page in the near future.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.04</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            MILESTONE: 200,000 images have been created with ArtBot!
          </StyledLi>
          <StyledLi>
            Add dropdown menu button to{' '}
            <Linker href="/images">images page</Linker> to change sort order of
            images and layout
          </StyledLi>
          <StyledLi>
            Better limits and validation for advanced parameters on the create
            image page, this is especially helpful for logged out or anonymous
            users.
          </StyledLi>
          <StyledLi>
            Make ID of the worker that generated an image visible on image
            details page. This is useful in case you need to report an unsavory
            worker that is running within the cluster. You can report these
            sorts of images on the{' '}
            <Linker
              href="https://discord.com/channels/781145214752129095/1027506429139095562"
              target="_blank"
            >
              Stable Horde Discord channel
            </Linker>
            .
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.11.03</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            FEATURE: Big changes!{' '}
            <Linker href="/?panel=inpainting">Inpainting is now live.</Linker>{' '}
            Upload a photo from a URL, from your device or even use an existing
            image that you&apos;ve created.
          </StyledLi>
          <StyledLi>
            FEATURE: Custom image orientations (you are no longer limited to the
            few aspect ratios I provided for you). Image dimensions must be
            divisible by 64, but I handle that for you after you&apos;ve entered
            your desired dimensions.
          </StyledLi>
          <StyledLi>
            In my endless tinkering, the advanced options panel on the create
            page is now open by default.
          </StyledLi>
          <StyledLi>
            Added some validation to various input fields inside advanced
            options, as well as subtext defining the required parameters.
          </StyledLi>
          <StyledLi>
            Temporarily removed painter page while I refactor a few things to
            make it more mobile friendly (and to tie into the existing img2img
            and inpainting system)
          </StyledLi>
          <StyledLi>
            Add ability to sort <Linker href="/images">images page</Linker> by
            newest or oldest images, as well as the ability to jump to the
            beginning or end of your image collection.
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.10.30</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            Add some debugging logic to attempt to capture some pesky
            &quot;server did not respond to the image request&quot; errors that
            some people are encountering. Pretty sure it&apos;s something on my
            end and not with the Stable Horde cluster.
          </StyledLi>
          <StyledLi>
            Small design change to paint page to make toolbar and overall theme
            more consistent across dark / light mode.
          </StyledLi>
          <StyledLi>
            Fix: Hide inpainting model from models dropdown in non inpainting
            contexts. (e.g., selecting a model from the dropdown menu when doing
            a simple text2img prompt)
          </StyledLi>
          <StyledLi>
            Small feature: Support for uploading images into the{' '}
            <Linker href="/paint">painter page</Linker>
          </StyledLi>
        </StyledUl>
      </Section>
      <Section>
        <SubSectionTitle>2022.10.28</SubSectionTitle>
        <StyledUl>
          <StyledLi>
            NEW FEATURE: 🎨 <Linker href="/paint">Painting!</Linker> You can now
            paint your own images and then send them to the img2img feature.
            <AddedInfo>
              Turn your cheesy drawings into awesome AI generated art. This is
              somewhat in beta as I&apos;m working out some kinks with the
              painting library{' '}
              <Linker href="http://fabricjs.com/" target="_blank">
                (Fabric.js)
              </Linker>
              . This should also lay the groundwork for inpainting support once
              the Stable Horde cluster supports it.
            </AddedInfo>
          </StyledLi>
          <StyledLi>
            Show source image on details page if an image was generated via
            img2img. Also added an upload icon in the top right corner of this
            source image, so you can quickly create / modify a new prompt using
            the original image.
          </StyledLi>
        </StyledUl>
      </Section>
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
            Fixed: issue when attempting to choose a random sampler.
          </StyledLi>
          <StyledLi>
            Fixed: issue where choosing a model (e.g., stable_diffusion) would
            get saved as a variable for samplers, resulting in payload
            validation errors from the API. This is why testing your code is
            important. Ah hem.
          </StyledLi>
          <StyledLi>
            Track initial estimated wait time returned from API
            <AddedInfo>
              Relates to future feature that will attempt to detect if job has
              gone stale and attempt to retry / resubmit
            </AddedInfo>
          </StyledLi>
          <StyledLi>
            Add new contact form accessible from the{' '}
            <Linker href="/about">about page</Linker>. Questions, comments, or
            bug reports? Send me a message.
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
        <SubSectionTitle>2022.10.14</SubSectionTitle>
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
