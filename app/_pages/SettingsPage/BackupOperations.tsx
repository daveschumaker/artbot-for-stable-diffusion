'use client'
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  ReactNode
} from 'react'

function useOperationState() {
  const [active, setActive] = useState<string | null>(null)
  const owner = useRef<symbol | null>(null)
  const begin = useCallback((label: string) => {
    if (owner.current) return null
    const token = Symbol(label)
    owner.current = token
    setActive(label)
    return () => {
      if (owner.current !== token) return
      owner.current = null
      setActive(null)
    }
  }, [])
  return { active, begin }
}
const Operations = createContext<ReturnType<typeof useOperationState> | null>(
  null
)
export function BackupOperations({ children }: { children: ReactNode }) {
  const state = useOperationState()
  return (
    <Operations.Provider value={state}>
      {state.active && (
        <p
          role="status"
          aria-label="Current backup operation"
          className="my-4 rounded-lg border border-teal-500 p-3 text-sm"
        >
          {state.active}… Keep ArtBot visible until this finishes.
        </p>
      )}
      {children}
    </Operations.Provider>
  )
}
export function useBackupOperation() {
  const shared = useContext(Operations)
  const local = useOperationState()
  return shared || local
}
