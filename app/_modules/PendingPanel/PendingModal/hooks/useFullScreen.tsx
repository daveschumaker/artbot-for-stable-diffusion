import { useFullScreenHandle } from 'react-full-screen'

type UseFullScreenReturnType = [() => void]

export default function useFullScreen(): UseFullScreenReturnType {
  const showFullScreen = useFullScreenHandle()

  const onFullscreenClick = () => {}

  return [onFullscreenClick]
}
