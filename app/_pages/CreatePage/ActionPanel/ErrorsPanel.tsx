export default function ErrorsPanel({ inputErrors }: { inputErrors: any }) {
  if (!inputErrors || typeof inputErrors === 'boolean') return null

  return (
    <div>
      {inputErrors &&
        Object.keys(inputErrors).map((key: string) => {
          return (
            <div key={key} className="text-sm font-600 mb-2">
              {inputErrors[key]}
            </div>
          )
        })}
    </div>
  )
}
