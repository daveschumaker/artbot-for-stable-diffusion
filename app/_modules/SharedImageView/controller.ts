import { basePath } from 'BASE_PATH'
import { userInfoStore } from 'app/_store/userStore'

export const publishToShowcase = async ({
  shortlink
}: {
  shortlink: string
}) => {
  const { jwt } = userInfoStore.state

  try {
    await fetch(
      `${basePath}/api/admin/showcase-publish?shortlink=${shortlink}`,
      {
        method: 'POST',
        headers: {
          Authorization: jwt as string
        }
      }
    )
  } catch (err) {}
}
