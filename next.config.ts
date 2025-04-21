import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  redirects: async () => {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
