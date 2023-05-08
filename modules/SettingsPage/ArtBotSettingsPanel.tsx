import Section from 'components/UI/Section'
import AlertDialogBox from '../../components/UI/AlertDialogBox'
import PageTitle from 'components/UI/PageTitle'
import SubSectionTitle from 'components/UI/SubSectionTitle'
import ReactSwitch from 'react-switch'
import AppSettings from 'models/AppSettings'
import MaxWidth from 'components/UI/MaxWidth'
import Select from 'components/UI/Select'
import Linker from 'components/UI/Linker'
import { useState } from 'react'
import { Button } from 'components/UI/Button'
import { db, generateThumbnails } from 'utils/db'

const ArtBotSettingsPanel = ({ componentState, setComponentState }: any) => {
  const [processState, setProcessState] = useState('')
  const [totalToProcess, setTotalToProcess] = useState(0)
  const [currentProcessIdx, setCurrentProcessIdx] = useState(0)

  const handleSwitchSelect = (key: string, value: boolean) => {
    AppSettings.save(key, value)
    setComponentState({ [key]: value })
  }

  const handleUpdateSelect = (key: string, obj: any) => {
    const { value } = obj
    AppSettings.save(key, value)
    setComponentState({ [key]: value })
  }

  return (
    <>
      {componentState.showResetConfirmation && (
        <AlertDialogBox
          title="Are you sure you want to reset your preferences?"
          message="This option will reset all user settings found on this settings page. (e.g., API key, image download preferences, stored input values, etc). Your images will be safe. However, please save your API key before continuing."
          onConfirmClick={() => {
            localStorage.clear()
            window.location.reload()
          }}
          closeModal={() => {
            setComponentState({ showResetConfirmation: false })
          }}
        />
      )}
      <Section>
        <PageTitle as="h2">ArtBot Preferences</PageTitle>
        <SubSectionTitle>
          <strong>Stay on create page?</strong>
          <div className="block w-full mt-2 mb-2 text-xs">
            After clicking &quot;create&quot; on the image generation page, stay
            on the page, rather than show pending items.
          </div>
        </SubSectionTitle>
        <div className="flex flex-row items-center gap-2">
          <ReactSwitch
            onChange={() => {
              if (componentState.stayOnCreate) {
                handleSwitchSelect('stayOnCreate', false)
              } else {
                handleSwitchSelect('stayOnCreate', true)
              }
            }}
            checked={componentState.stayOnCreate}
          />
        </div>
      </Section>
      <Section>
        <SubSectionTitle>
          <strong>Save on create?</strong>
          <div className="block w-full mt-2 mb-2 text-xs">
            After clicking &quot;create&quot; on the image generation page,
            preserve the following settings. (All other settings will be
            remembered.)
          </div>
        </SubSectionTitle>
        <div className="flex flex-row items-center gap-2 mt-2">
          <div className="w-[100px] text-sm">Prompt?</div>
          <ReactSwitch
            onChange={() => {
              if (componentState.savePromptOnCreate) {
                handleSwitchSelect('savePromptOnCreate', false)
              } else {
                handleSwitchSelect('savePromptOnCreate', true)
              }
            }}
            checked={componentState.savePromptOnCreate}
          />
        </div>
        <div className="flex flex-row items-center gap-2 mt-2">
          <div className="w-[100px] text-sm">Seed?</div>
          <ReactSwitch
            onChange={() => {
              if (componentState.saveSeedOnCreate) {
                handleSwitchSelect('saveSeedOnCreate', false)
              } else {
                handleSwitchSelect('saveSeedOnCreate', true)
              }
            }}
            checked={componentState.saveSeedOnCreate}
          />
        </div>
        <div className="flex flex-row items-center gap-2 mt-2">
          <div className="w-[100px] text-sm">Canvas</div>
          <ReactSwitch
            onChange={() => {
              if (componentState.saveCanvasOnCreate) {
                handleSwitchSelect('saveCanvasOnCreate', false)
              } else {
                handleSwitchSelect('saveCanvasOnCreate', true)
              }
            }}
            checked={componentState.saveCanvasOnCreate}
          />
        </div>
      </Section>
      <Section>
        <SubSectionTitle>
          <strong>Preferred image format</strong>
          <div className="block w-full mt-2 mb-2 text-xs">
            Choose your preferred format when downloading images from ArtBot
          </div>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          width="240px"
        >
          <Select
            isSearchable={false}
            onChange={(obj: any) => {
              handleUpdateSelect('imageDownloadFormat', obj)
            }}
            options={[
              { value: 'jpg', label: 'jpg' },
              { value: 'png', label: 'png' },
              { value: 'webp', label: 'webp' }
            ]}
            value={{
              value: componentState.imageDownloadFormat,
              label: componentState.imageDownloadFormat
            }}
          />
        </MaxWidth>
      </Section>
      <Section>
        <SubSectionTitle>
          <strong>Run in background?</strong>
          <div className="block w-full mt-2 mb-2 text-xs">
            By default, ArtBot only runs in the active browser tab in order to
            try and help prevent your IP address from being throttled. You may
            disable this behavior if you wish.
          </div>
        </SubSectionTitle>
        <div className="flex flex-row items-center gap-2">
          <ReactSwitch
            onChange={() => {
              if (componentState.runInBackground) {
                handleSwitchSelect('runInBackground', false)
              } else {
                handleSwitchSelect('runInBackground', true)
              }
            }}
            checked={componentState.runInBackground}
          />
        </div>
      </Section>
      <Section>
        <SubSectionTitle>
          <strong>Enable page swipe on image gallery page?</strong>
          <div className="block w-full mt-2 mb-2 text-xs">
            On mobile devices, this option allows you to swipe between full
            pages of images on the{' '}
            <Linker href="/images">images gallery page</Linker>.
          </div>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          width="240px"
        >
          <ReactSwitch
            onChange={() => {
              if (componentState.enableGallerySwipe) {
                handleSwitchSelect('enableGallerySwipe', false)
              } else {
                handleSwitchSelect('enableGallerySwipe', true)
              }
            }}
            checked={componentState.enableGallerySwipe}
          />
        </MaxWidth>
      </Section>
      <Section>
        <SubSectionTitle>
          <strong>Disable new image notification?</strong>
          <div className="block w-full mt-2 mb-2 text-xs">
            This option disabled the new image notification toast that pops up
            in the top right corner of the web app when ArtBot receives a new
            image from the AI Horde backend.
          </div>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          width="240px"
        >
          <ReactSwitch
            onChange={() => {
              handleSwitchSelect(
                'disableNewImageNotification',
                !componentState.disableNewImageNotification
              )
            }}
            checked={componentState.disableNewImageNotification}
          />
        </MaxWidth>
      </Section>
      <Section>
        <SubSectionTitle>
          <strong>Generate thumbnails?</strong>
          <div className="block w-full mt-2 mb-2 text-xs">
            ArtBot recently implemented image thumbnails to help the image
            gallery become more performant, especially on mobile devices. Older
            images, created before 2023.03.06, will not have image thumbnails.
            If you wish, you may manually kick off this process.
          </div>
          <div className="block w-full mb-2 text-xs">
            <strong>WARNING:</strong> Depending on the number of images, this
            could take some time. (On my iPhone 14 Pro, it took about 100
            seconds to process 3,000 images)
          </div>
          {totalToProcess > 0 && (
            <div className="block w-full mb-2 text-xs">
              {processState} {currentProcessIdx} of {totalToProcess}{' '}
              {processState === 'Analyzing' ? 'images' : 'thumbnails'}.
            </div>
          )}
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          width="240px"
        >
          <Button
            onClick={() => {
              // @ts-ignore
              generateThumbnails(({ total, current, state }) => {
                setTotalToProcess(total)
                setCurrentProcessIdx(current)
                setProcessState(state)
              })
            }}
          >
            Generate thumbnails
          </Button>
        </MaxWidth>
      </Section>
      <Section>
        <SubSectionTitle>
          <strong>Download debugging logs?</strong>
          <div className="block w-full mt-2 mb-2 text-xs">
            This is really only used in case you&apos;re encountering some
            issues with ArtBot and are asked to provide some additional logs.
          </div>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          width="240px"
        >
          <Button
            onClick={() => {
              //@ts-ignore
              window.artbotDownloadLogs()
            }}
          >
            Download
          </Button>
        </MaxWidth>
      </Section>
      <Section>
        <SubSectionTitle>
          <strong>Reset ArtBot settings in local storage?</strong>
          <div className="block w-full mt-2 mb-2 text-xs">
            In some instances, ArtBot settings could have been corrupted. Use
            this option to reset all user settings found on this settings page
            (e.g., API key, image download preferences, stored input values,
            etc).
          </div>
          <div className="block w-full mt-2 mb-2 text-xs">
            Please save your <strong>API key</strong> before doing this!
          </div>
          <div className="block w-full mt-2 mb-2 text-xs">
            The prompt history database and image database will not be touched
            and your images will still be available after this reset.
          </div>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          width="240px"
        >
          <Button
            theme="secondary"
            onClick={() => setComponentState({ showResetConfirmation: true })}
          >
            Reset Preferences?
          </Button>
        </MaxWidth>
      </Section>
      <Section>
        <SubSectionTitle>
          <strong>Reset Input Cache?</strong>
          <div className="block w-full mt-2 mb-2 text-xs">
            In some instances, input cache settings could have been corrupted.
            Use this option to reset cached data found on the create page (e.g.,
            steps, guidance, last used sampler, last used model).
          </div>
          <div className="block w-full mt-2 mb-2 text-xs">
            The prompt history database and image database will not be touched
            and your images will still be available after this reset.
          </div>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          width="240px"
        >
          <Button
            theme="secondary"
            onClick={() => {
              localStorage.removeItem('PromptInputSettings')
              window.location.assign(`${window.location.origin}/artbot`)
            }}
          >
            Reset Input Cache?
          </Button>
        </MaxWidth>
      </Section>
      <Section>
        <SubSectionTitle>
          <strong>Clear pending items table?</strong>
          <div className="block w-full mt-2 mb-2 text-xs">
            In some instances, a data corruption issue can occur on the pending
            items page due to an unknown race condition that hasn&apos;t been
            solved yet. When this happens, you will encounter an error when
            trying to access the pending items page.
          </div>
          <div className="block w-full mt-2 mb-2 text-xs">
            The image database will not be touched and your images will still be
            available after this reset.
          </div>
        </SubSectionTitle>
        <MaxWidth
          // @ts-ignore
          width="240px"
        >
          <Button
            theme="secondary"
            onClick={async () => {
              await db.pending.clear()
              window.location.assign(`${window.location.origin}/artbot/pending`)
            }}
          >
            Reset Pending Items?
          </Button>
        </MaxWidth>
      </Section>
      {/* <Section>
                <SubSectionTitle>
                  Disable snow flakes
                  <div className="block w-full mt-2 mb-2 text-xs">
                    Turn off snow flakes (a temporary feature enabled during
                    Christmastime here in California). NOTE: Requires page
                    reload.
                  </div>
                </SubSectionTitle>
                <MaxWidth
                  // @ts-ignore
                  width="240px"
                >
                  <Select
                    options={[
                      { value: true, label: 'Yes' },
                      { value: false, label: 'No' }
                    ]}
                    onChange={(obj: any) =>
                      handleUpdateSelect('disableSnowflakes', obj)
                    }
                    value={
                      componentState.disableSnowflakes
                        ? { value: true, label: 'Yes' }
                        : { value: true, label: 'No' }
                    }
                  />
                </MaxWidth>
              </Section> */}
    </>
  )
}

export default ArtBotSettingsPanel
