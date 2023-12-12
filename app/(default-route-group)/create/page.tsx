import PageTitle from 'app/_components/PageTitle'
import PromptInputActions from 'app/_componentsV2/PromptInputActions'
import PromptInputCard from 'app/_componentsV2/PromptInputCard'
import { InputProvider } from 'app/_modules/InputProvider/context'

export default async function Page() {
  return (
    <InputProvider>
      <div className="w-full flex flex-row gap-2">
        <div className="w-full">
          <PageTitle>Create new image</PageTitle>
          <PromptInputCard />
          <PromptInputActions />
        </div>
        <div></div>
      </div>
    </InputProvider>
  )
}
