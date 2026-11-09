import { NextResponse } from 'next/server'

// Next's Image Optimization API has unauthenticated RCE advisories that are only
// fixed in Next 15. ArtBot doesn't use next/image, so the endpoint is disabled.
// See S1 in ISSUES.md, and remove this after the Next 15 upgrade.
export const config = {
  matcher: '/_next/image'
}

export const middleware = () => new NextResponse(null, { status: 404 })
