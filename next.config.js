/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['res.cloudinary.com', 'upload.wikimedia.org'],
  },
  reactStrictMode: true,
  // Optimizations for Bolt Cloud deployment
  productionBrowserSourceMaps: false, // Disable source maps in production
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header
  generateEtags: false, // Disable ETag generation
  swcMinify: true, // Use SWC for minification (faster)
};

module.exports = nextConfig;
