import PageTitle from 'app/_components/PageTitle'
import Section from 'app/_components/Section'
import InputSwitchV2 from 'app/_modules/AdvancedOptionsPanel/InputSwitchV2'
import NativeSettingSelect from './NativeSettingSelect'
import { useSettings } from './SettingsContext'
import { useBackupOperation } from './BackupOperations'
import type { SettingsValues } from 'app/_data-models/settingsSchema'
export default function ArtBotSettingsPanel() {
  const { values, save } = useSettings()
  const { active } = useBackupOperation()
  return (
    <fieldset disabled={!!active} className="min-w-0">
      <PageTitle as="h2">ArtBot Preferences</PageTitle>
      <Section>
        <NativeSettingSelect
          label="ArtBot Theme"
          value={values.theme}
          options={['system', 'light', 'dark'].map((value) => ({
            value,
            label: value
          }))}
          onChange={(value) => save('theme', value as SettingsValues['theme'])}
        />
      </Section>
      <Section>
        <NativeSettingSelect
          label="Images per page"
          value={values.imagesPerPage}
          options={[25, 50, 100].map((value) => ({ value, label: value }))}
          onChange={(value) => save('imagesPerPage', Number(value))}
        />
      </Section>
      <Section>
        <NativeSettingSelect
          label="Preferred image format"
          value={values.imageDownloadFormat}
          options={['jpg', 'png', 'webp'].map((value) => ({
            value,
            label: value
          }))}
          onChange={(value) =>
            save(
              'imageDownloadFormat',
              value as SettingsValues['imageDownloadFormat']
            )
          }
        />
      </Section>
      <Section>
        <InputSwitchV2
          label="Enable page swipe on image gallery page"
          checked={values.enableGallerySwipe}
          handleSwitchToggle={() =>
            save('enableGallerySwipe', !values.enableGallerySwipe)
          }
        />
      </Section>
      <Section>
        <InputSwitchV2
          label="Disable new image notification"
          checked={values.disableNewImageNotification}
          handleSwitchToggle={() =>
            save(
              'disableNewImageNotification',
              !values.disableNewImageNotification
            )
          }
        />
      </Section>
    </fieldset>
  )
}
