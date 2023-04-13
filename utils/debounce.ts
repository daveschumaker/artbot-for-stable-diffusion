export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...funcArgs: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>): void {
    const context = this

    const later = () => {
      timeout = null
      func.apply(context, args)
    }

    if (timeout !== null) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(later, wait)
  }
}
