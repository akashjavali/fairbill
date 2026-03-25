/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@fairbill/ui', '@fairbill/hooks', '@fairbill/utils', '@fairbill/types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '*.s3.amazonaws.com' },
    ],
  },
}

export default nextConfig
