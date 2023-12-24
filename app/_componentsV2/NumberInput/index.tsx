import { IconMinus, IconPlus } from '@tabler/icons-react'

export default function NumberInput({
  max = 10,
  min = 0,
  onChange = () => {},
  onMinusClick = () => {},
  onPlusClick = () => {},
  value
}: {
  max: number
  min: number
  onChange: (e: any) => void
  onMinusClick: () => any
  onPlusClick: () => any
  value: number
}) {
  return (
    <div className="join">
      <button
        className="btn btn-square btn-md md:btn-sm join-item rounded-l-full"
        onClick={onMinusClick}
      >
        <IconMinus stroke={1.5} />
      </button>
      <input
        className="input input-bordered input-md md:input-sm w-[60px] join-item text-center"
        max={max}
        min={min}
        onChange={onChange}
        type="number"
        // placeholder="Type here"
        value={value}
      />
      <button
        className="btn btn-square btn-md md:btn-sm join-item rounded-r-full"
        onClick={onPlusClick}
      >
        <IconPlus stroke={1.5} />
      </button>
    </div>
  )
}
