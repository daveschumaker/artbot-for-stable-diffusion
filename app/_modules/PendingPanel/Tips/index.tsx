/* eslint-disable @next/next/no-img-element */
import { basePath } from 'BASE_PATH'
import { getRandomTip } from './tipsController'
import React from 'react'
import Linker from 'app/_components/Linker'

const PendingTips = React.memo(() => {
  const tip = getRandomTip()

  if (!tip) return null

  return (
    <div className="w-full p-2 bg-slate-300 rounded-sm text-black">
      <div className="flex flex-row gap-2 font-bold items-center mb-2">
        <img
          src={`${basePath}/artbot-logo.png`}
          height={30}
          width={30}
          alt="AI ArtBot logo"
          className="min-w-[30px] max-w-[30px]"
        />
        ArtBot tip:
      </div>
      <div className="text-xs">{tip.content}</div>
      {tip.linkTitle && (
        <div className="text-xs mt-2">
          <Linker href={tip.linkUrl}>{tip.linkTitle}</Linker>
        </div>
      )}
    </div>
  )
})

PendingTips.displayName = 'PendingTips'
export default PendingTips
