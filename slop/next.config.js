/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server app (NOT a static export) — runs on Railway with `next start`.
  reactStrictMode: true,
  // This app has its own lockfile; pin the root so Next doesn't infer the
  // parent (GitHub Pages) repo as the workspace root.
  turbopack: { root: __dirname },
  // Keep native/heavy modules out of the server bundle so they load at runtime.
  // ffmpeg-static must stay external so it can resolve its bundled binary via
  // __dirname; archiver is heavy and has no need to be bundled.
  serverExternalPackages: ['sharp', 'exifr', 'bcryptjs', 'ffmpeg-static', 'archiver'],
  eslint: {
    // Linting is run separately; don't fail production builds on lint.
    ignoreDuringBuilds: true,
  },
  // Uploaded media is served from /api/media, so Next's image optimizer is unused.
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
