'use client'

import {
  IconCalculator,
  IconSettings,
  IconSquarePlus,
  IconTrash
} from '@tabler/icons-react'
import Modal from '../Modal'
import PromptInputSettings from './PromptInputSettings'
import NiceModal from '@ebay/nice-modal-react'

export default function PromptInputActions() {
  return (
    <>
      <Modal id="PromptInputSettings-modal" title="Settings">
        <PromptInputSettings />
        {/* <KeywordsDropdown input={input} setInput={setInput} /> */}
      </Modal>
      <div className="flex justify-between">
        <div>
          <button
            className="btn btn-sm btn-primary btn-square gap-1 normal-case"
            onClick={() => {
              NiceModal.show('PromptInputSettings-modal')
            }}
          >
            <IconSettings stroke={1.5} />{' '}
          </button>
        </div>
        <div className="flex flex-row justify-end gap-2">
          <button
            className="btn btn-sm btn-secondarygap-1 normal-case"
            onClick={() => {
              // NiceModal.show('tags-modal')
            }}
          >
            <IconTrash stroke={1.5} />{' '}
            <span className="hidden sm:block">Reset?</span>
          </button>
          <button
            className="btn btn-sm btn-primary gap-1 normal-case"
            onClick={() => {
              // NiceModal.show('tags-modal')
            }}
          >
            <IconSquarePlus stroke={1.5} />{' '}
            <span className="hidden sm:block">Create</span>
          </button>
          <button
            className="btn btn-sm btn-primary btn-square gap-1 normal-case"
            onClick={() => {
              // NiceModal.show('tags-modal')
            }}
          >
            <IconCalculator stroke={1.5} />{' '}
            {/* <span className="hidden sm:block">Create</span> */}
          </button>
        </div>
      </div>
    </>
  )
}
