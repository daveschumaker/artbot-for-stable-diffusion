import { NextResponse } from 'next/server'

// ArtBot doesn't use next/image, so Next's Image Optimization API is disabled
// to keep it from being attacked. It has had unauthenticated RCE advisories.
export const config = {
  matcher: '/_next/image'
}

export const proxy = () => new NextResponse(null, { status: 404 })
