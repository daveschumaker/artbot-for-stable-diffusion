import PageTitle from 'app/_components/PageTitle'
import InputSwitchV2 from 'app/_modules/AdvancedOptionsPanel/InputSwitchV2'
import Section from 'app/_components/Section'
import NativeSettingSelect from './NativeSettingSelect'
import { useSettings } from './SettingsContext'
import WorkerPreferences from './WorkerPreferences'
import { useBackupOperation } from './BackupOperations'
export default function GenerationSettingsPanel() {
  const { values, save } = useSettings()
  const { active } = useBackupOperation()
  return (
    <fieldset disabled={!!active} className="min-w-0">
      <PageTitle as="h2">Generation preferences</PageTitle>
      <Section>
        <InputSwitchV2
          label="Allow NSFW images"
          checked={values.allowNsfwImages}
          handleSwitchToggle={() =>
            save('allowNsfwImages', !values.allowNsfwImages)
          }
        />
      </Section>
      <Section>
        <NativeSettingSelect
          label="Max concurrency"
          value={values.maxConcurrency}
          options={[1, 3, 5, 10, 15, 20, 25, 30].map((value) => ({
            value,
            label: value
          }))}
          onChange={(value) => save('maxConcurrency', Number(value))}
        />
        <p className="text-sm">
          Maximum simultaneous requests sent to AI Horde.
        </p>
      </Section>
      <Section>
        <NativeSettingSelect
          label="Worker type"
          value={values.useTrusted ? 'trusted' : 'all'}
          options={[
            { value: 'trusted', label: 'Trusted Only' },
            { value: 'all', label: 'All Workers' }
          ]}
          onChange={(value) => save('useTrusted', value === 'trusted')}
        />
      </Section>
      <Section>
        <InputSwitchV2
          label="Allow slow workers"
          checked={values.slow_workers}
          handleSwitchToggle={() => save('slow_workers', !values.slow_workers)}
        />
        <p className="text-sm">
          Disabling slow workers can increase kudos costs.
        </p>
      </Section>
      <Section>
        <h3 className="font-bold mb-3">Remember after creating</h3>
        <InputSwitchV2
          label="Keep prompt after creating"
          checked={values.savePromptOnCreate}
          handleSwitchToggle={() =>
            save('savePromptOnCreate', !values.savePromptOnCreate)
          }
        />
        <InputSwitchV2
          label="Keep seed after creating"
          checked={values.saveSeedOnCreate}
          handleSwitchToggle={() =>
            save('saveSeedOnCreate', !values.saveSeedOnCreate)
          }
        />
        <InputSwitchV2
          label="Keep canvas after creating"
          checked={values.saveCanvasOnCreate}
          handleSwitchToggle={() =>
            save('saveCanvasOnCreate', !values.saveCanvasOnCreate)
          }
        />
        <InputSwitchV2
          label="Stay on create page"
          checked={values.stayOnCreate}
          handleSwitchToggle={() => save('stayOnCreate', !values.stayOnCreate)}
        />
        <InputSwitchV2
          label="Run in background"
          checked={values.runInBackground}
          handleSwitchToggle={() =>
            save('runInBackground', !values.runInBackground)
          }
        />
        <p className="text-sm">
          Background requests remain subject to browser and iOS suspension.
        </p>
      </Section>
      <WorkerPreferences />
    </fieldset>
  )
}
