import styles from './progressMeter.module.css'

interface Props {
  current: number
  total: number
}

const ProgressMeter = ({ current, total }: Props) => {
  const pct = Math.floor((current / total) * 100)
  return (
    <div className="flex flex-col w-full items-center px-[8px] text-sm">
      <div>
        Processing image {current} of {total}
      </div>
      <div className="mt-[8px] h-[12px] w-full rounded-[12px] relative overflow-hidden bg-slate-300">
        <div
          className={styles['progress-fill']}
          style={{ width: `${pct}%` }}
        ></div>
      </div>
    </div>
  )
}

export default ProgressMeter
