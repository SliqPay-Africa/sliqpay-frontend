/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { 
    unoptimized: true 
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['sliqpay-frontend.vercel.app', 'localhost:3000']
    }
  },
  // Disable devtools to prevent RSC bundler issues
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right'
  },
};

module.exports = nextConfig;
