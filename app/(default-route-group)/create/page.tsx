import PageTitle from 'app/_components/PageTitle'
import ImageDimensions from 'app/_componentsV2/AdvancedOptionsPanel/ImageDimensions'
import ImageEmbeddings from 'app/_componentsV2/AdvancedOptionsPanel/ImageEmbeddings'
import ImageParameters from 'app/_componentsV2/AdvancedOptionsPanel/ImageParameters'
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
          <ImageParameters />
          <ImageDimensions />
          <ImageEmbeddings />
        </div>
        <div></div>
      </div>
    </InputProvider>
  )
}
