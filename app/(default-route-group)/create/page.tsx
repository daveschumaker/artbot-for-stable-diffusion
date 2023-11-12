import {
  IconBook,
  IconCamera,
  IconCodePlus,
  IconPlaylistAdd,
  IconPlaylistX,
  IconTags
} from '@tabler/icons-react'
import PageTitle from 'app/_components/PageTitle'
import { Label } from 'app/_componentsV2/Label'
import { Tooltip } from 'app/_componentsV2/Tooltip'

export default async function Page() {
  return (
    <div className="w-full flex flex-row gap-2">
      <div>
        <PageTitle>Create</PageTitle>
        <div className="card bg-base-200 text-primary-content shadow-xl dark:text-white">
          <div className="card-body p-2">
            <Label
              // className="text-white"
              text={
                <>
                  <IconPlaylistAdd /> Prompt
                </>
              }
            />
            <textarea
              className="textarea textarea-primary text-black dark:text-white"
              placeholder="Bio"
            ></textarea>
            <div className="flex flex-row w-full gap-1">
              <button className="btn btn-sm btn-square btn-primary">
                <IconCodePlus stroke={1.5} />
              </button>
              <button className="btn btn-sm btn-primary gap-1 normal-case">
                <IconBook stroke={1.5} /> Prompts
              </button>
              <button className="btn btn-sm btn-primary gap-1 normal-case">
                <IconTags stroke={1.5} /> Tags
              </button>
              <button className="btn btn-sm btn-primary gap-1 normal-case">
                <IconCamera stroke={1.5} /> Presets
              </button>
            </div>
            <details className="collapse bg-base-200">
              <summary className="collapse-title text-xl font-medium p-0">
                <div className="flex flex-row gap-1 items-center text-left text-sm font-[600] w-full">
                  <IconPlaylistX /> Negative Prompt
                </div>
              </summary>
              <div className="collapse-content">
                <p>content</p>
              </div>
            </details>
            <h2 className="card-title">Card title!</h2>
            <p>If a dog chews shoes whose shoes does he choose?</p>
            <div className="card-actions justify-end">
              <button className="btn">Buy Now</button>
            </div>
          </div>
        </div>
      </div>
      <div></div>
    </div>
  )
}
