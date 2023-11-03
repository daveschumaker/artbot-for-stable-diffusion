import Section from 'app/_components/Section'
import AlertDialogBox from 'app/_components/AlertDialogBox'
import PageTitle from 'app/_components/PageTitle'
import SubSectionTitle from 'app/_components/SubSectionTitle'
import AppSettings from 'app/_data-models/AppSettings'
import MaxWidth from 'app/_components/MaxWidth'
import Select from 'app/_components/Select'
import Linker from 'app/_components/Linker'
import { useState } from 'react'
import { Button } from 'app/_components/Button'
import { generateThumbnails } from 'app/_utils/db'
import { deletePendingJobs } from 'app/_controllers/pendingJobsCache'
import { basePath } from 'BASE_PATH'
import InputSwitchV2 from 'app/_modules/AdvancedOptionsPanel/InputSwitchV2'
import FlexCol from 'app/_components/FlexCol'
import { updateTheme } from 'app/_modules/AppTheme/controller'
import { db } from 'app/_db/dexie'

const ArtBotSettingsPanel = ({ componentState, setComponentState }: any) => {
  const [processType, setProcessType] = useState<string | null>(null)
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
      </Section>
      <Section pb={12}>
        <MaxWidth style={{ maxWidth: '240px' }}>
          <SubSectionTitle>
            <strong>ArtBot Theme</strong>
          </SubSectionTitle>
          <div className="flex flex-row gap-2 items-center">
            <Select
              options={[
                { value: 'dark', label: 'dark' },
                { value: 'light', label: 'light' },
                { value: 'system', label: 'system' }
              ]}
              isSearchable={false}
              onChange={(obj: any) => {
                localStorage.setItem('theme', obj.value)
                handleUpdateSelect('theme', obj)
                updateTheme(obj.value)
              }}
              value={{
                value: componentState.theme,
                label: componentState.theme
              }}
            />
          </div>
        </MaxWidth>
      </Section>
      <Section pb={12}>
        <SubSectionTitle>
          <strong>Save on create?</strong>
        </SubSectionTitle>
        <div
          style={{ fontSize: '12px', maxWidth: '512px', paddingBottom: '12px' }}
        >
          After clicking &quot;create&quot; on the image generation page,
          preserve the following settings. (All other settings will be
          remembered.)
        </div>
        <FlexCol style={{ rowGap: '8px' }}>
          <InputSwitchV2
            label={<strong>Prompt?</strong>}
            handleSwitchToggle={() => {
              if (componentState.savePromptOnCreate) {
                handleSwitchSelect('savePromptOnCreate', false)
              } else {
                handleSwitchSelect('savePromptOnCreate', true)
              }
            }}
            checked={componentState.savePromptOnCreate}
          />
          <InputSwitchV2
            label={<strong>Seed?</strong>}
            handleSwitchToggle={() => {
              if (componentState.saveSeedOnCreate) {
                handleSwitchSelect('saveSeedOnCreate', false)
              } else {
                handleSwitchSelect('saveSeedOnCreate', true)
              }
            }}
            checked={componentState.saveSeedOnCreate}
          />
          <InputSwitchV2
            label={<strong>Canvas?</strong>}
            handleSwitchToggle={() => {
              if (componentState.saveCanvasOnCreate) {
                handleSwitchSelect('saveCanvasOnCreate', false)
              } else {
                handleSwitchSelect('saveCanvasOnCreate', true)
              }
            }}
            checked={componentState.saveCanvasOnCreate}
          />
        </FlexCol>
      </Section>
      <Section pb={12}>
        <InputSwitchV2
          label={<strong>Stay on create page?</strong>}
          handleSwitchToggle={() => {
            if (componentState.stayOnCreate) {
              handleSwitchSelect('stayOnCreate', false)
            } else {
              handleSwitchSelect('stayOnCreate', true)
            }
          }}
          checked={componentState.stayOnCreate}
        />
        <div
          style={{ fontSize: '12px', maxWidth: '512px', paddingLeft: '64px' }}
        >
          After clicking &quot;create&quot; on the image generation page, stay
          on the page, rather than show pending items.
        </div>
      </Section>
      <Section pb={12}>
        <MaxWidth style={{ maxWidth: '240px' }}>
          <SubSectionTitle>
            <strong>Images per page</strong>
          </SubSectionTitle>
          <div className="flex flex-row gap-2 items-center">
            <Select
              options={[
                { value: 25, label: 25 },
                { value: 50, label: 50 },
                { value: 100, label: 100 }
              ]}
              isSearchable={false}
              onChange={(obj: any) => {
                handleUpdateSelect('imagesPerPage', obj)
              }}
              value={{
                value: componentState.imagesPerPage,
                label: componentState.imagesPerPage
              }}
            />
          </div>
        </MaxWidth>
      </Section>
      <Section>
        <SubSectionTitle>
          <strong>Preferred image format</strong>
          <div className="block w-full mt-2 mb-2 text-xs">
            Choose your preferred format when downloading images from ArtBot
          </div>
        </SubSectionTitle>
        <MaxWidth style={{ maxWidth: '240px' }}>
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
      <Section style={{ paddingTop: '24px' }}>
        <InputSwitchV2
          label={<strong>Run in background?</strong>}
          handleSwitchToggle={() => {
            if (componentState.runInBackground) {
              handleSwitchSelect('runInBackground', false)
            } else {
              handleSwitchSelect('runInBackground', true)
            }
          }}
          checked={componentState.runInBackground}
        />
        <div
          style={{ fontSize: '12px', maxWidth: '512px', paddingLeft: '64px' }}
        >
          By default, ArtBot only runs in the active browser tab in order to try
          and help prevent your IP address from being throttled. You may disable
          this behavior if you wish.
        </div>
      </Section>
      <Section>
        <InputSwitchV2
          label={<strong>Enable page swipe on image gallery page?</strong>}
          handleSwitchToggle={() => {
            if (componentState.enableGallerySwipe) {
              handleSwitchSelect('enableGallerySwipe', false)
            } else {
              handleSwitchSelect('enableGallerySwipe', true)
            }
          }}
          checked={componentState.enableGallerySwipe}
        />
        <div
          style={{ fontSize: '12px', maxWidth: '512px', paddingLeft: '64px' }}
        >
          On mobile devices, this option allows you to swipe between full pages
          of images on the <Linker href="/images">images gallery page</Linker>.
        </div>
      </Section>
      <Section>
        <InputSwitchV2
          label={<strong>Disable new image notification?</strong>}
          handleSwitchToggle={() => {
            handleSwitchSelect(
              'disableNewImageNotification',
              !componentState.disableNewImageNotification
            )
          }}
          checked={componentState.disableNewImageNotification}
        />
        <div
          style={{ fontSize: '12px', maxWidth: '512px', paddingLeft: '64px' }}
        >
          This option disabled the new image notification toast that pops up in
          the top right corner of the web app when ArtBot receives a new image
          from the AI Horde backend.
        </div>
      </Section>
      <Section pb={12}>
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
          {processType === 'thumbnails' && totalToProcess > 0 && (
            <div className="block w-full mb-2 text-xs">
              {processState} {currentProcessIdx} of {totalToProcess}{' '}
              {processState === 'Analyzing' ? 'images' : 'thumbnails'}.
            </div>
          )}
        </SubSectionTitle>
        <MaxWidth style={{ maxWidth: '240px' }}>
          <Button
            onClick={() => {
              setProcessType('thumbnails')
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
      <Section pb={12}>
        <SubSectionTitle>
          <strong>Download debugging logs?</strong>
          <div className="block w-full mt-2 mb-2 text-xs">
            This is really only used in case you&apos;re encountering some
            issues with ArtBot and are asked to provide some additional logs.
          </div>
        </SubSectionTitle>
        <MaxWidth style={{ maxWidth: '240px' }}>
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
      <Section pb={12}>
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
        <MaxWidth style={{ maxWidth: '240px' }}>
          <Button
            theme="secondary"
            onClick={() => setComponentState({ showResetConfirmation: true })}
          >
            Reset Preferences?
          </Button>
        </MaxWidth>
      </Section>
      <Section pb={12}>
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
        <MaxWidth style={{ maxWidth: '240px' }}>
          <Button
            theme="secondary"
            onClick={() => {
              localStorage.removeItem('PromptInputSettings')
              window.location.assign(`${window.location.origin}${basePath}`)
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
        <MaxWidth style={{ maxWidth: '240px' }}>
          <Button
            theme="secondary"
            onClick={async () => {
              await db.pending.clear()
              deletePendingJobs()
              window.location.assign(
                `${window.location.origin}${basePath}/pending`
              )
            }}
          >
            Reset Pending Items?
          </Button>
        </MaxWidth>
      </Section>
    </>
  )
}

export default ArtBotSettingsPanel
