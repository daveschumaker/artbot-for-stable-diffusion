import { IconPointFilled } from '@tabler/icons-react'

export default function ErrorsPanel({ inputErrors }: { inputErrors: any }) {
  if (!inputErrors || typeof inputErrors === 'boolean') return null

  return (
    <div>
      <ul>
        {inputErrors &&
          Object.keys(inputErrors).map((key: string) => {
            return (
              <li
                key={key}
                className="text-sm font-600 mb-2 flex flex-row gap-2"
              >
                <IconPointFilled size={16} /> {inputErrors[key]}
              </li>
            )
          })}
      </ul>
    </div>
  )
}
