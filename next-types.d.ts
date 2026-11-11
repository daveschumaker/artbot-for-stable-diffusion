// Next.js writes next-env.d.ts on `next dev` or `next build`, and git ignores
// it. These references are what the type check needs from it (for example,
// image imports), so `npm run typecheck` works on a fresh checkout too.
/// <reference types="next" />
/// <reference types="next/image-types/global" />
