import { IconAffiliate } from '@tabler/icons-react'

export default function ImageEmbeddings() {
  return (
    <>
      <details
        className="collapse collapse-arrow mb-5"
        // open={negativePanelOpen}
      >
        <summary className="collapse-title text-xl font-medium p-0 py-1 min-h-0">
          <div className="flex flex-row gap-1 items-center text-left text-sm font-[600] w-full select-none">
            <IconAffiliate stroke={1.5} size={20} />
            Embeddings{' '}
          </div>
        </summary>
        <div className={'collapse-content mt-2 p-0 w-full'}>Hello.</div>
      </details>
    </>
  )
}
