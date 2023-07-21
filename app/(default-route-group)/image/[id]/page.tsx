import ImagePage from 'app/_pages/ImagePage'

export default function Page({ params }: { params: { id: string } }) {
  return <ImagePage id={params.id} />
}
