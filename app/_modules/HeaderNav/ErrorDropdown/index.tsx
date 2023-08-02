import Linker from 'components/UI/Linker'

const ErrorDropdown = () => {
  return (
    <div className="p-[12px] w-full tablet:w-[400px] text-[14px]">
      <div className="font-[700] mb-[8px]">Web App Storage Quota Error</div>
      <div className="font-mono text-[12px] pl-[8px]">
        ArtBot is currently <strong>unable</strong> to write additional data to
        your browser&apos;s storage. This is due to constraints imposed by your
        device operating system.
      </div>
      <div className="font-mono text-[12px] pl-[8px] mt-2">
        Please remove some images from your gallery before continuing.
      </div>
      <div className="font-mono text-[12px] pl-[8px] mt-2">
        View{' '}
        <Linker href="/faq#kudos" passHref>
          this FAQ
        </Linker>{' '}
        for more information.
      </div>
    </div>
  )
}

export default ErrorDropdown
