import { useId } from 'react'
export default function NativeSettingSelect({
  label,
  value,
  options,
  onChange,
  disabled = false
}: {
  label: string
  value: string | number
  options: { value: string | number; label: string | number }[]
  onChange(value: string): void
  disabled?: boolean
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold">
        {label}
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="block w-full max-w-xs rounded border border-gray-400 bg-white text-gray-900 p-2 my-2 dark:bg-gray-800 dark:text-gray-100"
      >
        {!options.some((option) => String(option.value) === String(value)) && (
          <option value={value}>{value}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
